import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatMoney, formatDate } from '../../utils/formatters';
import { Button } from '../UI/Button';
import { Play, Pause, FastForward, Activity, DollarSign, Calendar, TrendingUp, TrendingDown, Settings, Lightbulb, Bell } from 'lucide-react';
import { SettingsModal } from '../Modals/SettingsModal';
import { LanguageSwitcher } from '../UI/LanguageSwitcher';

export const TopBar: React.FC = () => {
  const { 
    money, 
    researchPoints,
    date, 
    brandPrestige, 
    isPaused, 
    gameSpeed,
    lastWeeklyProfit,
    togglePause, 
    setGameSpeed,
    notifications
  } = useGame();

  const { t } = useLanguage();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const isProfit = lastWeeklyProfit >= 0;
  const recentNotif = notifications[0];

  return (
    <>
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
      
      {/* Brand Identity */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-blue-500/20 shadow-lg">
          A
        </div>
        <span className="text-xl font-bold tracking-tight text-white hidden md:block">
          Auto Tycoon
        </span>
      </div>

      {/* Resources Display Group */}
      <div className="flex items-center space-x-4 md:space-x-8">
        
        {/* Money Block */}
        <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 text-emerald-400">
                <DollarSign size={16} />
                <span className="font-mono font-bold text-lg">{formatMoney(money)}</span>
            </div>
            {/* Weekly Profit Indicator */}
            <div className={`text-[10px] font-mono flex items-center gap-1 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                {isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isProfit ? '+' : ''}{formatMoney(lastWeeklyProfit)} / {t('common.week').toLowerCase()}
            </div>
        </div>

        <div className="h-8 w-px bg-slate-700/50 hidden md:block"></div>

        {/* RP Block (New) */}
        <div className="flex items-center space-x-2 text-blue-400" title={t('common.researchPoints')}>
          <Lightbulb size={18} />
          <span className="font-mono font-bold">{researchPoints}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider hidden sm:inline">{t('common.rp')}</span>
        </div>

        <div className="h-8 w-px bg-slate-700/50 hidden md:block"></div>

        {/* Date Block */}
        <div className="flex items-center space-x-2 text-slate-300">
          <Calendar size={18} />
          <span className="font-mono font-medium">{formatDate(date)}</span>
        </div>

        <div className="h-8 w-px bg-slate-700/50 hidden md:block"></div>

        {/* Prestige Block */}
        <div className="flex items-center space-x-2 text-amber-400">
          <Activity size={18} />
          <span className="font-bold">{brandPrestige}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider hidden sm:inline">{t('common.prestige')}</span>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex items-center gap-3">
        
        {/* Language Switcher */}
        <LanguageSwitcher className="hidden md:flex" />

        {/* Notification Bell */}
        <div className="relative">
            <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className={`p-2 rounded-full hover:bg-slate-800 transition-colors ${notifications.length > 0 ? 'text-white' : 'text-slate-500'}`}
            >
                <Bell size={18} />
                {recentNotif && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
            </button>
            
            {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-slate-400">Recent Events</div>
                    <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 && <div className="p-4 text-center text-slate-500 text-xs">No notifications</div>}
                        {notifications.map(n => (
                            <div key={n.id} className="p-3 border-b border-slate-700/50 text-xs hover:bg-slate-700/50">
                                <div className="flex justify-between mb-1">
                                    <span className={`font-bold ${n.type === 'alert' ? 'text-red-400' : n.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {n.type.toUpperCase()}
                                    </span>
                                    <span className="text-slate-500">{n.date}</span>
                                </div>
                                <div className="text-slate-200">{n.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="h-6 w-px bg-slate-700/50 mx-1"></div>

        {/* Speed Controls */}
        <div className="flex bg-slate-800 rounded-md p-1 border border-slate-700 items-center">
            <button
                onClick={() => { togglePause(); }}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isPaused ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title="Pause"
            >
                <Pause size={16} fill="currentColor" />
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button
                onClick={() => { if(isPaused) togglePause(); setGameSpeed(1); }}
                className={`px-3 h-8 flex items-center gap-1 text-xs font-bold rounded transition-colors ${!isPaused && gameSpeed === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title="Normal Speed (2s/week)"
            >
                <Play size={14} fill="currentColor" />
            </button>
            <button
                onClick={() => { if(isPaused) togglePause(); setGameSpeed(2); }}
                className={`px-3 h-8 flex items-center gap-1 text-xs font-bold rounded transition-colors ${!isPaused && gameSpeed === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title="Fast Forward (0.5s/week)"
            >
                <FastForward size={14} fill="currentColor" />
            </button>
        </div>

        <div className="h-6 w-px bg-slate-700/50 mx-1"></div>

        <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-9 flex items-center justify-center text-slate-400 hover:text-white"
        >
            <Settings size={18} />
        </Button>
      </div>
    </div>
    
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};