
import React, { useState, useEffect, useRef } from 'react';
import { Character, ChatMessage } from '../types';
import { GeminiHost } from '../geminiService';

interface SandboxProps {
  onBack: () => void;
}

const Sandbox: React.FC<SandboxProps> = ({ onBack }) => {
  const [gallery, setGallery] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const host = useRef(new GeminiHost());

  useEffect(() => {
    const saved = localStorage.getItem('dr_gallery');
    if (saved) setGallery(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSelectChar = (char: Character) => {
    setSelectedChar(char);
    setMessages([{ role: 'model', content: `Hey! I'm ${char.name}, the ${char.ultimateTitle}. What's up?` }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping || !selectedChar) return;

    const userMsg = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await host.current.getSandboxResponse(selectedChar, inputValue, messages);
      setMessages(prev => [...prev, { role: 'model', content: response || "..." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedChar) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-4xl font-black italic uppercase text-dr-pink tracking-tight">Sandbox</h2>
            <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Casual Dialogue Simulation</p>
          </div>
          <button onClick={onBack} className="bg-dr-dark border border-white/20 text-white px-6 py-2 rounded-lg font-bold hover:bg-white/5 uppercase text-xs">Hub</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map(char => (
            <button key={char.id} onClick={() => handleSelectChar(char)} className="bg-dr-card p-4 rounded-xl border border-white/10 hover:border-dr-pink transition-all group">
              <div className="w-full aspect-square bg-dr-dark rounded-lg mb-3 overflow-hidden border border-white/5">
                {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black opacity-20">{char.name[0]}</div>}
              </div>
              <div className="text-[9px] font-black text-dr-pink uppercase truncate mb-1">{char.ultimateTitle}</div>
              <div className="font-bold text-sm truncate">{char.name}</div>
            </button>
          ))}
          {gallery.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30 italic">No archived characters available. Play a killing game first!</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[85vh] flex flex-col bg-dr-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
      <div className="p-4 bg-dr-dark border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dr-card rounded-lg overflow-hidden border border-dr-pink/30">
            {selectedChar.avatarUrl ? <img src={selectedChar.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{selectedChar.name[0]}</div>}
          </div>
          <div>
            <div className="text-sm font-black italic uppercase leading-none">{selectedChar.name}</div>
            <div className="text-[9px] font-black uppercase text-dr-pink tracking-wider">{selectedChar.ultimateTitle}</div>
          </div>
        </div>
        <button onClick={() => setSelectedChar(null)} className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">Change Character</button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-dr-pink text-white rounded-tr-none' : 'bg-dr-dark border border-white/10 rounded-tl-none'}`}>
              <div className="text-xs leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex gap-1 items-center px-4"><div className="w-1 h-1 bg-dr-pink rounded-full animate-bounce"></div><div className="w-1 h-1 bg-dr-pink rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-1 h-1 bg-dr-pink rounded-full animate-bounce [animation-delay:-0.5s]"></div></div>}
      </div>
      <form onSubmit={handleSend} className="p-4 bg-dr-dark border-t border-white/10 flex gap-3">
        <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder={`Chat with ${selectedChar.name}...`} className="flex-1 bg-dr-card border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-dr-pink outline-none" disabled={isTyping} />
        <button type="submit" disabled={isTyping || !inputValue.trim()} className="bg-dr-pink px-6 py-3 rounded-lg font-black uppercase text-xs tracking-widest disabled:opacity-50">Send</button>
      </form>
    </div>
  );
};

export default Sandbox;
