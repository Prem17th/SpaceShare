import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">SpaceShare</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier hourly space sharing marketplace. Rent private rooms, work desks, quiet study nooks, and meeting corners by the hour — at very affordable prices.
            </p>
            <p className="text-xs text-brand-400 font-semibold italic">
              “Your space. Your time. Your price.”
            </p>
          </div>

          {/* Column 1: Discover */}
          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Discover Spaces</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Study Rooms</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Work Desks & Nooks</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Private Rest Rooms</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Meeting Corners</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">Gated Parking</button></li>
            </ul>
          </div>

          {/* Column 2: Host */}
          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Host with Us</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('host')} className="hover:text-white transition-colors">Turn Empty Hours into Income</button></li>
              <li><button onClick={() => onNavigate('host-wizard')} className="hover:text-white transition-colors">List Your Space</button></li>
              <li><button onClick={() => onNavigate('host')} className="hover:text-white transition-colors">Host Guidelines</button></li>
              <li><button onClick={() => onNavigate('safety')} className="hover:text-white transition-colors">Host Protection & Safety</button></li>
              <li><button onClick={() => onNavigate('host')} className="hover:text-white transition-colors">Earnings Calculator</button></li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Trust & Legal</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('safety')} className="hover:text-white transition-colors flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Safety Center</button></li>
              <li><button onClick={() => onNavigate('policy')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('policy')} className="hover:text-white transition-colors">Cancellation & Refund Policy</button></li>
              <li><button onClick={() => onNavigate('policy')} className="hover:text-white transition-colors">Community Standards</button></li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="max-w-2xl text-center md:text-left leading-relaxed">
            <strong className="text-slate-400">Legal Disclaimer:</strong> SpaceShare is an hourly time-slot space sharing platform connecting verified hosts and guests. Users are strictly responsible for ensuring their space listings comply with all applicable local housing laws, building rules, and permissions.
          </p>
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            © {new Date().getFullYear()} SpaceShare. All rights are reserved by Mohammed Safwan Khan.
          </div>
        </div>

      </div>
    </footer>
  );
};
