import React, { useState } from 'react';
import { useSpace } from '../context/SpaceContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import { formatINR } from '../lib/bookingEngine';
import { Clock, MapPin, QrCode, Star, Calendar, Mail, XCircle, Key } from 'lucide-react';

interface BookingsPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigate }) => {
  const { bookings, addReview, updateBookingStatus } = useSpace();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);
  const [activeReviewModal, setActiveReviewModal] = useState<string | null>(null);
  const [activeCancelModal, setActiveCancelModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [qrEmailInput, setQrEmailInput] = useState(user?.email || '');

  const myBookings = bookings.filter((b) => b.guestId === user?.id || b.guestId === 'user_curr_101');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeReviewModal) {
      addReview(activeReviewModal, rating, reviewComment);
      setActiveReviewModal(null);
      setReviewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings & QR Access Passes</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your active hourly reservations and present your digital QR pass to hosts.</p>
        </div>

        {myBookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Clock className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800">No active bookings yet</p>
            <button
              onClick={() => onNavigate('search')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Explore Available Spaces
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-brand-50 text-brand-700 font-extrabold px-2.5 py-1 rounded-md">
                      CODE: {b.bookingCode}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      {b.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900">{b.space?.title}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>{b.bookingDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span>{b.startTime} - {b.endTime} ({b.durationHours} hrs)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium sm:col-span-2">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <span>{b.space?.addressLine}, {b.space?.city}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-1 space-y-1">
                    <div>Host: <span className="font-bold text-slate-800">{b.host?.fullName}</span></div>
                    {b.status !== 'pending' && b.status !== 'cancelled' && b.status !== 'rejected' && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="font-semibold text-brand-600">Contact Host:</span>
                        <a href={`mailto:${b.host?.email}`} className="text-slate-600 hover:text-brand-600 truncate">{b.host?.email || 'N/A'}</a>
                        {b.host?.phone && (
                          <a href={`tel:${b.host?.phone}`} className="text-slate-600 hover:text-brand-600">{b.host?.phone}</a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">{formatINR(b.totalPrice)}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Total Paid (Hourly + Fees)</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveQrModal(b.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                    >
                      <QrCode className="w-4 h-4" /> View Digital QR Pass
                    </button>
                    
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => showToast('Smart Lock OTP generated: 9482. Valid for 10 minutes.', 'success')}
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <Key className="w-4 h-4 text-emerald-600" /> Unlock Smart Door
                      </button>
                    )}

                    {b.status === 'completed' && (
                      <button
                        onClick={() => setActiveReviewModal(b.id)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> Review Space
                      </button>
                    )}

                    {(b.status === 'confirmed' || b.status === 'pending') && (
                      <button
                        onClick={() => setActiveCancelModal(b.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {activeQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
              <button
                onClick={() => setActiveQrModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900">Digital Access Pass</h3>
                <p className="text-xs text-slate-500">Show this QR code to host upon check-in</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <QRCodeSVG
                  value={myBookings.find((b) => b.id === activeQrModal)?.qrCodeData || 'DEMO_QR'}
                  size={180}
                />
              </div>

              <div className="text-xs font-mono font-bold text-brand-700 bg-brand-50 p-2 rounded-xl">
                {myBookings.find((b) => b.id === activeQrModal)?.qrCodeData}
              </div>

              <div className="pt-2 text-left space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Send copy to email</label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    value={qrEmailInput}
                    onChange={(e) => setQrEmailInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!qrEmailInput) return showToast('Please enter an email address', 'error');
                      showToast(`QR Code and entry instructions have been emailed to ${qrEmailInput}!`, 'success');
                      setActiveQrModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <Mail className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
              <button
                onClick={() => setActiveReviewModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <h3 className="font-extrabold text-lg text-slate-900">Review Your Stay</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your feedback regarding cleanliness, host behavior, Wi-Fi speed..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold text-xs"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}

        {activeCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
              <button
                onClick={() => setActiveCancelModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" /> Cancel Reservation
              </h3>
              
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2">
                <h4 className="font-bold text-sm text-rose-900">Flexible Cancellation Policy</h4>
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  You are cancelling within the eligible window. You will receive a full refund of the base hourly price. The SpaceShare platform fee is non-refundable.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setActiveCancelModal(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => {
                    updateBookingStatus(activeCancelModal, 'cancelled');
                    showToast('Booking successfully cancelled. Refund initiated.', 'success');
                    setActiveCancelModal(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-500/20"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
