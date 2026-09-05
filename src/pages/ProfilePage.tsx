import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, Award, Mail, MapPin } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.avatarUrl}
            alt={user?.fullName}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/20"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.fullName}</h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">{user?.bio}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-medium text-slate-600 pt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-600" /> {user?.city}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-brand-600" /> {user?.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" /> SpaceShare Trust Score
            </div>
            <h3 className="text-2xl font-extrabold">Trusted Community Member</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Your trust score is calculated from profile completeness, ID verification status, and positive host/guest reviews.
            </p>
          </div>
          <div className="text-center bg-white/10 p-5 rounded-2xl border border-white/10 shrink-0">
            <div className="text-4xl font-black text-emerald-400">{user?.trustScore || 92}/100</div>
            <div className="text-[10px] text-slate-300 font-bold uppercase mt-1">Trust Index</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Verification Status Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div>Email Verified</div>
                <div className="text-[10px] text-emerald-700 font-normal">Primary email confirmed</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div>Phone OTP Verified</div>
                <div className="text-[10px] text-emerald-700 font-normal">Mobile number linked</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3 text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div>Government ID Verified</div>
                <div className="text-[10px] text-emerald-700 font-normal">Aadhaar / Driving License verified</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
