import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, ShieldCheck } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Priya Sharma (Host)', content: 'Hi Arjun! Your 2 PM study desk slot is confirmed. Let me know if you need tea or extra power strips.', time: '2:15 PM', isSelf: false },
    { id: '2', sender: 'Arjun Mehta', content: 'Thanks Priya! Is parking available outside the building for a two-wheeler?', time: '2:18 PM', isSelf: true },
    { id: '3', sender: 'Priya Sharma (Host)', content: 'Yes, designated scooter parking spot #4 right inside gate 2.', time: '2:20 PM', isSelf: false },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user?.fullName || 'Me',
        content: inputMsg,
        time: 'Just now',
        isSelf: true,
      },
    ]);
    setInputMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-[600px] flex flex-col">
          
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
                P
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Priya Sharma (Host)</h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Host • Active Booking SS-94821
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.isSelf ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  <p>{m.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Type your message securely..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
