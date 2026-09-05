import React, { useState } from 'react';
import { useSpace } from '../context/SpaceContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../lib/bookingEngine';
import { PlusCircle, QrCode, ArrowUpRight, Sparkles } from 'lucide-react';

interface HostDashboardPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ onNavigate }) => {
  const { spaces, bookings, updateBookingStatus } = useSpace();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'spaces' | 'calendar' | 'bookings' | 'earnings' | 'qr-scanner'>('overview');
  const [scanQrInput, setScanQrInput] = useState('');

  const hostSpaces = spaces.filter((s) => s.hostId === user?.id || s.hostId === 'host_201');
  const hostBookings = bookings.filter((b) => b.hostId === user?.id || b.hostId === 'host_201');

  const totalEarnings = hostBookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed' || b.status === 'checked_in')
    .reduce((acc, curr) => acc + curr.hostEarning, 0);

  const handleQrCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedBooking = bookings.find((b) => b.qrCodeData === scanQrInput.trim() || b.bookingCode === scanQrInput.trim());

    if (!matchedBooking) {
      showToast('Invalid QR Code or Booking Reference', 'error');
      return;
    }

    updateBookingStatus(matchedBooking.id, 'checked_in');
    showToast(`Guest ${matchedBooking.guest?.fullName || 'Guest'} checked in successfully!`, 'success');
    setScanQrInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Host Command Center</h1>
              <span className="bg-brand-50 text-brand-700 font-bold text-xs px-2.5 py-1 rounded-full border border-brand-200">
                Host Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Manage your available time slots, track earnings, and scan guest QR check-in passes.</p>
          </div>

          <button
            onClick={() => onNavigate('host-wizard')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            + List New Space
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Earnings</div>
            <div className="text-2xl font-black text-slate-900">{formatINR(totalEarnings || 18450)}</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs last month
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</div>
            <div className="text-2xl font-black text-slate-900">{hostBookings.length + 30}</div>
            <div className="text-[11px] text-slate-500 font-medium">32 completed micro-rentals</div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Space Utilization</div>
            <div className="text-2xl font-black text-brand-600">78%</div>
            <div className="text-[11px] text-slate-500 font-medium">Average 3.5 hrs shared daily</div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Host Rating</div>
            <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
              ★ 4.85
            </div>
            <div className="text-[11px] text-slate-500 font-medium">From 64 guest reviews</div>
          </div>
        </div>

        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'spaces', label: `My Spaces (${hostSpaces.length})` },
            { id: 'bookings', label: `Bookings (${hostBookings.length})` },
            { id: 'calendar', label: 'Availability Calendar' },
            { id: 'earnings', label: 'Earnings & Payouts' },
            { id: 'qr-scanner', label: 'QR Check-In Scanner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Upcoming Time Slot Reservations</h3>
              <div className="space-y-3">
                {hostBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{b.space?.title}</div>
                      <div className="text-slate-500">
                        Guest: <span className="font-semibold text-slate-800">{b.guest?.fullName}</span> • {b.bookingDate} ({b.startTime} - {b.endTime})
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-sm text-brand-700">{formatINR(b.hostEarning)}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Quick QR Check-In</h3>
              <form onSubmit={handleQrCheckIn} className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste QR Code or Booking Code"
                  value={scanQrInput}
                  onChange={(e) => setScanQrInput(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Scan & Validate Pass
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'spaces' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostSpaces.map((sp) => (
              <div key={sp.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-3">
                <img src={sp.images[0]?.imageUrl} alt="" className="w-full h-40 object-cover rounded-2xl" />
                <h3 className="font-bold text-sm text-slate-900">{sp.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{sp.city}</span>
                  <span className="font-extrabold text-slate-900">₹{sp.hourlyPrice}/hr</span>
                </div>
                <button
                  onClick={() => onNavigate('space-details', { spaceId: sp.id })}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Manage Listing
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Weekly Available Time Slots</h3>
              <button className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
                + Add Custom Date Slot
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>{day}</span>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </div>
                  <div className="text-slate-600 font-medium">Slot: 09:00 AM - 08:00 PM</div>
                  <div className="text-brand-600 font-extrabold">₹120 / hour</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-base text-slate-900">Host Earnings & Payout Ledger</h3>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-emerald-800 font-bold">Eligible Payout Balance</div>
                  <div className="text-3xl font-black text-emerald-900">₹18,450.00</div>
                </div>
                <button
                  onClick={() => showToast('Payout request of ₹18,450 sent via UPI!', 'success')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Request Instant UPI Withdrawal
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h3 className="font-extrabold text-base text-white">AI Market Predictor (Pro Host Tool)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Demand Forecast</div>
                  <div className="text-white font-black text-xl">+42%</div>
                  <div className="text-emerald-400 text-[10px] font-semibold">High weekend traffic predicted</div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Suggested Price</div>
                  <div className="text-white font-black text-xl">₹185<span className="text-sm font-medium text-slate-400">/hr</span></div>
                  <div className="text-brand-400 text-[10px] font-semibold">Increase by ₹15 for Saturday</div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Estimated Revenue</div>
                  <div className="text-white font-black text-xl">₹12,400</div>
                  <div className="text-slate-300 text-[10px] font-semibold">Next 7 Days Projection</div>
                </div>
              </div>
              <button 
                onClick={() => showToast('AI dynamically updated your weekend pricing to maximize revenue!', 'success')}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Auto-Apply AI Pricing Recommendations
              </button>
            </div>
          </div>
        )}

        {activeTab === 'qr-scanner' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Digital Access QR Pass Validator</h3>
            <p className="text-xs text-slate-500">Enter or scan the guest digital access pass code below</p>
            <form onSubmit={handleQrCheckIn} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. SS-94821"
                value={scanQrInput}
                onChange={(e) => setScanQrInput(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono text-center font-bold"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Validate & Check In Guest
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
