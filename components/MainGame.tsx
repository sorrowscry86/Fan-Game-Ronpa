
import React, { useState, useEffect, useRef } from 'react';
import { GameState, GamePhase, ChatMessage, Character, GameMode, MatchHistory } from '../types';
import { OpenRouterHost } from '../openrouterService';

interface MainGameProps {
  initialState: GameState;
  onRestart: () => void;
}

const CharacterModal: React.FC<{ character: Character; onClose: () => void; onSave?: (character: Character) => void; isSaved?: boolean }> = ({ character, onClose, onSave, isSaved }) => {
  const saveButtonClasses = isSaved
    ? 'bg-white text-dr-pink border-white cursor-not-allowed'
    : 'bg-dr-dark/40 text-white border-white/40 hover:bg-white hover:text-dr-pink';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-dr-card border-2 border-dr-pink rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,0,127,0.4)] animate-in zoom-in slide-in-from-bottom-8 duration-300" onClick={e => e.stopPropagation()}>
        <div className="bg-dr-pink p-6 text-white flex gap-4 items-start">
          <div className="shrink-0 w-24 h-24 bg-dr-dark rounded-xl border-2 border-white/20 overflow-hidden shadow-lg relative">
            {character.avatarUrl ? (
              <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 animate-pulse">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
              </div>
            )}
            {character.status !== 'ALIVE' && (
              <div className="absolute inset-0 bg-dr-pink/40 flex items-center justify-center">
                <div className="w-full h-1 bg-white rotate-45 absolute"></div>
                <div className="w-full h-1 bg-white -rotate-45 absolute"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:scale-125 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-80">Report Card</div>
            <h2 className="text-3xl font-black italic uppercase leading-none mb-1 truncate">{character.name}</h2>
            <div className="text-sm font-bold uppercase tracking-widest truncate">{character.ultimateTitle || 'Ultimate ???'}</div>
          </div>
          {onSave && (
            <button
              disabled={isSaved}
              aria-disabled={isSaved}
              aria-label={isSaved ? 'Profile saved to archive' : 'Save profile to archive'}
              className={`ml-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${saveButtonClasses}`}
              {...(!isSaved && { onClick: () => onSave(character) })}
            >
              {isSaved ? '✓ Saved' : 'Save Profile'}
            </button>
          )}
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-dr-pink tracking-widest mb-1">Status</div>
              <div className={`text-sm font-bold uppercase px-2 py-1 rounded inline-block ${character.status === 'ALIVE' ? 'bg-green-500/10 text-green-500' : 'bg-dr-pink/10 text-dr-pink'}`}>{character.status}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-dr-pink tracking-widest mb-1">Origin</div>
              <div className="text-sm font-bold opacity-80">{character.origin || 'Original'}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-dr-pink tracking-widest mb-2">Backstory & Profile</div>
            <div className="bg-dr-dark p-4 rounded-xl border border-white/5 h-32 overflow-y-auto custom-scrollbar text-sm leading-relaxed text-slate-300">
              {character.backstory || character.description || 'No data available.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainGame: React.FC<MainGameProps> = ({ initialState, onRestart }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isGeneratingAvatars, setIsGeneratingAvatars] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const galleryRef = useRef<Character[]>([]);
  const galleryLoadedRef = useRef(false);

  const [isAutoOn, setIsAutoOn] = useState(false);
  const autoCountRef = useRef(0);
  const autoTimeoutRef = useRef<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const host = useRef(new OpenRouterHost());

  const readGallery = (): Character[] => {
    try {
      return JSON.parse(localStorage.getItem('dr_gallery') || '[]');
    } catch {
      return [];
    }
  };

  const ensureGalleryLoaded = () => {
    if (galleryLoadedRef.current) return;
    const gallery = readGallery();
    galleryRef.current = gallery;
    setSavedIds(new Set(gallery.map((g) => g.id)));
    galleryLoadedRef.current = true;
  };

  const writeGallery = (gallery: Character[]) => {
    localStorage.setItem('dr_gallery', JSON.stringify(gallery));
    galleryRef.current = gallery;
  };

  const bumpSavedIds = (ids: Iterable<string>) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  };

  const upsertGalleryEntry = (gallery: Character[], character: Character, updateOnly: boolean) => {
    const idx = gallery.findIndex((g) => g.id === character.id);
    if (idx === -1 && updateOnly) return null;
    const history = idx > -1 ? gallery[idx].history || [] : [];
    const payload = { ...character, history };
    if (idx > -1) gallery[idx] = payload;
    else gallery.push(payload);
    return gallery;
  };

  const persistGalleryCharacter = (character: Character, options?: { updateOnly?: boolean }): boolean => {
    ensureGalleryLoaded();
    const updateOnly = options?.updateOnly ?? false;
    const gallery = upsertGalleryEntry([...galleryRef.current], character, updateOnly);
    if (!gallery) return false;
    writeGallery(gallery);
    bumpSavedIds([character.id]);
    return true;
  };

  const isCharacterSaved = (character: Character | null) => {
    if (!character) return false;
    ensureGalleryLoaded();
    return savedIds.has(character.id);
  };

  useEffect(() => {
    if (gameState.messages.length === 0) handleInitialPrompt();
    return () => { if (autoTimeoutRef.current) window.clearTimeout(autoTimeoutRef.current); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    autoSave();
  }, [gameState.messages, gameState.characters]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [streamingText]);

  // Character Profile Generation Loop
  useEffect(() => {
    const char = gameState.characters.find(c => !c.avatarUrl && c.ultimateTitle);
    if (char && !isGeneratingAvatars) generateNextAvatar(char);
  }, [gameState.characters, isGeneratingAvatars]);

  // Auto Mode Loop Logic
  useEffect(() => {
    if (isAutoOn && !isTyping && autoCountRef.current < 5) {
      const lastMsg = gameState.messages[gameState.messages.length - 1];
      const needsDecision = lastMsg?.role === 'model' && (
        lastMsg.content.trim().endsWith('?') || 
        /\b(choose|select|decide|what do you|which one|pick|your choice)\b/i.test(lastMsg.content)
      );

      if (needsDecision) {
        setIsAutoOn(false);
        autoCountRef.current = 0;
      } else {
        autoTimeoutRef.current = window.setTimeout(() => {
          autoCountRef.current += 1;
          handleContinue();
        }, 2000 + Math.random() * 500);
      }
    } else if (autoCountRef.current >= 5) {
      setIsAutoOn(false);
      autoCountRef.current = 0;
    }
  }, [isAutoOn, isTyping, gameState.messages]);

  const autoSave = () => {
    localStorage.setItem('dr_current_session', JSON.stringify(gameState));
    const slots = JSON.parse(localStorage.getItem('dr_save_slots') || '{}');
    slots[gameState.id] = { id: gameState.id, title: gameState.title, lastPlayed: Date.now(), state: gameState };
    localStorage.setItem('dr_save_slots', JSON.stringify(slots));
  };

  const handleInitialPrompt = async () => {
    setIsTyping(true);
    setStreamingText('');
    try {
      const fullResponse = await host.current.getResponseStream(
        gameState,
        `Initialize the game for the cycle: ${gameState.title}. Reveal the full cast and assign Titles.`,
        (chunk) => setStreamingText(prev => (prev ?? '') + chunk),
      );
      setStreamingText(null);
      await processResponse(fullResponse);
    } catch (err) { console.error(err); setStreamingText(null); }
    finally { setIsTyping(false); }
  };

  const generateNextAvatar = async (character: Character) => {
    setIsGeneratingAvatars(true);
    const url = await host.current.generateAvatar(character);
    if (url) {
      const withAvatar = { ...character, avatarUrl: url };
      persistGalleryCharacter(withAvatar, { updateOnly: true });
      setGameState(prev => ({
        ...prev,
        characters: prev.characters.map(c => c.id === character.id ? { ...c, avatarUrl: url } : c)
      }));
    }
    setIsGeneratingAvatars(false);
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    host.current.speak(text);
  };

  const processResponse = async (response: string) => {
    let nextPhase = gameState.phase;
    const lowerResp = response.toLowerCase();
    
    if (lowerResp.includes("daily life")) nextPhase = GamePhase.DAILY_LIFE;
    if (lowerResp.includes("body has been discovered")) nextPhase = GamePhase.INCIDENT;
    if (lowerResp.includes("investigation begin")) nextPhase = GamePhase.INVESTIGATION;
    if (lowerResp.includes("it is time for the class trial")) nextPhase = GamePhase.TRIAL;
    if (lowerResp.includes("execution time")) nextPhase = GamePhase.RESOLUTION;
    if (lowerResp.includes("killing game has ended") || lowerResp.includes("game over")) nextPhase = GamePhase.ENDGAME;

    let updatedCharacters = [...gameState.characters];
    const updateMatch = response.match(/<CHARACTER_UPDATE>([\s\S]*?)<\/CHARACTER_UPDATE>/);
    if (updateMatch) {
      try {
        const jsonStr = updateMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          updatedCharacters = parsed.map(nc => {
            const ex = gameState.characters.find(c => c.name === nc.name); // Find by name to be safer across turns
            return ex?.avatarUrl ? { ...nc, avatarUrl: ex.avatarUrl } : nc;
          });
          // Update persistent gallery too
          ensureGalleryLoaded();
          const gallery: Character[] = [...galleryRef.current];
          const newIds: string[] = [];
          updatedCharacters.forEach((uc) => {
            const updated = upsertGalleryEntry(gallery, uc, false);
            if (updated) newIds.push(uc.id);
          });
          writeGallery(gallery);
          if (newIds.length) bumpSavedIds(newIds);
        }
      } catch (e) { console.error("Failed to parse character update", e); }
    }

    const clean = response.replace(/<CHARACTER_UPDATE>[\s\S]*?<\/CHARACTER_UPDATE>/g, "").trim();
    setGameState(prev => ({
      ...prev,
      phase: nextPhase,
      characters: updatedCharacters,
      messages: [...prev.messages, { role: 'model', content: clean }],
      turnCount: prev.turnCount + 1
    }));

    speakText(clean);
  };

  const handleSubmit = async (e?: React.FormEvent, customValue?: string) => {
    if (e) e.preventDefault();
    const value = customValue !== undefined ? customValue : inputValue;
    if ((!value.trim() && customValue === undefined) || isTyping) return;
    
    if (customValue === undefined) {
      setGameState(prev => ({ ...prev, messages: [...prev.messages, { role: 'user', content: value }] }));
      setInputValue('');
      autoCountRef.current = 0;
    }

    setIsTyping(true);
    setStreamingText('');
    try {
      const fullResponse = await host.current.getResponseStream(
        gameState,
        value || "Continue the story.",
        (chunk) => setStreamingText(prev => (prev ?? '') + chunk),
      );
      setStreamingText(null);
      await processResponse(fullResponse);
    } catch (err) { console.error(err); setStreamingText(null); }
    finally { setIsTyping(false); }
  };

  const handleContinue = () => {
    handleSubmit(undefined, "Continue the story.");
  };

  const handleSaveCharacterProfile = (character: Character) => {
    persistGalleryCharacter(character);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4 lg:p-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 order-2 lg:order-1 h-auto lg:h-full">
        <div className="bg-dr-card p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-xl font-black text-dr-pink uppercase italic">Status</h2>
             <button onClick={() => setIsMuted(!isMuted)} className={`p-1 transition-colors ${isMuted ? 'text-white/20' : 'text-dr-pink'}`}>
               {isMuted ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
             </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-60 font-bold text-xs uppercase">Phase</span>
              <span className="text-dr-pink font-black uppercase tracking-tight">{gameState.phase}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60 font-bold text-xs uppercase">Alive</span>
              <span className="font-bold">{gameState.characters.filter(c => c.status === 'ALIVE').length} / 16</span>
            </div>
          </div>
        </div>

        <div className="bg-dr-card flex-1 p-4 rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-black text-dr-pink uppercase italic">Class Registry</h2>
            {isGeneratingAvatars && <div className="w-2 h-2 bg-dr-pink rounded-full animate-pulse"></div>}
          </div>
          <div className="overflow-y-auto pr-2 space-y-2 flex-1 custom-scrollbar">
            {gameState.characters.map((char) => (
              <button 
                key={char.id} 
                onClick={() => setSelectedCharacter(char)} 
                className={`w-full text-left p-2 rounded-lg border transition-all flex gap-3 items-center ${char.status === 'ALIVE' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-dr-pink/50 bg-dr-pink/10 opacity-60 grayscale'}`}
              >
                <div className="shrink-0 w-10 h-10 bg-dr-dark rounded border border-white/10 overflow-hidden relative shadow-inner">
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} className="w-full h-full object-cover" alt={char.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 text-[10px] uppercase font-black">{char.name[0]}</div>
                  )}
                  {char.status !== 'ALIVE' && <div className="absolute inset-0 bg-dr-pink/20 flex items-center justify-center"><div className="w-full h-[1px] bg-white rotate-45"></div></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[8px] text-dr-pink uppercase truncate tracking-wider">{char.ultimateTitle || 'Ultimate ???'}</div>
                  <div className="font-bold text-xs truncate leading-tight">{char.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onRestart} className="bg-dr-dark border border-white/10 text-white/50 hover:text-dr-pink py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Exit to Hub</button>
      </div>

      {/* Narrative View */}
      <div className="flex-1 flex flex-col bg-dr-card rounded-xl border border-white/10 overflow-hidden order-1 lg:order-2">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 scroll-smooth custom-scrollbar">
          {gameState.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] lg:max-w-[85%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-dr-pink text-white rounded-tr-none shadow-lg shadow-dr-pink/20' : 'bg-dr-dark border border-white/10 rounded-tl-none border-l-4 border-l-dr-pink'}`}>
                {msg.role === 'model' && <div className="text-dr-pink font-black text-[10px] mb-2 uppercase tracking-[0.2em]">{gameState.hostName}</div>}
                <div className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base font-medium">{msg.content}</div>
              </div>
            </div>
          ))}
          {streamingText !== null && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="max-w-[90%] lg:max-w-[85%] rounded-2xl p-5 bg-dr-dark border border-white/10 rounded-tl-none border-l-4 border-l-dr-pink">
                <div className="text-dr-pink font-black text-[10px] mb-2 uppercase tracking-[0.2em]">{gameState.hostName}</div>
                <div className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base font-medium">
                  {streamingText.replace(/<CHARACTER_UPDATE>[\s\S]*?<\/CHARACTER_UPDATE>/g, '').trimEnd()}
                  <span className="inline-block w-[2px] h-[1em] bg-dr-pink align-middle ml-0.5 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          {isTyping && streamingText === null && (
            <div className="flex justify-start">
              <div className="bg-dr-dark border border-white/10 rounded-2xl rounded-tl-none p-5 flex gap-2">
                <div className="w-2 h-2 bg-dr-pink rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-dr-pink rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-dr-pink rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input & Controls */}
        <div className="p-4 lg:p-6 bg-dr-dark/80 backdrop-blur-md border-t border-white/10 space-y-4">
          <div className="flex flex-wrap items-center gap-4 px-2">
             <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isAutoOn} onChange={(e) => { setIsAutoOn(e.target.checked); autoCountRef.current = 0; }} />
                  <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dr-pink"></div>
                  <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-white/50">Auto Mode</span>
                </label>
             </div>
             
             {gameState.mode === GameMode.WATCH && (
               <button onClick={handleContinue} disabled={isTyping} className="text-[10px] font-black uppercase tracking-widest text-dr-pink border border-dr-pink/30 hover:bg-dr-pink hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-30">
                 Continue Story
               </button>
             )}

             {isAutoOn && <div className="text-[10px] font-black uppercase tracking-widest text-dr-pink animate-pulse">Auto Running: {autoCountRef.current + 1}/5</div>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isTyping} placeholder={isTyping ? "Awaiting host..." : "Enter your choice..."} className="flex-1 bg-dr-card border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-dr-pink outline-none transition-all disabled:opacity-50 text-sm placeholder:opacity-30" />
            <button type="submit" disabled={isTyping || !inputValue.trim()} className="bg-dr-pink text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-dr-pink/80 transition-all disabled:opacity-50 shadow-lg shadow-dr-pink/20">PROCEED</button>
          </form>
        </div>
      </div>
      {selectedCharacter && (
        <CharacterModal 
          character={selectedCharacter} 
          onClose={() => setSelectedCharacter(null)} 
          onSave={handleSaveCharacterProfile}
          isSaved={isCharacterSaved(selectedCharacter)}
        />
      )}
    </div>
  );
};

export default MainGame;
