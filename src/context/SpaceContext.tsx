import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Space, Booking, AvailabilitySlot, SearchFilters, Review, NotificationItem } from '../types';
import { MOCK_SPACES, MOCK_BOOKINGS, MOCK_AVAILABILITY, MOCK_REVIEWS, MOCK_NOTIFICATIONS } from '../data/mockData';
import { isSpaceSlotAvailable, calculatePriceBreakdown } from '../lib/bookingEngine';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface SpaceContextType {
  spaces: Space[];
  bookings: Booking[];
  availabilitySlots: AvailabilitySlot[];
  reviews: Review[];
  notifications: NotificationItem[];
  favorites: string[];
  platformFeePercentage: number;
  
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetFilters: () => void;
  
  toggleFavorite: (spaceId: string) => void;
  createBooking: (
    spaceId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    specialRequests?: string,
    pooledSpots?: number
  ) => { success: boolean; booking?: Booking; error?: string };
  
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  addSpace: (newSpace: Omit<Space, 'id' | 'createdAt' | 'averageRating' | 'totalReviews'>) => Space;
  addReview: (bookingId: string, rating: number, comment: string) => void;
  updatePlatformFee: (fee: number) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  location: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '14:00',
  endTime: '17:00',
  category: 'all',
  minPrice: 0,
  maxPrice: 1000,
  instantOnly: false,
  amenities: [],
  sortBy: 'recommended',
};

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem('spaceshare_spaces');
    return saved ? JSON.parse(saved) : MOCK_SPACES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('spaceshare_bookings');
    return saved ? JSON.parse(saved) : MOCK_BOOKINGS;
  });

  const [availabilitySlots] = useState<AvailabilitySlot[]>(() => {
    const saved = localStorage.getItem('spaceshare_availability');
    return saved ? JSON.parse(saved) : MOCK_AVAILABILITY;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('spaceshare_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('spaceshare_favorites');
    return saved ? JSON.parse(saved) : ['sp_101'];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [platformFeePercentage, setPlatformFeePercentage] = useState<number>(6.5);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    localStorage.setItem('spaceshare_spaces', JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem('spaceshare_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('spaceshare_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const toggleFavorite = (spaceId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(spaceId);
      if (isFav) {
        showToast('Removed from saved spaces', 'info');
        return prev.filter((id) => id !== spaceId);
      } else {
        showToast('Saved to your favorites!', 'success');
        return [...prev, spaceId];
      }
    });
  };

  const createBooking = (
    spaceId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    specialRequests?: string,
    pooledSpots?: number
  ) => {
    const targetSpace = spaces.find((s) => s.id === spaceId);
    if (!targetSpace) {
      return { success: false, error: 'Space not found' };
    }

    if (!user) {
      return { success: false, error: 'Please sign in to make a booking' };
    }

    const check = isSpaceSlotAvailable(
      spaceId,
      bookingDate,
      startTime,
      endTime,
      bookings,
      availabilitySlots,
      targetSpace.bufferMinutes,
      targetSpace.isPoolable,
      targetSpace.maxCapacity,
      pooledSpots || targetSpace.maxCapacity
    );

    if (!check.available) {
      showToast(check.reason || 'Time slot unavailable', 'error');
      return { success: false, error: check.reason };
    }

    const startMins = Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]);
    const endMins = Number(endTime.split(':')[0]) * 60 + Number(endTime.split(':')[1]);
    const durationHours = Number(((endMins - startMins) / 60).toFixed(2));

    const effectiveHourlyRate = (targetSpace.isPoolable && pooledSpots)
      ? (targetSpace.hourlyPrice / targetSpace.maxCapacity) * pooledSpots
      : targetSpace.hourlyPrice;

    const priceDetails = calculatePriceBreakdown(
      effectiveHourlyRate,
      durationHours,
      targetSpace.cleaningFee,
      platformFeePercentage
    );

    const bookingCode = `SS-${Math.floor(10000 + Math.random() * 90000)}`;
    const qrCodeData = `SS-BOOKING-${bookingCode}-KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      bookingCode,
      spaceId: targetSpace.id,
      space: targetSpace,
      guestId: user.id,
      guest: user,
      hostId: targetSpace.hostId,
      host: targetSpace.host,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      hourlyRate: priceDetails.hourlyRate,
      basePrice: priceDetails.basePrice,
      cleaningFee: priceDetails.cleaningFee,
      platformFee: priceDetails.platformFee,
      totalPrice: priceDetails.totalPrice,
      hostEarning: priceDetails.hostEarning,
      status: targetSpace.instantBooking ? 'confirmed' : 'pending',
      qrCodeData,
      specialRequests,
      pooledSpots: targetSpace.isPoolable ? (pooledSpots || targetSpace.maxCapacity) : undefined,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: targetSpace.instantBooking ? 'Booking Instant Confirmed!' : 'Booking Request Sent',
      message: `SpaceShare ${bookingCode} for ${targetSpace.title} on ${bookingDate} (${startTime} - ${endTime}).`,
      type: 'booking_confirmed',
      isRead: false,
      createdAt: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Booking ${bookingCode} reserved successfully!`, 'success');
    return { success: true, booking: newBooking };
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updated = { ...b, status };
          if (status === 'checked_in') {
            updated.checkedInAt = new Date().toISOString();
          }
          return updated;
        }
        return b;
      })
    );
    showToast(`Booking status updated to ${status}`, 'info');
  };

  const addSpace = (newSpaceData: Omit<Space, 'id' | 'createdAt' | 'averageRating' | 'totalReviews'>) => {
    const spaceId = `sp_${Date.now()}`;
    const fullSpace: Space = {
      ...newSpaceData,
      id: spaceId,
      averageRating: 5.0,
      totalReviews: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSpaces((prev) => [fullSpace, ...prev]);
    showToast('Your space listing has been published!', 'success');
    return fullSpace;
  };

  const addReview = (bookingId: string, rating: number, comment: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || !user) return;

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      bookingId,
      spaceId: booking.spaceId,
      reviewerId: user.id,
      reviewer: user,
      revieweeId: booking.hostId,
      rating,
      comment,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReviews((prev) => [newRev, ...prev]);

    setSpaces((prev) =>
      prev.map((sp) => {
        if (sp.id === booking.spaceId) {
          const spaceRevs = [...reviews.filter((r) => r.spaceId === sp.id), newRev];
          const avg = spaceRevs.reduce((acc, curr) => acc + curr.rating, 0) / spaceRevs.length;
          return {
            ...sp,
            averageRating: Number(avg.toFixed(2)),
            totalReviews: spaceRevs.length,
          };
        }
        return sp;
      })
    );

    showToast('Thank you for leaving a review!', 'success');
  };

  const updatePlatformFee = (fee: number) => {
    setPlatformFeePercentage(fee);
    showToast(`Platform fee updated to ${fee}%`, 'info');
  };

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        bookings,
        availabilitySlots,
        reviews,
        notifications,
        favorites,
        platformFeePercentage,
        filters,
        setFilters,
        resetFilters,
        toggleFavorite,
        createBooking,
        updateBookingStatus,
        addSpace,
        addReview,
        updatePlatformFee,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpace must be used within SpaceProvider');
  }
  return context;
};
