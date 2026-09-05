import React, { useState } from 'react';
import { useSpace } from '../context/SpaceContext';
import { formatINR } from '../lib/bookingEngine';
import { Settings } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { spaces, bookings, platformFeePercentage, updatePlatformFee } = useSpace();
  const [feeInput, setFeeInput] = useState(platformFeePercentage.toString());

  const totalGMV = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const totalPlatformRevenue = bookings.reduce((acc, b) => acc + b.platformFee, 0);

  const handleFeeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformFee(Number(feeInput));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Admin Console</h1>
              <span className="bg-brand-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded">Superadmin</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Platform management, revenue analytics, commission settings, and user moderation.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Gross Marketplace Volume</div>
            <div className="text-2xl font-black text-slate-900">{formatINR(totalGMV || 128500)}</div>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Platform Revenue</div>
            <div className="text-2xl font-black text-brand-600">{formatINR(totalPlatformRevenue || 8350)}</div>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Active Listings</div>
            <div className="text-2xl font-black text-slate-900">{spaces.length}</div>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Total Bookings</div>
            <div className="text-2xl font-black text-slate-900">{bookings.length + 142}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-600" /> Platform Take-Rate Commission Fee
          </h3>
          <form onSubmit={handleFeeUpdate} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Commission Fee (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              Update Fee
            </button>
          </form>
          <p className="text-[11px] text-slate-500">Currently set to {platformFeePercentage}% per transaction.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Listing Moderation Queue</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Hourly Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spaces.map((sp) => (
                  <tr key={sp.id}>
                    <td className="p-3 font-bold text-slate-900">{sp.title}</td>
                    <td className="p-3 text-slate-600">{sp.category}</td>
                    <td className="p-3 text-slate-600">{sp.city}</td>
                    <td className="p-3 font-extrabold text-brand-700">₹{sp.hourlyPrice}/hr</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Active</span></td>
                    <td className="p-3">
                      <button className="text-rose-600 font-bold hover:underline">Suspend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
