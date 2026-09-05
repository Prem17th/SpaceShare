import React, { useState } from 'react';
import { useSpace } from '../context/SpaceContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { calculateDurationHours, calculatePriceBreakdown, formatINR } from '../lib/bookingEngine';
import { processRazorpayPayment } from '../lib/razorpay';
import { MapPin, ShieldCheck, Heart, Clock, Calendar, CheckCircle2, Sparkles, Lock, Star, Share2 } from 'lucide-react';

interface SpaceDetailsPageProps {
  spaceId: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const SpaceDetailsPage: React.FC<SpaceDetailsPageProps> = ({ spaceId, onNavigate }) => {
  const { spaces, createBooking, favorites, toggleFavorite } = useSpace();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const space = spaces.find((s) => s.id === spaceId) || spaces[0];

  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isPooling, setIsPooling] = useState(false);
  const [pooledSpots, setPooledSpots] = useState(1);

  // Guest Details State
  const [guestName, setGuestName] = useState(user?.fullName || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestAge, setGuestAge] = useState('');
  const [guestPurpose, setGuestPurpose] = useState('');

  const durationHours = calculateDurationHours(startTime, endTime);
  
  const effectiveHourlyRate = isPooling 
    ? (space.hourlyPrice / space.maxCapacity) * pooledSpots
    : space.hourlyPrice;
  const priceDetails = calculatePriceBreakdown(effectiveHourlyRate, durationHours, space.cleaningFee);

  const isFav = favorites.includes(space.id);

