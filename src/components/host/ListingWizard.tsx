import React, { useState } from 'react';
import { useSpace } from '../../context/SpaceContext';
import { useAuth } from '../../context/AuthContext';
import { getRecommendedHourlyPrice } from '../../lib/bookingEngine';
import type { SpaceCategory, Amenity } from '../../types';
import { MOCK_AMENITIES } from '../../data/mockData';
import { Sparkles, Upload, Trash2, BookOpen, Laptop, Bed, Users, Car, Home } from 'lucide-react';

interface ListingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ onComplete, onCancel }) => {
  const { addSpace } = useSpace();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  // Form State
  const [category, setCategory] = useState<SpaceCategory>('study_room');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state] = useState('Karnataka');
  const [pincode, setPincode] = useState('560102');
  
  // Multi-Photo Upload State
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'
  ]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([MOCK_AMENITIES[0], MOCK_AMENITIES[1], MOCK_AMENITIES[2]]);
  const [houseRules, setHouseRules] = useState<string>('Keep volume reasonable; No smoking; Footwear outside');
  const [hourlyPrice, setHourlyPrice] = useState<number>(120);
  const [cleaningFee, setCleaningFee] = useState<number>(20);
  const [instantBooking] = useState(true);

  const recommendedPrice = getRecommendedHourlyPrice(category, city);

  // File Upload Handler (reads image files locally as base64 data URLs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlPhoto = () => {
    if (customUrlInput.trim()) {
      setPhotos((prev) => [...prev, customUrlInput.trim()]);
      setCustomUrlInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    const finalImages = photos.map((url, idx) => ({
      id: `img_${Date.now()}_${idx}`,
      spaceId: 'temp',
      imageUrl: url,
      displayOrder: idx + 1,
    }));

    addSpace({
      hostId: user?.id || 'host_201',
      host: user || undefined,
      title: title || 'Cozy Hourly Nook',
      description: description || 'Clean, comfortable space available by the hour.',
      category,
      hourlyPrice: Number(hourlyPrice),
      cleaningFee: Number(cleaningFee),
      minHours: 1,
      maxHours: 8,
      bufferMinutes: 15,
      instantBooking,
      addressLine: addressLine || 'Sector 1, HSR Layout',
      city,
      state,
      pincode,
      latitude: 12.9121,
      longitude: 77.6446,
      approxLatitude: 12.9135,
      approxLongitude: 77.6460,
      maxCapacity: 2,
      houseRules: houseRules.split(';').map((r) => r.trim()),
      isActive: true,
      images: finalImages.length > 0 ? finalImages : [{ id: 'img_def', spaceId: 'temp', imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80', displayOrder: 1 }],
      amenities: selectedAmenities,
    });

    onComplete();
  };

  const stepsList = [
    { title: 'Space Category', desc: 'Which best describes your place?' },
    { title: 'Upload Photos', desc: 'Upload device files or paste links' },
    { title: 'Listing Title', desc: 'Create an attractive title' },
    { title: 'Description', desc: 'Detail amenities and environment' },
    { title: 'Location', desc: 'Where is your space situated?' },
    { title: 'Amenities', desc: 'What features are included?' },
    { title: 'House Rules', desc: 'Set guidelines for guests' },
    { title: 'Availability', desc: 'Define active time windows' },
    { title: 'Hourly Pricing', desc: 'Set your hourly rate' },
    { title: 'Preview & Publish', desc: 'Review your listing details' },
  ];

  const categoryOptions: { id: SpaceCategory; name: string; icon: any; desc: string }[] = [
    { id: 'study_room', name: 'Study Room', icon: BookOpen, desc: 'Quiet desk nooks for focused studying' },
    { id: 'work_desk', name: 'Work Desk', icon: Laptop, desc: 'Ergonomic workstations with fast Wi-Fi' },
    { id: 'private_room', name: 'Private Room', icon: Bed, desc: 'Cozy private rooms for short rest nooks' },
    { id: 'meeting_space', name: 'Meeting Nook', icon: Users, desc: 'Group study or mini client meeting spots' },
    { id: 'parking_space', name: 'Parking Slot', icon: Car, desc: 'Reserved gated parking spaces' },
    { id: 'living_room', name: 'Living Room', icon: Home, desc: 'Spacious lounge corners for work/rest' },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden my-6 flex flex-col min-h-[620px]">
      
      {/* Header Progress Capsule */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center font-black text-sm">
            {step}
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white">{stepsList[step - 1].title}</h2>
            <p className="text-[11px] text-slate-400 font-medium">{stepsList[step - 1].desc}</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          Exit Wizard
        </button>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-1.5 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${(step / 10) * 100}%` }}
        ></div>
      </div>

      {/* STEP CONTENT BODY */}
      <div className="p-6 sm:p-10 flex-1 space-y-6">
        
        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Which category best describes your space?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categoryOptions.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-5 rounded-3xl border text-left flex flex-col justify-between space-y-3 transition-all airbnb-card ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20 shadow-md'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm">{cat.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Photos (File Upload + URL fallback) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Add photos of your space</h3>
              <p className="text-xs text-slate-500">Upload image files directly from your device or paste web links.</p>
            </div>

            {/* Drag & Drop File Upload Dropzone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-8 text-center bg-slate-50/80 hover:bg-brand-50/30 transition-all relative group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-brand-600 shadow-md group-hover:scale-105 transition-transform mb-3">
                <Upload className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">Drag & drop image files here</h4>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP • Upload multiple files</p>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2"
              >
                Browse Device Files
              </button>
            </div>

            {/* URL Backup Option */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">Or add via Image Web URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 p-3 border border-slate-300 rounded-2xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddUrlPhoto}
                  className="px-4 py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
                >
                  Add Link
                </button>
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-700">Uploaded Photos ({photos.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 group shadow-xs">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-brand-600 text-white text-[9px] font-black px-2 py-0.5 rounded">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Step 3: Title */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Create a catchy listing title</h3>
            <p className="text-xs text-slate-500">Mention key features like quietness, garden view, or fast Wi-Fi.</p>
            <input
              type="text"
              placeholder="e.g. Quiet Balcony Garden Study Nook in HSR Layout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        )}

        {/* Step 4: Description */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Describe your space</h3>
            <textarea
              rows={5}
              placeholder="Explain the environment, seating ergonomics, noise levels, and power backups..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
            ></textarea>
          </div>
        )}

        {/* Step 5: Location */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Where is your space located?</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Line / Landmark</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Sector 1, HSR Layout (Near NIFT)"
                  className="w-full p-3 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Amenities */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Select included amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOCK_AMENITIES.map((am) => {
                const selected = selectedAmenities.some((a) => a.id === am.id);
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setSelectedAmenities(selectedAmenities.filter((a) => a.id !== am.id));
                      } else {
                        setSelectedAmenities([...selectedAmenities, am]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                      selected ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{am.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: Rules */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Set house guidelines for guests</h3>
            <textarea
              rows={3}
              value={houseRules}
              onChange={(e) => setHouseRules(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-2xl text-xs"
            ></textarea>
          </div>
        )}

        {/* Step 8: Availability */}
        {step === 8 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Default availability window</h3>
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Active Window: Monday to Saturday (9:00 AM – 8:00 PM)</div>
              <p className="text-slate-500 leading-relaxed font-normal">
                You can easily block specific dates or modify hourly availability anytime from your host calendar.
              </p>
            </div>
          </div>
        )}

        {/* Step 9: Hourly Pricing */}
        {step === 9 && (
          <div className="space-y-5">
            <h3 className="text-xl font-black text-slate-900">Set your hourly price</h3>
            
            <div className="p-4 rounded-3xl bg-gradient-to-r from-brand-50 to-sky-50 border border-brand-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-brand-900">SpaceShare Pricing Intelligence Hint</span>
                <p className="text-brand-700 font-medium">Recommended for {category.replace('_', ' ')} in {city}:</p>
              </div>
              <span className="text-xl font-black text-brand-700">₹{recommendedPrice}/hr</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Hourly Price (₹)</label>
                <input
                  type="number"
                  value={hourlyPrice}
                  onChange={(e) => setHourlyPrice(Number(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-2xl text-lg font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maintenance Fee (₹)</label>
                <input
                  type="number"
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(Number(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
              💡 Estimated Host Earnings: <span className="font-black text-emerald-700">₹{hourlyPrice * 4 * 25} / month</span> (based on sharing 4 hrs/day).
            </div>
          </div>
        )}

        {/* Step 10: Preview */}
        {step === 10 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Preview your space listing</h3>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md p-4 space-y-3">
              <img src={photos[0] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80'} alt="" className="w-full h-48 object-cover rounded-2xl" />
              <h4 className="font-extrabold text-base text-slate-900">{title || 'Untitled Space'}</h4>
              <p className="text-xs text-slate-500">{category} • ₹{hourlyPrice}/hr • {city}</p>
            </div>
          </div>
        )}

      </div>

      {/* STICKY FOOTER CONTROLS */}
      <div className="p-4 sm:px-10 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
          className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-30 hover:bg-slate-100"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => {
            if (step < 10) {
              setStep(step + 1);
            } else {
              handlePublish();
            }
          }}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
        >
          {step === 10 ? 'Publish Space Listing' : 'Next Step'}
        </button>
      </div>

    </div>
  );
};
