export type SpaceCategory =
  | 'private_room'
  | 'shared_room'
  | 'study_room'
  | 'work_desk'
  | 'living_room'
  | 'guest_room'
  | 'apartment_space'
  | 'parking_space'
  | 'meeting_space'
  | 'gaming_room'
  | 'office_desk'
  | 'recording_room'
  | 'mini_gym'
  | 'photography_studio'
  | 'project_room'
  | 'club_space'
  | 'lab_space'
  | 'other';

export type UserRole = 'guest' | 'host' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  bio?: string;
  city: string;
  preferredLanguage: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  trustScore: number; // 0 - 100
  badges?: string[];
  createdAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'general' | 'study' | 'work' | 'comfort' | 'safety';
}

export interface SpaceImage {
  id: string;
  spaceId: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
}

export interface Space {
  id: string;
  hostId: string;
  host?: UserProfile;
  title: string;
  description: string;
  category: SpaceCategory;
  hourlyPrice: number;
  dailyMaxPrice?: number;
  cleaningFee: number;
  minHours: number;
  maxHours: number;
  bufferMinutes: number;
  instantBooking: boolean;
  
  // Location
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  approxLatitude: number;
  approxLongitude: number;
  
  maxCapacity: number;
  isPoolable?: boolean;
  houseRules: string[];
  entryInstructions?: string;
  isActive: boolean;
  isAvailableNow?: boolean;
  isFlashSpace?: boolean;
  spaceScore?: number; // 0 - 100
  
  images: SpaceImage[];
  amenities: Amenity[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  spaceId: string;
  dayOfWeek?: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  customDate?: string; // YYYY-MM-DD
  startTime: string; // HH:mm format e.g. "14:00"
  endTime: string;   // HH:mm format e.g. "18:00"
  customHourlyPrice?: number;
  isBlocked?: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string;
  spaceId: string;
  space?: Space;
  guestId: string;
  guest?: UserProfile;
  hostId: string;
  host?: UserProfile;
  
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm format e.g. "15:00"
  endTime: string;     // HH:mm format e.g. "17:00"
  durationHours: number;
  pooledSpots?: number;
  
  hourlyRate: number;
  basePrice: number;
  cleaningFee: number;
  platformFee: number;
  totalPrice: number;
  hostEarning: number;
  
  status: BookingStatus;
  qrCodeData: string;
  checkedInAt?: string;
  specialRequests?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  spaceId: string;
  reviewerId: string;
  reviewer?: UserProfile;
  revieweeId: string;
  rating: number; // 1-5
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  valueRating?: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  spaceId?: string;
  bookingId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_confirmed' | 'payment_success' | 'checkin_reminder' | 'review_request' | 'payout_processed';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchFilters {
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  category: SpaceCategory | 'all';
  minPrice: number;
  maxPrice: number;
  instantOnly: boolean;
  amenities: string[];
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'nearest';
}