  const handleInitialBookClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (durationHours <= 0) {
      showToast('End time must be later than start time', 'error');
      return;
    }
    if (durationHours < space.minHours) {
      showToast(`Minimum booking duration for this space is ${space.minHours} hours`, 'error');
      return;
    }
    setShowGuestForm(true);
  };

  const handleFinalReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone || !guestAge || !guestPurpose) {
      showToast('Please fill out all contact and purpose details', 'error');
      return;
    }
    
    setShowGuestForm(false);
    setIsProcessingPayment(true);

      processRazorpayPayment(
      priceDetails.totalPrice,
      space.title,
      { name: guestName, email: guestEmail, phone: guestPhone },
      () => {
        setIsProcessingPayment(false);
        const res = createBooking(
          space.id,
          bookingDate,
          startTime,
          endTime,
          `Purpose: ${guestPurpose} | Age: ${guestAge}`,
          isPooling ? pooledSpots : undefined
        );
        if (res.success && res.booking) {
          showToast(`Confirmation email sent to ${guestEmail}!`, 'success');
          onNavigate('bookings');
        }
      },
      () => {
        setIsProcessingPayment(false);
        showToast('Payment processing failed. Please try again.', 'error');
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Title & Actions Bar */}
        <div className="space-y-3">
          <div className="mb-4">
            <button 
              onClick={() => onNavigate('search')}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to search
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{space.title}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Listing link copied to clipboard!', 'info');
                }}
                className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs"
                title="Share Listing"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(space.id)}
                className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs"
                title="Save Favorite"
              >
                <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="bg-brand-50 text-brand-700 font-extrabold px-2.5 py-0.5 rounded-full border border-brand-200 uppercase tracking-wider text-[10px]">
              {space.category.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-900">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {space.averageRating} ({space.totalReviews} reviews)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-600" /> {space.addressLine}, {space.city}</span>
          </div>
        </div>

        {/* Hero Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 h-[50vh] min-h-[400px] rounded-[2rem] overflow-hidden shadow-xl border border-slate-200/50">
          <div className="relative h-full">
            <img
              src={space.images[0]?.imageUrl}
              alt={space.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
            {space.isAvailableNow && (
              <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-2 shadow-lg animate-pulse">
                🟢 AVAILABLE NOW
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="h-full overflow-hidden rounded-2xl">
              <img
                src={space.images[1]?.imageUrl || space.images[0]?.imageUrl}
                alt=""
                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
              />
            </div>
            <div className="h-full overflow-hidden rounded-2xl">
              <img
                src={space.images[2]?.imageUrl || space.images[0]?.imageUrl}
                alt=""
                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Host Card Header */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={space.host?.avatarUrl}
                    alt={space.host?.fullName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900">Hosted by {space.host?.fullName}</h3>
                    {space.host?.badges?.map((badge, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">{space.host?.bio}</p>
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <div className="text-lg font-black text-amber-600">★ {space.averageRating}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{space.totalReviews} reviews</div>
                {space.spaceScore && (
                  <div className="mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> SpaceScore: {space.spaceScore}/100
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-lg text-slate-900">About this Space</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{space.description}</p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900">Amenities & Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {space.amenities.map((am) => (
                  <div key={am.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3 text-xs font-semibold text-slate-800 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>{am.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-lg text-slate-900">Host Guidelines</h3>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs text-amber-900">
                {space.houseRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cancellation & Refund Policy */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">Cancellation & Refund Policy</h3>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-3">
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Flexible Cancellation (SpaceShare Default)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                      Cancel up to <strong>2 hours before</strong> your start time for a full refund of the base price. The SpaceShare platform fee is non-refundable. Cancellations within 2 hours are non-refundable.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Shield */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-brand-300 uppercase tracking-wider">
                <Lock className="w-4 h-4" /> Host Privacy Shield
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                To protect host privacy, exact door numbers and street access details are held securely and automatically unlocked on your booking pass right after confirmation.
              </p>
            </div>

          </div>

          {/* Right Floating Reservation Widget */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl sticky top-24 space-y-6">
              
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-3xl font-black text-slate-900">₹{effectiveHourlyRate}</span>
                  <span className="text-xs text-slate-500 font-medium"> / hour</span>
                </div>
                <div className="text-xs text-slate-500 font-medium text-right">
                  <div>Min booking: <span className="font-extrabold text-slate-900">{space.minHours} hrs</span></div>
                  <div>Capacity: <span className="font-extrabold text-slate-900">{space.maxCapacity} people</span></div>
                </div>
              </div>

              <form onSubmit={handleInitialBookClick} className="space-y-4">
                
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                  <div className="grid grid-cols-1 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-brand-600 absolute left-3 top-3" />
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-transparent bg-white text-xs font-bold text-slate-800 shadow-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Clock className="w-4 h-4 text-brand-600 absolute left-3 top-3" />
                        <input
                          type="time"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-transparent bg-white text-xs font-bold text-slate-800 shadow-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-brand-600 absolute left-3 top-3" />
                        <input
                          type="time"
                          required
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-transparent bg-white text-xs font-bold text-slate-800 shadow-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {space.isPoolable && space.maxCapacity > 1 && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Booking Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPooling(false)}
                        className={`p-3 rounded-xl border text-left transition-all ${!isPooling ? 'bg-brand-50 border-brand-300 ring-1 ring-brand-300' : 'bg-white border-slate-200 hover:border-brand-200'}`}
                      >
                        <div className="font-bold text-xs text-slate-900">Entire Space</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">₹{space.hourlyPrice}/hr • Up to {space.maxCapacity} ppl</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPooling(true)}
                        className={`p-3 rounded-xl border text-left transition-all ${isPooling ? 'bg-brand-50 border-brand-300 ring-1 ring-brand-300' : 'bg-white border-slate-200 hover:border-brand-200'}`}
                      >
                        <div className="font-bold text-xs text-slate-900">Share Space</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">₹{Math.round(space.hourlyPrice / space.maxCapacity)}/hr per person</div>
                      </button>
                    </div>

                    {isPooling && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-slate-700">Spots to reserve</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPooledSpots(Math.max(1, pooledSpots - 1))}
                            className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-slate-900 w-4 text-center">{pooledSpots}</span>
                          <button
                            type="button"
                            onClick={() => setPooledSpots(Math.min(space.maxCapacity - 1, pooledSpots + 1))}
                            className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs border border-slate-200/80">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>₹{effectiveHourlyRate} × {durationHours} hrs</span>
                    <span className="font-extrabold text-slate-900">{formatINR(priceDetails.basePrice)}</span>
                  </div>
                  {space.cleaningFee > 0 && (
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Service Fee</span>
                      <span className="font-extrabold text-slate-900">{formatINR(priceDetails.cleaningFee)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                    <span>Total</span>
                    <span className="text-brand-700">{formatINR(priceDetails.totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span>Processing...</span>
                  ) : (
                    <span>Book Now</span>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                  {space.instantBooking ? 'Instant confirmation upon payment' : 'Host approval required within 2 hours'}
                </p>
              </form>
            </div>
          </div>

        </div>

      </div>

      {showGuestForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuestForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-xl text-slate-900 mb-1">Guest Details</h3>
            <p className="text-xs text-slate-500 mb-6">Please provide your details before completing the booking.</p>
            
            <form onSubmit={handleFinalReservation} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min="18"
                    value={guestAge}
                    onChange={(e) => setGuestAge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Purpose of Stay</label>
                <textarea
                  required
                  rows={3}
                  value={guestPurpose}
                  onChange={(e) => setGuestPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="E.g., Remote work, Study group, Content creation..."
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg flex items-center justify-center transition-all"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
