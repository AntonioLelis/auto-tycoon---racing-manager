
import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { FLAVOR_NEWS } from '../../constants';
import { Radio, AlertCircle } from 'lucide-react';

export const NewsTicker: React.FC = () => {
  const { activeEvent, date } = useGame();
  const [headline, setHeadline] = useState<string>('');
  
  // Update headline periodically if no active event
  useEffect(() => {
    if (activeEvent) {
        setHeadline(`${activeEvent.title.toUpperCase()} - ${activeEvent.description}`);
    } else {
        // Pick a random flavor text based on date seed (pseudo-random)
        const index = Math.floor(date / 28) % FLAVOR_NEWS.length;
        setHeadline(FLAVOR_NEWS[index]);
    }
  }, [activeEvent, date]);

  return (
    <div className="relative w-full h-8 bg-slate-950 border-b border-amber-900/30 overflow-hidden flex items-center z-40 shadow-sm">
      
      {/* Label Box */}
      <div className={`h-full px-4 flex items-center gap-2 z-20 font-bold text-[10px] uppercase tracking-wider shadow-xl shrink-0 ${activeEvent ? 'bg-red-900/80 text-white animate-pulse' : 'bg-slate-900 text-slate-400'}`}>
          {activeEvent ? <AlertCircle size={14} /> : <Radio size={14} />}
          <span>{activeEvent ? 'BREAKING NEWS' : 'WORLD WIRE'}</span>
      </div>

      {/* Marquee Container */}
      <div className="flex-1 overflow-hidden relative h-full">
          <div className="absolute whitespace-nowrap animate-marquee top-1/2 -translate-y-1/2 text-xs font-mono">
              <span className={activeEvent ? 'text-red-300 font-bold' : 'text-slate-400'}>
                  {headline} ••• {headline} ••• {headline}
              </span>
          </div>
      </div>

      {/* CSS Animation embedded for simplicity */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate(100%, -50%); }
          100% { transform: translate(-100%, -50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
