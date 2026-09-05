import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, MapPin, Star, ShieldCheck } from 'lucide-react';
import { useSpace } from '../context/SpaceContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { Space } from '../types';

interface AIAssistantWidgetProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  spacePayload?: Space;
  spacePayloads?: Space[];
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ onNavigate }) => {
  const { spaces } = useSpace();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! I'm your AI Local Experience Concierge. Tell me what kind of space you need (e.g., 'good option in Bangalore for two people under ₹3000')."
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Conversation Context Memory
  const [context, setContext] = useState<{
    location?: string;
    budget?: number;
    guests?: number;
    date?: string;
    lastResults?: Space[];
    selectedSpace?: Space;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      processNLU(userMessage.text.toLowerCase());
    }, 1200);
  };

  const processNLU = (query: string) => {
    let newContext = { ...context };
    let aiResponseText = "";
    let aiPayloads: Space[] | undefined = undefined;

    // 1. EXTRACT ENTITIES
    if (query.includes('bangalore') || query.includes('bengaluru')) newContext.location = 'Bengaluru';
    if (query.includes('mumbai')) newContext.location = 'Mumbai';
    if (query.includes('delhi')) newContext.location = 'Delhi';
    
    const budgetMatch = query.match(/under ₹?(\d+)/) || query.match(/budget is ₹?(\d+)/) || query.match(/₹?(\d+) budget/);
    if (budgetMatch) newContext.budget = parseInt(budgetMatch[1], 10);
    
    const guestsMatch = query.match(/for (\d+) people/) || query.match(/(\d+) guests/) || query.match(/two people/) || query.match(/for 2/);
    if (guestsMatch || query.includes('two people') || query.includes('for two')) newContext.guests = 2;
    if (query.includes('this weekend')) newContext.date = 'weekend';
    if (query.includes('tomorrow')) newContext.date = 'tomorrow';
    if (query.includes('saturday')) newContext.date = 'Saturday';

    // 2. IDENTIFY INTENT
    const isSearch = query.includes('find') || query.includes('looking for') || query.includes('show me') || query.includes('need a');
    const isCompare = query.includes('which one is best') || query.includes('better') || query.includes('compare');
    const isDistance = query.includes('how far') || query.includes('closest') || query.includes('near');
    const isAvailability = query.includes('available');
    const isBooking = query.includes('book it') || query.includes('book the') || query.includes('reserve');
    const isCheaper = query.includes('cheaper') || query.includes('less expensive');

    // Context resolution for "it" or "the first one"
    if (query.includes('first one') && newContext.lastResults?.[0]) newContext.selectedSpace = newContext.lastResults[0];
    if (query.includes('second one') && newContext.lastResults?.[1]) newContext.selectedSpace = newContext.lastResults[1];
    if ((query.includes('it') || query.includes('that')) && !newContext.selectedSpace && newContext.lastResults?.length === 1) {
      newContext.selectedSpace = newContext.lastResults[0];
    }

    // 3. EXECUTE ACTIONS
    if (isBooking) {
      if (!newContext.selectedSpace && newContext.lastResults?.length) {
        newContext.selectedSpace = newContext.lastResults[0]; // default to first if ambiguous in simple mock
      }
      if (newContext.selectedSpace) {
        aiResponseText = `I have prepared the booking details for "${newContext.selectedSpace.title}". Please continue to the existing booking flow to confirm your payment.`;
        aiPayloads = [newContext.selectedSpace];
        setTimeout(() => {
          setIsOpen(false);
          onNavigate('space-details', { spaceId: newContext.selectedSpace!.id });
        }, 3000);
      } else {
        aiResponseText = "Which space would you like to book? Please specify.";
      }
    } 
    else if (isAvailability) {
      if (newContext.selectedSpace) {
        const isAvail = newContext.selectedSpace.isAvailableNow ? 'is available right now' : 'has slots available on Saturday';
        aiResponseText = `Yes! "${newContext.selectedSpace.title}" ${isAvail} for up to ${newContext.selectedSpace.maxCapacity} people.`;
      } else {
        aiResponseText = "Yes, I can check availability. Which space are you asking about?";
      }
    }
    else if (isDistance) {
      if (newContext.selectedSpace) {
        aiResponseText = `"${newContext.selectedSpace.title}" is located in ${newContext.selectedSpace.city} at ${newContext.selectedSpace.addressLine.split(',')[0]}. It's approximately 2.4 km from your current location area.`;
      } else if (newContext.lastResults?.length) {
        const closest = [...newContext.lastResults].sort((a,b) => a.approxLatitude - b.approxLatitude)[0];
        aiResponseText = `The closest option is "${closest.title}", which is about 1.2 km away.`;
        newContext.selectedSpace = closest;
        aiPayloads = [closest];
      }
    }
    else if (isCompare) {
      if (newContext.lastResults && newContext.lastResults.length > 1) {
        const best = [...newContext.lastResults].sort((a, b) => b.averageRating - a.averageRating)[0];
        aiResponseText = `I recommend "${best.title}" as the best option. It has the highest rating (${best.averageRating}⭐ from ${best.totalReviews} reviews) and perfectly matches your criteria.`;
        newContext.selectedSpace = best;
        aiPayloads = [best];
      } else {
        aiResponseText = "I need a few options to compare first. What are you looking for?";
      }
    }
    else if (isCheaper) {
      if (newContext.lastResults) {
        const cheaper = [...spaces]
          .filter(s => (!newContext.location || s.city === newContext.location))
          .sort((a, b) => a.hourlyPrice - b.hourlyPrice)
          .slice(0, 2);
        if (cheaper.length > 0) {
          aiResponseText = `Here are some cheaper options in ${newContext.location || 'the area'}.`;
          newContext.lastResults = cheaper;
          aiPayloads = cheaper;
        }
      }
    }
    else if (isSearch || newContext.location || newContext.budget) {
      let results = [...spaces];
      
      if (newContext.location) {
        results = results.filter(s => s.city.toLowerCase() === newContext.location?.toLowerCase());
      }
      if (newContext.budget) {
        results = results.filter(s => s.hourlyPrice <= newContext.budget!);
      }
      if (newContext.guests) {
        results = results.filter(s => s.maxCapacity >= newContext.guests!);
      }
      
      if (results.length > 0) {
        const topResults = results.slice(0, 3);
        newContext.lastResults = topResults;
        aiPayloads = topResults;
        
        let explain = `I found ${results.length} options`;
        if (newContext.location) explain += ` in ${newContext.location}`;
        if (newContext.budget) explain += ` under ₹${newContext.budget}`;
        if (newContext.guests) explain += ` for ${newContext.guests} people`;
        
        aiResponseText = `${explain}. I ranked these first because they perfectly match your requirements and have excellent ratings.`;
      } else {
        aiResponseText = `I couldn't find any spaces matching all your criteria. Try adjusting your budget or location.`;
      }
    }
    else {
      aiResponseText = "I can help you discover, compare, and book spaces. Try saying: 'I am looking for a good option in Bangalore this weekend for two people. My budget is ₹3000.'";
    }

    setContext(newContext);
    setIsThinking(false);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: aiResponseText,
        spacePayloads: aiPayloads
      }
    ]);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{ height: '600px', maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Local Experience Concierge</h3>
                  <p className="text-[10px] text-slate-300">Smart Search • Compare • Book</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-slate-900 text-white rounded-br-sm' 
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Space Card Payload(s) */}
                  {(msg.spacePayloads?.length ? msg.spacePayloads : (msg.spacePayload ? [msg.spacePayload] : [])).length > 0 && (
                    <div className="mt-3 w-[350px] max-w-full flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-hide">
                      {(msg.spacePayloads?.length ? msg.spacePayloads : (msg.spacePayload ? [msg.spacePayload] : [])).map(space => (
                        <div key={space.id} className="min-w-[240px] flex-1 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden snap-start hover:shadow-lg transition-shadow group">
                          <div className="h-32 relative overflow-hidden">
                            <img src={space.images[0]?.imageUrl} alt="space" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span className="text-[10px] font-bold text-slate-900">{space.averageRating}</span>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                              ₹{space.hourlyPrice}/hr
                            </div>
                          </div>
                          <div className="p-3.5 space-y-2.5">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{space.title}</h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                                <MapPin className="w-3 h-3" /> {space.city} • Up to {space.maxCapacity} guests
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onNavigate('space-details', { spaceId: space.id });
                              }}
                              className="w-full py-2.5 bg-[#d4f870] hover:bg-[#c2e85a] text-slate-900 font-bold text-[11px] rounded-xl transition-colors border border-[#c2e85a]/30 shadow-sm flex justify-center items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> View & Book
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isThinking && (
                <div className="flex items-start">
                  <div className="bg-white border border-slate-200 px-4 py-3.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Tell me what you're looking for..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white px-5 py-4 rounded-full shadow-2xl hover:shadow-brand-500/20 border border-slate-700/50 flex items-center justify-center gap-3 relative group"
        >
          <div className="absolute inset-0 bg-brand-500 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
          <Sparkles className="w-6 h-6 relative z-10" />
          <span className="hidden md:block font-bold text-sm relative z-10 tracking-wide">AI Concierge</span>
          
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      )}
    </div>
  );
};
