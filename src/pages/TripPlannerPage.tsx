import React from 'react';
import { Search, Map, Compass, TreePine, Building2, Play, ChevronRight, Plus, Minus, User, Settings2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export const TripPlannerPage: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-stone-950 text-stone-900 font-sans z-50">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop')",
          transform: 'scale(1.05)',
        }}
      />
      
      {/* Overlay to ensure legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/10 to-transparent pointer-events-none" />

      {/* Top Floating Navigation */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <button className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg hover:bg-white transition-colors border border-stone-200/50">
          <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-stone-600" />
          </div>
          <span className="font-bold text-sm tracking-tight">:: Elsa Nills</span>
        </button>

        <div className="flex bg-white/90 backdrop-blur-md rounded-full shadow-lg overflow-hidden border border-stone-200/50">
          <button className="px-4 py-2.5 hover:bg-stone-100 transition-colors text-stone-600 border-r border-stone-200/50">
            <Minus className="w-4 h-4" />
          </button>
          <button className="px-4 py-2.5 hover:bg-stone-100 transition-colors text-stone-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left Panel Stack */}
      <div className="absolute top-24 left-6 flex flex-col gap-4 w-[340px] z-20">
        
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-stone-50/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20"
        >
          <h1 className="text-[2.75rem] leading-[1.05] font-light tracking-tight text-stone-800 mb-6">
            Plan your<br/>
            <span className="font-medium">Perfect Trip</span>
          </h1>
          <div className="flex items-center gap-2 bg-stone-200/50 rounded-full px-4 py-3">
            <Search className="w-4 h-4 text-stone-500" />
            <input 
              type="text" 
              placeholder="SEARCH BY ANYTHING" 
              className="bg-transparent border-none outline-none text-xs font-bold tracking-widest text-stone-700 placeholder:text-stone-400 w-full"
            />
          </div>
        </motion.div>

        {/* Points of Interest & Budget Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-stone-50/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col gap-6"
        >
          {/* POI */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-stone-500 mb-3 uppercase flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5" /> Points of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wide">
                <Compass className="w-3 h-3" /> EXPLORE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-100 text-lime-700 text-[10px] font-bold tracking-wide">
                <Map className="w-3 h-3" /> EPIC VIEWS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-100 text-lime-700 text-[10px] font-bold tracking-wide">
                <TreePine className="w-3 h-3" /> AMONG TREES
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold tracking-wide">
                <Building2 className="w-3 h-3" /> URBAN VIEWS
              </span>
            </div>
          </div>

          <div className="h-px bg-stone-200/60 w-full" />

          {/* Budget */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-stone-500 mb-3 uppercase flex items-center gap-2">
              <MoreHorizontal className="w-3.5 h-3.5" /> Budget
            </h3>
            <div className="flex gap-3">
              <div className="flex-1 bg-stone-200/50 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-stone-400 mb-1">$</span>
                <div className="text-xl font-medium tracking-tight text-stone-800">$5,000</div>
                <div className="text-[8px] font-bold tracking-widest text-stone-400 uppercase mt-1">BUDGET</div>
              </div>
              <div className="flex-1 bg-stone-200/50 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-stone-400 mb-1">⛱️</span>
                <div className="text-xl font-medium tracking-tight text-stone-800">12</div>
                <div className="text-[8px] font-bold tracking-widest text-stone-400 uppercase mt-1">VACATION DAYS</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#d4f870] hover:bg-[#c2e85a] transition-colors rounded-3xl p-5 shadow-xl flex items-center justify-between group cursor-pointer"
        >
          <span className="text-sm font-bold tracking-widest text-stone-900 ml-2">PLAN MY TRIP</span>
          <div className="w-8 h-8 rounded-full bg-stone-900/10 flex items-center justify-center group-hover:bg-stone-900/20 transition-colors">
            <ChevronRight className="w-4 h-4 text-stone-900" />
          </div>
        </motion.button>
      </div>

      {/* Floating Map Markers */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}
          className="absolute top-[25%] right-[40%] flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-[20px] rounded-br-sm bg-white shadow-xl flex items-center justify-center rotate-45 border-2 border-stone-100">
            <Map className="w-5 h-5 text-stone-800 -rotate-45" />
          </div>
          <div className="w-0.5 h-12 bg-white/50 rounded-full mt-1" />
        </motion.div>

        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.5 }}
          className="absolute top-[45%] right-[55%] flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-[20px] rounded-br-sm bg-[#ff7b54] shadow-xl flex items-center justify-center rotate-45 border-2 border-stone-100">
            <Map className="w-5 h-5 text-white -rotate-45" />
          </div>
          <div className="w-0.5 h-8 bg-white/50 rounded-full mt-1" />
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}
          className="absolute bottom-[35%] right-[25%] flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-[20px] rounded-br-sm bg-[#d4f870] shadow-xl flex items-center justify-center rotate-45 border-2 border-stone-100">
            <Map className="w-5 h-5 text-stone-900 -rotate-45" />
          </div>
          <div className="w-0.5 h-16 bg-white/50 rounded-full mt-1" />
        </motion.div>

        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.7 }}
          className="absolute bottom-[20%] right-[45%] flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-[20px] rounded-br-sm bg-[#a881ff] shadow-xl flex items-center justify-center rotate-45 border-2 border-stone-100">
            <Map className="w-5 h-5 text-white -rotate-45" />
          </div>
          <div className="w-0.5 h-12 bg-white/50 rounded-full mt-1" />
        </motion.div>
      </div>

      {/* Preview Trip Button (Bottom Center) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <button className="flex items-center gap-3 bg-stone-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl hover:bg-stone-900 transition-colors border border-white/10 group">
          <span className="font-bold text-[10px] tracking-widest text-white uppercase ml-2">Preview Trip</span>
          <div className="w-6 h-6 rounded-full bg-[#d4f870] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-3 h-3 text-stone-900 fill-stone-900 ml-0.5" />
          </div>
        </button>
      </motion.div>

      {/* Bottom Right Panel */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="absolute bottom-8 right-8 z-20"
      >
        <div className="bg-[#d4f870] rounded-3xl p-4 shadow-2xl flex items-center gap-6 max-w-[320px] border border-white/20">
          <div className="flex-1 pl-2">
            <div className="flex items-center gap-1.5 mb-2 text-stone-800">
              <MoreHorizontal className="w-3 h-3" />
              <span className="text-[10px] font-bold tracking-widest uppercase">TRIP</span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-stone-900 leading-tight">
              Scenery Trip<br/>To Japan
            </h3>
          </div>
          <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden shadow-inner bg-stone-200 relative">
            <img 
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop" 
              alt="Japan Scenery" 
              className="w-full h-full object-cover"
            />
            {/* Pagination dots indicator mock */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              <div className="w-1 h-1 rounded-full bg-white/60 shadow-sm mt-[1px]" />
              <div className="w-1 h-1 rounded-full bg-white/60 shadow-sm mt-[1px]" />
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};
