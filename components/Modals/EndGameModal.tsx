
import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { NeonButton } from '../UI/NeonButton';
import { formatMoney, formatNumber } from '../../utils/formatters';
import { Trophy, AlertOctagon, TrendingUp, Car, Calendar, Repeat, Play } from 'lucide-react';

export const EndGameModal: React.FC = () => {
  const { endGameState, money, brandPrestige, developedCars, date, resetGame, continuePlaying } = useGame();

  if (endGameState === 'playing') return null;

  const isVictory = endGameState === 'victory';
  const yearsPlayed = Math.floor(date / 365);
  const bestCar = developedCars.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-1000">
      <div className={`relative w-full max-w-2xl rounded-lg border-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden ${isVictory ? 'border-amber-500/50 shadow-amber-500/20' : 'border-red-600/50 shadow-red-600/20'}`}>
        
        {/* Background Effects */}
        <div className={`absolute inset-0 opacity-20 ${isVictory ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-700 via-slate-900 to-black' : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 via-slate-950 to-black'}`}></div>
        
        {/* Content Container */}
        <div className="relative p-8 md:p-12 text-center">
            
            {/* Icon & Header */}
            <div className="mb-6 flex justify-center">
                <div className={`p-6 rounded-full border-4 ${isVictory ? 'bg-amber-900/30 border-amber-500 text-amber-400' : 'bg-red-900/30 border-red-500 text-red-500'}`}>
                    {isVictory ? <Trophy size={64} /> : <AlertOctagon size={64} />}
                </div>
            </div>

            <h1 className={`text-4xl md:text-5xl font-bold font-tech uppercase tracking-widest mb-4 ${isVictory ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-sm' : 'text-red-500'}`}>
                {isVictory ? 'Automotive Tycoon' : 'Bankruptcy Declared'}
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                {isVictory 
                    ? "You have built an industrial empire that will stand the test of time. Your brand is legendary, and your fortune is vast."
                    : "The board of directors has dissolved the company due to insurmountable debt. Your factories are silent."
                }
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1"><TrendingUp size={12}/> Final Balance</div>
                    <div className={`font-mono font-bold ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>{formatMoney(money)}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1"><Trophy size={12}/> Prestige</div>
                    <div className="font-mono font-bold text-amber-400">{formatNumber(brandPrestige)}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Duration</div>
                    <div className="font-mono font-bold text-blue-400">{yearsPlayed} Years</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1"><Car size={12}/> Best Seller</div>
                    <div className="font-mono font-bold text-white truncate" title={bestCar?.name || 'None'}>{bestCar?.name || 'N/A'}</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                {isVictory && (
                    <NeonButton variant="success" size="lg" onClick={continuePlaying} className="min-w-[200px]">
                        <span className="flex items-center gap-2"><Play size={20} /> Continue in Sandbox</span>
                    </NeonButton>
                )}
                
                <NeonButton 
                    variant={isVictory ? "secondary" : "danger"} 
                    size="lg" 
                    onClick={resetGame}
                    className="min-w-[200px]"
                >
                    <span className="flex items-center gap-2"><Repeat size={20} /> {isVictory ? 'Retire (New Game)' : 'Factory Reset'}</span>
                </NeonButton>
            </div>

        </div>
      </div>
    </div>
  );
};
