import React, { useState } from 'react';
import { useSpace } from '../context/SpaceContext';
import { useAuth } from '../context/AuthContext';
import { Search, Map as MapIcon, Plus, Minus, User, Settings2, MoreHorizontal, ChevronRight, Play, Compass, TreePine, Building2 } from 'lucide-react';
import type { SpaceCategory } from '../types';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { spaces, setFilters } = useSpace();
  const { user, openAuthModal, isAuthenticated } = useAuth();

  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<SpaceCategory | 'all'>('all');
  const [scale, setScale] = useState(1.1);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      location: location || 'Bengaluru',
      category,
    }));
    onNavigate('search');
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.3, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.3, 1));

  const featuredSpace = spaces[0];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-stone-950 font-sans z-50">
      
      {/* Zoomable Map Background */}
      <motion.div 
        className="absolute inset-0 w-full h-full bg-cover bg-center cursor-grab active:cursor-grabbing origin-center"
        drag
        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
        animate={{ scale }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        {/* Mock Map Pins positioned relatively on the background */}
        {spaces.slice(0, 4).map((space, idx) => {
          const colors = ['bg-[#ff7b54]', 'bg-[#d4f870]', 'bg-[#a881ff]', 'bg-white'];
          const textColors = ['text-white', 'text-stone-900', 'text-white', 'text-stone-800'];
          const positions = [
            { top: '30%', left: '40%' },
            { top: '60%', left: '30%' },
            { top: '75%', left: '55%' },
            { top: '45%', left: '65%' },
          ];
          
          return (
            <div key={space.id} className="absolute flex flex-col items-center" style={positions[idx]}>
              <div 
                className={`w-10 h-10 rounded-[20px] rounded-br-sm ${colors[idx]} shadow-xl flex items-center justify-center rotate-45 border-2 border-white`}
                style={{ transform: `rotate(45deg) scale(${1 / scale})`, transition: 'transform 0.1s' }}
              >
                <MapIcon className={`w-5 h-5 ${textColors[idx]} -rotate-45`} />
              </div>
              <div 
                className="w-0.5 h-12 bg-white/50 rounded-full mt-1" 
                style={{ transform: `scaleY(${1 / scale})`, transformOrigin: 'top' }}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Overlay to ensure legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/20 to-transparent pointer-events-none z-10" />

      {/* Top Floating Navigation */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <button 
          onClick={() => !isAuthenticated && openAuthModal()}
          className="flex items-center gap-2 bg-[#f4f3ed]/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg hover:bg-white transition-colors border border-white/20"
        >
          <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
            {isAuthenticated && user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-stone-600" />
            )}
          </div>
          <span className="font-bold text-sm tracking-tight text-stone-800">
            :: {isAuthenticated ? user?.fullName : 'Sign In'}
          </span>
        </button>

        <div className="flex bg-[#f4f3ed]/95 backdrop-blur-md rounded-full shadow-lg overflow-hidden border border-white/20">
          <button onClick={handleZoomOut} className="px-4 py-2.5 hover:bg-stone-100 transition-colors text-stone-600 border-r border-stone-200/50">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={handleZoomIn} className="px-4 py-2.5 hover:bg-stone-100 transition-colors text-stone-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left Panel Stack */}
      <div className="absolute top-24 left-6 flex flex-col gap-4 w-[340px] z-20">
        
        {/* Main Card */}
        <div className="bg-[#f4f3ed]/95 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/40">
          <h1 className="text-[2.75rem] leading-[1.05] font-light tracking-tight text-stone-800 mb-6">
            Find your<br/>
            <span className="font-medium">Perfect Space</span>
          </h1>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-stone-200/60 shadow-inner">
            <Search className="w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="SEARCH LOCATION" 
              className="bg-transparent border-none outline-none text-xs font-bold tracking-widest text-stone-700 placeholder:text-stone-400 w-full"
            />
          </form>
        </div>

        {/* Categories Card */}
        <div className="bg-[#f4f3ed]/95 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/40 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-stone-400 mb-3 uppercase flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5" /> CATEGORIES
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory('study_room')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-colors ${category === 'study_room' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                <Compass className="w-3 h-3" /> STUDY
              </button>
              <button onClick={() => setCategory('private_room')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-colors ${category === 'private_room' ? 'bg-[#d4f870] text-stone-900' : 'bg-lime-100 text-lime-700'}`}>
                <MapIcon className="w-3 h-3" /> PRIVATE ROOM
              </button>
              <button onClick={() => setCategory('photography_studio')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-colors ${category === 'photography_studio' ? 'bg-[#d4f870] text-stone-900' : 'bg-lime-100 text-lime-700'}`}>
                <TreePine className="w-3 h-3" /> STUDIO
              </button>
              <button onClick={() => setCategory('work_desk')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-colors ${category === 'work_desk' ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700'}`}>
                <Building2 className="w-3 h-3" /> DESK
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSearchSubmit}
          className="bg-[#d4f870] hover:bg-[#c2e85a] transition-colors rounded-[2rem] p-5 shadow-xl flex items-center justify-between group cursor-pointer border border-[#c2e85a]/50"
        >
          <span className="text-sm font-bold tracking-widest text-stone-900 ml-2">SEARCH SPACES</span>
          <div className="w-8 h-8 rounded-full bg-stone-900/10 flex items-center justify-center group-hover:bg-stone-900/20 transition-colors">
            <ChevronRight className="w-4 h-4 text-stone-900" />
          </div>
        </button>
      </div>

      {/* Preview Trip Button (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => onNavigate('search')}
          className="flex items-center gap-3 bg-stone-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl hover:bg-stone-900 transition-colors border border-white/10 group"
        >
          <span className="font-bold text-[10px] tracking-widest text-white uppercase ml-2">EXPLORE ALL</span>
          <div className="w-6 h-6 rounded-full bg-[#d4f870] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-3 h-3 text-stone-900 fill-stone-900 ml-0.5" />
          </div>
        </button>
      </div>

      {/* Bottom Right Panel (Featured Space) */}
      {featuredSpace && (
        <div className="absolute bottom-8 right-8 z-20 cursor-pointer" onClick={() => onNavigate('space-details', { spaceId: featuredSpace.id })}>
          <div className="bg-[#d4f870] rounded-3xl p-4 shadow-2xl flex items-center gap-6 max-w-[340px] border border-white/40 hover:scale-[1.02] transition-transform">
            <div className="flex-1 pl-2">
              <div className="flex items-center gap-1.5 mb-2 text-stone-800">
                <MoreHorizontal className="w-3 h-3" />
                <span className="text-[10px] font-bold tracking-widest uppercase line-clamp-1">FEATURED</span>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-stone-900 leading-tight line-clamp-2">
                {featuredSpace.title}
              </h3>
              <div className="mt-2 text-xs font-bold text-stone-700">₹{featuredSpace.hourlyPrice}/hr</div>
            </div>
            <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden shadow-inner bg-stone-200 relative">
              <img 
                src={featuredSpace.images[0]?.imageUrl} 
                alt={featuredSpace.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
