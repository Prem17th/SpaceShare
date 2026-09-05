import React, { useState } from 'react';
import { useSpace } from '../context/SpaceContext';
import { MapPin, Calendar, Clock, Filter, List, Map as MapIcon, Star, Heart, RefreshCw, ShieldCheck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';

interface SearchPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const createCustomPriceIcon = (price: number) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: #0f172a; color: white; padding: 4px 8px; border-radius: 12px; font-weight: 800; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); white-space: nowrap;">₹${price}/hr</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
};

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const { spaces, filters, setFilters, resetFilters, favorites, toggleFavorite } = useSpace();
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredSpaces = spaces.filter((space) => {
    if (filters.location && !space.city.toLowerCase().includes(filters.location.toLowerCase()) && !space.addressLine.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.category !== 'all' && space.category !== filters.category) {
      return false;
    }
    if (space.hourlyPrice < filters.minPrice || space.hourlyPrice > filters.maxPrice) {
      return false;
    }
    if (filters.instantOnly && !space.instantBooking) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 sticky top-18 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                className="bg-transparent text-slate-800 font-semibold outline-none w-24 sm:w-32"
              />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                className="bg-transparent text-slate-800 font-semibold outline-none"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <input
                type="time"
                value={filters.startTime}
                onChange={(e) => setFilters((prev) => ({ ...prev, startTime: e.target.value }))}
                className="bg-transparent text-slate-800 font-semibold outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="time"
                value={filters.endTime}
                onChange={(e) => setFilters((prev) => ({ ...prev, endTime: e.target.value }))}
                className="bg-transparent text-slate-800 font-semibold outline-none"
              />
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-slate-700 p-1"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" /> <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:flex p-1.5 rounded-lg text-xs font-semibold items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <span>Split View</span>
            </button>
          </div>

        </div>

        {isFilterOpen && (
          <div className="max-w-7xl mx-auto mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Hourly Price (₹)</label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between font-semibold text-slate-600">
                <span>₹50</span>
                <span>₹{filters.maxPrice}/hr</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Space Types</option>
                <option value="study_room">Study Room</option>
                <option value="work_desk">Work Desk</option>
                <option value="private_room">Private Room</option>
                <option value="gaming_room">Gaming Room</option>
                <option value="recording_room">Studio</option>
                <option value="mini_gym">Mini Gym</option>
                <option value="photography_studio">Photo Studio</option>
                <option value="office_desk">Office Desk</option>
                <option value="meeting_space">Meeting Space</option>
                <option value="project_room">Project Room (Campus)</option>
                <option value="club_space">Club Space (Campus)</option>
                <option value="lab_space">Lab (Campus)</option>
                <option value="parking_space">Parking</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.instantOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, instantOnly: e.target.checked }))}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span>Instant Booking Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className={`space-y-4 ${
          viewMode === 'map'
            ? 'hidden'
            : viewMode === 'split'
            ? 'md:col-span-6 lg:col-span-7'
            : 'md:col-span-12'
        }`}>
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">
              Showing <span className="text-brand-600 font-extrabold">{filteredSpaces.length} available spaces</span>
            </h2>
            <span className="text-xs text-slate-400">Approximate locations shown for host privacy</span>
          </div>

          {filteredSpaces.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <p className="font-bold text-slate-800">No spaces found matching your criteria</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {filteredSpaces.map((space) => {
                const isFav = favorites.includes(space.id);
                return (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="airbnb-card bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col group cursor-pointer"
                  >
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={space.images[0]?.imageUrl}
                        alt={space.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => toggleFavorite(space.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                      </button>
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                        <div className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {space.category.replace('_', ' ').toUpperCase()}
                        </div>
                        {space.isAvailableNow && (
                          <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 animate-pulse shadow-md">
                            🟢 AVAILABLE NOW
                          </div>
                        )}
                        {space.isFlashSpace && (
                          <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-md">
                            ⚡ FLASH SPACE
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>{space.city} • {space.addressLine.split(',')[0]}</span>
                          <div className="flex items-center gap-2">
                            {space.spaceScore && (
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded border border-emerald-100 flex items-center gap-1">
                                {space.spaceScore} <ShieldCheck className="w-3 h-3" />
                              </span>
                            )}
                            <span className="font-bold text-amber-600 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500" /> {space.averageRating}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                          {space.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-lg font-extrabold text-slate-900">₹{space.hourlyPrice}</span>
                          <span className="text-xs text-slate-500"> / hour</span>
                        </div>
                        <button
                          onClick={() => onNavigate('space-details', { spaceId: space.id })}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                        >
                          View Space
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`h-[600px] rounded-3xl overflow-hidden shadow-md border border-slate-200 sticky top-36 ${
          viewMode === 'list'
            ? 'hidden'
            : viewMode === 'split'
            ? 'md:col-span-6 lg:col-span-5'
            : 'md:col-span-12'
        }`}>
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredSpaces.map((sp) => (
              <Marker
                key={sp.id}
                position={[sp.approxLatitude, sp.approxLongitude]}
                icon={createCustomPriceIcon(sp.hourlyPrice)}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs">
                    <img src={sp.images[0]?.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <div className="font-bold text-xs text-slate-900">{sp.title}</div>
                    <div className="text-xs font-semibold text-brand-600">₹{sp.hourlyPrice}/hr • ★ {sp.averageRating}</div>
                    <button
                      onClick={() => onNavigate('space-details', { spaceId: sp.id })}
                      className="w-full py-1 bg-slate-900 text-white hover:bg-slate-800 font-bold text-[11px] rounded-md transition-colors"
                    >
                      View Space
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>

    </div>
  );
};
