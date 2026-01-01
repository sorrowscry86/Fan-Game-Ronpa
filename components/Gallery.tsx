
import React from 'react';
import { Character } from '../types';

interface GalleryProps {
  onBack: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onBack }) => {
  const [gallery, setGallery] = React.useState<Character[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('dr_gallery');
    if (saved) setGallery(JSON.parse(saved));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-dr-pink/20 pb-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-dr-pink">Student Archives</h2>
          <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Persistence of Despair</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-dr-dark border border-white/20 text-white px-6 py-2 rounded-lg font-bold hover:bg-white/5 transition-all uppercase text-xs tracking-widest"
        >
          Return
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-20 opacity-30">
          <p className="text-xl font-bold uppercase italic tracking-widest">The archives are empty...</p>
          <p className="text-sm mt-2">Complete a killing game to immortalize its participants.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((char) => (
            <div key={char.id} className="bg-dr-card border border-white/10 rounded-2xl overflow-hidden group hover:border-dr-pink/50 transition-all shadow-xl">
              <div className="flex p-4 gap-4 bg-gradient-to-r from-dr-pink/10 to-transparent">
                <div className="w-20 h-20 bg-dr-dark rounded-xl border border-white/10 overflow-hidden shrink-0">
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-dr-pink uppercase truncate tracking-widest">{char.ultimateTitle}</div>
                  <h3 className="text-xl font-black italic uppercase truncate leading-none mb-1">{char.name}</h3>
                  <div className="text-[10px] opacity-40 font-bold uppercase">{char.origin}</div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-dr-dark/30">
                <div className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Match History</div>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                  {char.history?.map((h, i) => (
                    <div key={i} className="text-[10px] border-l-2 border-dr-pink/30 pl-2 py-1">
                      <div className="flex justify-between font-black uppercase italic text-dr-pink/80">
                        <span>{h.gameTitle}</span>
                        <span className="text-white/50">{h.outcome}</span>
                      </div>
                      <div className="opacity-50 mt-0.5 leading-tight">{h.details}</div>
                    </div>
                  )) || <div className="text-[10px] opacity-20 italic">No recorded history.</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
