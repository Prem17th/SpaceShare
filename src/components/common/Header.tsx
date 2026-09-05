import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSpace } from '../../context/SpaceContext';
import { Clock, Search, Heart, LogOut, Sparkles, Bell, LayoutDashboard, PlusCircle, User, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, activeRole, switchRole, logout, openAuthModal, isAuthenticated } = useAuth();
  const { notifications, favorites } = useSpace();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                SpaceShare
              </span>
              <span className="bg-brand-50 text-brand-700 border border-brand-200/80 text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider uppercase">
                HOURLY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold hidden lg:block">
              Your space. Your time. Your price.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-all"
          >
            Home
          </button>
          
          <div 
            onClick={() => onNavigate('search')}
            className="hidden md:flex items-center gap-3 pl-5 pr-2 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-md shadow-slate-900/5 hover:shadow-lg rounded-full cursor-pointer transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
              <span>Any Location</span>
              <span className="h-4 w-px bg-slate-200"></span>
              <span className="text-slate-600 font-semibold">Any Date</span>
              <span className="h-4 w-px bg-slate-200"></span>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" /> By Hour
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeRole === 'host' ? (
            <button
              onClick={() => onNavigate('host-wizard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              + Host Space
            </button>
          ) : (
            <button
              onClick={() => {
                switchRole('host');
                onNavigate('host');
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 hover:border-brand-500 bg-white hover:bg-brand-50/50 text-slate-800 font-bold text-xs transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              Switch to Host
            </button>
          )}

          <button
            onClick={() => onNavigate('saved')}
            className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100/80 relative transition-colors"
            title="Saved Spaces"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {favorites.length}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100/80 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-600 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                  <span className="text-[11px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded-full">{unreadNotifs} new</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs space-y-1">
                      <div className="font-bold text-slate-900">{n.title}</div>
                      <div className="text-slate-600 font-normal">{n.message}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{n.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-3.5 rounded-full border border-slate-200 hover:shadow-md transition-all bg-white"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <img
                  src={user?.avatarUrl}
                  alt={user?.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 transition-all hover:scale-105"
              >
                Sign In
              </button>
            )}

            {isProfileMenuOpen && isAuthenticated && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 space-y-2">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <img src={user?.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-slate-900 truncate text-xs">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="p-2 bg-brand-50/70 rounded-2xl border border-brand-100 space-y-1.5">
                  <div className="text-[10px] font-black text-brand-800 uppercase tracking-wider px-1">
                    Role Mode Switcher
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-white rounded-xl shadow-xs border border-brand-200/50">
                    <button
                      onClick={() => {
                        switchRole('guest');
                        setIsProfileMenuOpen(false);
                        onNavigate('search');
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeRole === 'guest'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Guest
                    </button>
                    <button
                      onClick={() => {
                        switchRole('host');
                        setIsProfileMenuOpen(false);
                        onNavigate('host');
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeRole === 'host'
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Host
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => {
                      onNavigate('bookings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 font-bold text-slate-700"
                  >
                    <Clock className="w-4 h-4 text-brand-600" /> My Bookings & Passes
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('host');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 font-bold text-slate-700"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-600" /> Host Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 font-bold text-slate-700"
                  >
                    <User className="w-4 h-4 text-brand-600" /> Profile & Trust Score
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('safety');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 font-bold text-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safety Center
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 font-bold text-brand-700"
                  >
                    <Sparkles className="w-4 h-4 text-brand-600" /> Admin Console
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
