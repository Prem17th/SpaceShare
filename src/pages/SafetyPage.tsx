import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, AlertTriangle, PhoneCall, FileText } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const { showToast } = useToast();
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Safety team notified. We will review within 15 minutes.', 'success');
    setReportReason('');
    setReportDescription('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SpaceShare Safety & Security Center</h1>
          <p className="text-xs text-slate-500">Your security, privacy, and peace of mind are our absolute highest priority.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Lock className="w-4 h-4 text-brand-600" /> Approximate Location Privacy Pin
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exact apartment unit numbers and street entrance instructions are obscured on public search maps. Address access details are only disclosed to guests with confirmed paid time-slot bookings.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Mandatory Identity Verification
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both guests and hosts must complete mobile phone OTP verification and government ID checks before listing spaces or making time-slot reservations.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <PhoneCall className="w-4 h-4 text-rose-600" /> 24/7 Safety Support & Escalation
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In-app emergency assistance button connects you directly to SpaceShare safety trust officers and emergency contacts during active booking windows.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> AI Trust & Fraud Engine (SpaceScore)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every listing and host is continuously evaluated by our AI. We automatically flag suspicious accounts, fake reviews, and unusual booking patterns to maintain a perfect <b>SpaceScore</b> rating ecosystem.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <FileText className="w-4 h-4 text-amber-600" /> Comprehensive Liability Insurance
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every booking is covered by SpaceShare's robust $1M property and liability protection, ensuring both hosts and guests are shielded from accidental damages or injuries.
            </p>
          </div>
        </div>

        {/* Emergency SOS Widget */}
        <div className="bg-rose-50 p-8 rounded-3xl border border-rose-200 shadow-sm max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" /> Emergency SOS
            </h3>
            <p className="text-sm text-rose-700 font-medium max-w-xl leading-relaxed">
              If you ever feel unsafe during a booking, activate the SOS beacon immediately. We will alert local emergency services with your exact GPS location, cancel the booking, process a refund, and dispatch a rapid response agent.
            </p>
          </div>
          <button 
            onClick={() => showToast('SOS ACTIVATED: Alerting local authorities and SpaceShare emergency team. Help is on the way.', 'error')}
            className="w-full md:w-auto px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/30 transition-transform hover:scale-105 shrink-0"
          >
            ACTIVATE SOS NOW
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Report an Incident or Listing Concern
          </h3>
          <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Report</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">Select reason...</option>
                <option value="misleading">Inaccurate / Misleading Listing</option>
                <option value="safety">Safety or Hygiene Concern</option>
                <option value="conduct">Unprofessional Conduct</option>
                <option value="other">Other issue</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide details..."
                className="w-full p-2.5 rounded-xl border border-slate-300"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Submit Report to Safety Officer
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
