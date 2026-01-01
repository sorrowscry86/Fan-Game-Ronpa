
import React, { useState, useEffect } from 'react';
import Setup from './components/Setup';
import MainGame from './components/MainGame';
import Gallery from './components/Gallery';
import Sandbox from './components/Sandbox';
import { GameState, GamePhase, GameMode, SaveSlot } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [view, setView] = useState<'HOME' | 'SETUP' | 'GALLERY' | 'SANDBOX'>('HOME');
  const [slots, setSlots] = useState<SaveSlot[]>([]);

  useEffect(() => {
    const slotsRaw = localStorage.getItem('dr_save_slots') || '{}';
    const parsed = JSON.parse(slotsRaw);
    setSlots(Object.values(parsed));
  }, [view, gameState]);

  const handleSetupComplete = (setupData: Partial<GameState>) => {
    const fullState: GameState = {
      id: setupData.id || `game-${Date.now()}`,
      title: setupData.title || 'Untitled Game',
      isLocked: true,
      phase: GamePhase.INTRODUCTION,
      mode: setupData.mode || GameMode.WATCH,
      theme: setupData.theme || 'Academy',
      hostName: setupData.hostName || 'Host',
      restrictions: setupData.restrictions || '',
      characters: setupData.characters || [],
      evidence: [],
      messages: [],
      turnCount: 0
    };
    setGameState(fullState);
    setView('HOME');
  };

  const handleLoadSlot = (slot: SaveSlot) => setGameState(slot.state);

  const handleDeleteSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this death game record?")) {
      const slots = JSON.parse(localStorage.getItem('dr_save_slots') || '{}');
      delete slots[id];
      localStorage.setItem('dr_save_slots', JSON.stringify(slots));
      setSlots(Object.values(slots));
    }
  };

  const handleRestart = () => {
    if (confirm("Return to hub?")) {
      setGameState(null);
      setView('HOME');
    }
  };

  if (gameState) {
    return (
      <div className="min-h-screen flex flex-col bg-dr-dark text-slate-200 selection:bg-dr-pink selection:text-white">
        <header className="p-4 lg:p-6 flex justify-between items-center border-b border-white/5 z-10 bg-dr-dark/50 backdrop-blur-md">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-dr-pink rounded-lg flex items-center justify-center font-black text-2xl italic shadow-[0_0_15px_rgba(255,0,127,0.5)]">R</div><h1 className="text-xl font-black uppercase italic tracking-tighter">{gameState.title}</h1></div>
          <div className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] hidden sm:block">Turn: {gameState.turnCount}</div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          <MainGame initialState={gameState} onRestart={handleRestart} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dr-dark text-slate-200 selection:bg-dr-pink selection:text-white overflow-y-auto">
      <header className="p-4 lg:p-6 flex justify-between items-center border-b border-white/5 z-10 bg-dr-dark/50 backdrop-blur-md">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-dr-pink rounded-lg flex items-center justify-center font-black text-2xl italic tracking-tighter">R</div><h1 className="text-xl font-black uppercase italic tracking-tighter">Fan Game Ronpa</h1></div>
        <div className="flex gap-4">
          <button onClick={() => setView('SANDBOX')} className="text-[10px] font-black uppercase tracking-widest hover:text-dr-pink transition-colors">Sandbox</button>
          <button onClick={() => setView('GALLERY')} className="text-[10px] font-black uppercase tracking-widest text-dr-pink px-4 py-2 border border-dr-pink/30 rounded-lg hover:bg-dr-pink hover:text-white transition-all">Archives</button>
        </div>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        {view === 'GALLERY' ? <Gallery onBack={() => setView('HOME')} /> : view === 'SANDBOX' ? <Sandbox onBack={() => setView('HOME')} /> : view === 'SETUP' ? <div className="w-full max-w-2xl py-10"><Setup onComplete={handleSetupComplete} /><button onClick={() => setView('HOME')} className="w-full mt-4 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Cancel</button></div> : (
          <div className="w-full max-w-4xl space-y-12 py-10">
            <div className="text-center space-y-4">
              <h2 className="text-7xl md:text-9xl font-black italic uppercase leading-[0.8] drop-shadow-[0_10px_20px_rgba(255,0,127,0.4)]">Cycle <br/><span className="text-dr-pink">Hub</span></h2>
              <p className="text-lg opacity-60 font-medium">Your sanctuary between instances of despair.</p>
              <button onClick={() => setView('SETUP')} className="bg-dr-pink text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xl shadow-lg hover:scale-105 active:scale-95 transition-all mt-6">New Killing Game</button>
            </div>
            {slots.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] opacity-30 text-center">Active Games</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.sort((a, b) => b.lastPlayed - a.lastPlayed).map(slot => (
                    <div key={slot.id} onClick={() => handleLoadSlot(slot)} className="bg-dr-card p-6 rounded-2xl border border-white/5 hover:border-dr-pink/50 cursor-pointer group transition-all relative overflow-hidden">
                      <div className="relative z-10 flex justify-between items-start">
                        <div><div className="text-[10px] font-black text-dr-pink uppercase tracking-widest mb-1">{slot.state.phase}</div><h4 className="text-2xl font-black italic uppercase group-hover:text-dr-pink transition-colors">{slot.title}</h4></div>
                        <button onClick={(e) => handleDeleteSlot(slot.id, e)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-dr-pink transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
