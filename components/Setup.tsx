
import React, { useState, useEffect } from 'react';
import { GameState, GamePhase, GameMode, Character } from '../types';

interface SetupProps {
  onComplete: (setupData: Partial<GameState>) => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [gameTitle, setGameTitle] = useState<string>(`Killing Game #${Math.floor(Math.random() * 9000) + 1000}`);
  const [charactersText, setCharactersText] = useState<string>('');
  const [restrictions, setRestrictions] = useState<string>('No minors, no real people, no graphic gore.');
  const [theme, setTheme] = useState<string>('Hope\'s Peak Academy');
  const [hostName, setHostName] = useState<string>('Monokuma');
  const [mode, setMode] = useState<GameMode>(GameMode.WATCH);
  const [gallery, setGallery] = useState<Character[]>([]);
  const [selectedFromGallery, setSelectedFromGallery] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('dr_gallery');
    if (saved) setGallery(JSON.parse(saved));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process text-based characters
    const charLines = charactersText.split('\n').filter(line => line.trim() !== '');
    const charList: Character[] = charLines.map((line, idx) => {
      const [name, ...descParts] = line.split(':');
      return {
        id: `char-${idx}-${Date.now()}`,
        name: name.trim(),
        description: descParts.join(':').trim() || 'A mysterious student.',
        status: 'ALIVE',
        origin: 'Unknown',
        traits: [],
        backstory: ''
      };
    });

    // Add gallery characters
    const galleryChars = gallery
      .filter(c => selectedFromGallery.has(c.id))
      .map(c => ({ 
        ...c, 
        id: `${c.id}-${Date.now()}`, 
        status: 'ALIVE' as const 
      }));

    onComplete({
      id: `game-${Date.now()}`,
      title: gameTitle,
      characters: [...charList, ...galleryChars],
      restrictions,
      theme,
      hostName,
      mode,
      phase: GamePhase.INTRODUCTION,
      isLocked: true
    });
  };

  const toggleGalleryChar = (id: string) => {
    const newSet = new Set(selectedFromGallery);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedFromGallery(newSet);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-dr-card rounded-xl border-2 border-dr-pink shadow-[0_0_20px_rgba(255,0,127,0.3)] animate-in fade-in zoom-in duration-500">
      <h1 className="text-4xl font-bold mb-6 text-dr-pink text-center tracking-tighter uppercase italic">Initialization</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold uppercase mb-2 opacity-70">Game Title (For records)</label>
          <input
            type="text"
            className="w-full bg-dr-dark border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-dr-pink outline-none"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase mb-2 opacity-70">New Contestants (Name: Description)</label>
          <textarea
            className="w-full bg-dr-dark border border-white/10 rounded-lg p-3 h-32 focus:ring-2 focus:ring-dr-pink outline-none transition-all"
            placeholder="Spider-Man: The wall-crawler&#10;Sherlock Holmes: The ultimate detective"
            value={charactersText}
            onChange={(e) => setCharactersText(e.target.value)}
          />
        </div>

        {gallery.length > 0 && (
          <div>
            <label className="block text-sm font-semibold uppercase mb-2 opacity-70">Reuse From Archive ({selectedFromGallery.size} selected)</label>
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {gallery.map(char => (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => toggleGalleryChar(char.id)}
                  className={`shrink-0 w-16 h-16 rounded-lg border-2 transition-all overflow-hidden ${selectedFromGallery.has(char.id) ? 'border-dr-pink ring-2 ring-dr-pink/50' : 'border-white/10 opacity-40'}`}
                >
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" title={char.name} />
                  ) : (
                    <div className="w-full h-full bg-dr-dark flex items-center justify-center text-[10px] font-black">{char.name[0]}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold uppercase mb-2 opacity-70">Setting</label>
            <input type="text" className="w-full bg-dr-dark border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-dr-pink outline-none" value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase mb-2 opacity-70">Host</label>
            <input type="text" className="w-full bg-dr-dark border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-dr-pink outline-none" value={hostName} onChange={(e) => setHostName(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase mb-2 opacity-70">Your Role</label>
          <div className="flex gap-4">
            <button type="button" onClick={() => setMode(GameMode.WATCH)} className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${mode === GameMode.WATCH ? 'bg-dr-pink border-dr-pink text-white' : 'bg-transparent border-white/20 hover:border-dr-pink/50'}`}>WATCH</button>
            <button type="button" onClick={() => setMode(GameMode.PARTICIPATE)} className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${mode === GameMode.PARTICIPATE ? 'bg-dr-pink border-dr-pink text-white' : 'bg-transparent border-white/20 hover:border-dr-pink/50'}`}>PARTICIPATE</button>
          </div>
        </div>

        <button type="submit" className="w-full bg-dr-pink hover:bg-dr-pink/80 text-white font-black py-4 rounded-lg text-xl tracking-widest transition-all shadow-lg active:scale-95 uppercase">Begin Cycle</button>
      </form>
    </div>
  );
};

export default Setup;
