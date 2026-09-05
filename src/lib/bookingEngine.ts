import type { Booking, AvailabilitySlot, SpaceCategory } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function calculateDurationHours(startTime: string, endTime: string): number {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  if (endMins <= startMins) return 0;
  return Number(((endMins - startMins) / 60).toFixed(2));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface PriceBreakdown {
  hourlyRate: number;
  durationHours: number;
  basePrice: number;
  cleaningFee: number;
  platformFee: number;
  totalPrice: number;
  hostEarning: number;
}

export function calculatePriceBreakdown(
  hourlyRate: number,
  durationHours: number,
  cleaningFee: number = 0,
  platformFeeRatePercentage: number = 6.5
): PriceBreakdown {
  const basePrice = Math.round(hourlyRate * durationHours);
  const platformFee = Math.max(15, Math.round(basePrice * (platformFeeRatePercentage / 100)));
  const totalPrice = basePrice + cleaningFee + platformFee;
  const hostEarning = basePrice + cleaningFee;

  return {
    hourlyRate,
    durationHours,
    basePrice,
    cleaningFee,
    platformFee,
    totalPrice,
    hostEarning,
  };
}

export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
  bufferMinutes: number = 0
): boolean {
  const aStart = timeToMinutes(startA) - bufferMinutes;
  const aEnd = timeToMinutes(endA) + bufferMinutes;
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

export function isSpaceSlotAvailable(
  spaceId: string,
  requestedDate: string,
  requestedStart: string,
  requestedEnd: string,
  existingBookings: Booking[],
  availabilitySlots: AvailabilitySlot[],
  bufferMinutes: number = 15,
  isPoolable: boolean = false,
  maxCapacity: number = 1,
  requestedSpots: number = 1
): { available: boolean; reason?: string } {
  const duration = calculateDurationHours(requestedStart, requestedEnd);
  if (duration <= 0) {
    return { available: false, reason: 'End time must be after start time' };
  }

  const dateBookings = existingBookings.filter(
    (b) =>
      b.spaceId === spaceId &&
      b.bookingDate === requestedDate &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected'
  );

  let maxOverlappingSpots = 0;

  for (const booking of dateBookings) {
    if (isTimeOverlapping(requestedStart, requestedEnd, booking.startTime, booking.endTime, bufferMinutes)) {
      if (!isPoolable) {
        return {
          available: false,
          reason: `This space is already booked from ${booking.startTime} to ${booking.endTime}`,
        };
      } else {
        maxOverlappingSpots += (booking.pooledSpots || maxCapacity);
      }
    }
  }

  if (isPoolable && (maxOverlappingSpots + requestedSpots > maxCapacity)) {
    return {
      available: false,
      reason: `Only ${Math.max(0, maxCapacity - maxOverlappingSpots)} spots remaining during this time slot`,
    };
  }

  const dateObj = new Date(requestedDate);
  const dayOfWeek = dateObj.getDay();

  const relevantSlots = availabilitySlots.filter((slot) => {
    if (slot.spaceId !== spaceId) return false;
    if (slot.isBlocked) return false;
    if (slot.customDate && slot.customDate === requestedDate) return true;
    if (slot.dayOfWeek !== undefined && slot.dayOfWeek === dayOfWeek) return true;
    return false;
  });

  if (relevantSlots.length > 0) {
    const reqStartMins = timeToMinutes(requestedStart);
    const reqEndMins = timeToMinutes(requestedEnd);

    const isWithinAnySlot = relevantSlots.some((slot) => {
      const slotStartMins = timeToMinutes(slot.startTime);
      const slotEndMins = timeToMinutes(slot.endTime);
      return reqStartMins >= slotStartMins && reqEndMins <= slotEndMins;
    });

    if (!isWithinAnySlot) {
      return {
        available: false,
        reason: 'Host is not available during the selected hours for this date',
      };
    }
  }

  return { available: true };
}

export function getRecommendedHourlyPrice(
  category: SpaceCategory,
  city: string,
  capacity: number = 1
): number {
  const basePrices: Record<SpaceCategory, number> = {
    work_desk: 80,
    study_room: 100,
    shared_room: 120,
    private_room: 180,
    meeting_space: 250,
    apartment_space: 350,
    living_room: 150,
    guest_room: 200,
    parking_space: 50,
    gaming_room: 200,
    office_desk: 150,
    recording_room: 300,
    mini_gym: 150,
    photography_studio: 400,
    project_room: 100,
    club_space: 250,
    lab_space: 350,
    other: 100,
  };

  const cityMultiplier: Record<string, number> = {
    Bengaluru: 1.2,
    Mumbai: 1.35,
    Delhi: 1.25,
    Hyderabad: 1.1,
    Pune: 1.0,
    Chennai: 1.05,
    Kolkata: 0.9,
  };

  const base = basePrices[category] || 120;
  const mult = cityMultiplier[city] || 1.0;
  const capacityBonus = Math.max(0, (capacity - 1) * 20);

  return Math.round(base * mult + capacityBonus);
}
