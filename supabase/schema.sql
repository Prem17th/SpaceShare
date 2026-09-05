-- =======================================================
-- SPACESHARE SUPABASE DATABASE SCHEMA MIGRATION
-- Production-Ready Schema for Time-Based Space Marketplace
-- =======================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE space_category AS ENUM (
  'private_room',
  'shared_room',
  'study_room',
  'work_desk',
  'living_room',
  'guest_room',
  'apartment_space',
  'parking_space',
  'meeting_space',
  'other'
);

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'active',
  'completed',
  'cancelled',
  'rejected'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'held',
  'released',
  'refunded',
  'failed'
);

CREATE TYPE payout_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE user_role AS ENUM (
  'guest',
  'host',
  'admin'
);

-- 2. PROFILES TABLE (Extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  city VARCHAR(100),
  preferred_language VARCHAR(50) DEFAULT 'English',
  role user_role DEFAULT 'guest',
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_id_verified BOOLEAN DEFAULT FALSE,
  trust_score INTEGER DEFAULT 75 CHECK (trust_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SPACES TABLE (Listings)
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category space_category NOT NULL,
  hourly_price DECIMAL(10, 2) NOT NULL CHECK (hourly_price >= 0),
  daily_max_price DECIMAL(10, 2),
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  min_hours INTEGER DEFAULT 1 CHECK (min_hours >= 1),
  max_hours INTEGER DEFAULT 12,
  buffer_minutes INTEGER DEFAULT 15,
  instant_booking BOOLEAN DEFAULT TRUE,
  
  -- Address (Privacy protected: exact address hidden until confirmed booking)
  address_line TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  approx_latitude DOUBLE PRECISION NOT NULL,
  approx_longitude DOUBLE PRECISION NOT NULL,
  
  max_capacity INTEGER DEFAULT 1 CHECK (max_capacity >= 1),
  house_rules TEXT,
  entry_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(3, 2) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SPACE IMAGES TABLE
CREATE TABLE space_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AMENITIES DICTIONARY & SPACE AMENITIES M2M
CREATE TABLE amenities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(50) DEFAULT 'general'
);

CREATE TABLE space_amenities (
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  amenity_id VARCHAR(50) NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (space_id, amenity_id)
);

-- 6. AVAILABILITY TABLE (Recurring & Custom Date Time Slots)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- Nullable if custom_date is set
  custom_date DATE, -- Nullable if recurring day_of_week is set
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  custom_hourly_price DECIMAL(10, 2), -- Custom pricing override for specific dates
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_availability_type CHECK (
    (day_of_week IS NOT NULL AND custom_date IS NULL) OR
    (day_of_week IS NULL AND custom_date IS NOT NULL)
  )
);

-- 7. BOOKINGS TABLE (Core Time-Slot Booking Record)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL,
  
  hourly_rate DECIMAL(10, 2) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  cleaning_fee DECIMAL(10, 2) DEFAULT 0,
  platform_fee DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  host_earning DECIMAL(10, 2) NOT NULL,
  
  status booking_status DEFAULT 'pending',
  qr_code_data TEXT NOT NULL,
  checked_in_at TIMESTAMPTZ,
  special_requests TEXT,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS TABLE
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. HOST PAYOUTS TABLE
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status payout_status DEFAULT 'pending',
  payout_method VARCHAR(50) DEFAULT 'UPI',
  payout_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MESSAGES TABLE (In-App Chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- e.g., 'booking_request', 'payment_success', 'checkin_reminder'
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FAVORITES TABLE
CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, space_id)
);

-- 14. REPORTS & SAFETY TABLE
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. VERIFICATION REQUESTS
CREATE TABLE verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  id_type VARCHAR(50) NOT NULL, -- e.g., 'Aadhaar', 'Driving License', 'Student ID'
  document_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ADMIN ACTIONS TABLE
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  target_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public profile fields, user can edit own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Spaces: Anyone can view active spaces; Hosts can CRUD their own spaces
CREATE POLICY "Active spaces are viewable by everyone" ON spaces FOR SELECT USING (is_active = true OR auth.uid() = host_id);
CREATE POLICY "Hosts can insert spaces" ON spaces FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own spaces" ON spaces FOR UPDATE USING (auth.uid() = host_id);

-- Bookings: Guests and Hosts of the booking can view/manage
CREATE POLICY "Users can view bookings they are involved in" ON bookings 
  FOR SELECT USING (auth.uid() = guest_id OR auth.uid() = host_id);

CREATE POLICY "Guests can create bookings" ON bookings 
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Guests or Hosts can update their booking" ON bookings 
  FOR UPDATE USING (auth.uid() = guest_id OR auth.uid() = host_id);

-- Messages: Sender or Receiver can view messages
CREATE POLICY "Users can view their messages" ON messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
