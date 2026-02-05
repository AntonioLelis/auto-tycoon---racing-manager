
import React, { useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'; // Import LanguageProvider
import { TopBar } from './components/Layout/TopBar';
import { FactoryView } from './components/Views/FactoryView';
import { RacingView } from './components/Views/RacingView';
import { EngineDesignerView } from './components/Views/EngineDesignerView';
import { ResearchLabView } from './components/Views/ResearchLabView';
import { B2BView } from './components/Views/B2BView';
import { AnalyticsView } from './components/Views/AnalyticsView';
import { BankView } from './components/Views/BankView';
import { Car, Trophy, Beaker, Wrench, Briefcase, BarChart2, Zap, Landmark } from 'lucide-react';
import { OnboardingModal } from './components/Modals/OnboardingModal';
import { EndGameModal } from './components/Modals/EndGameModal';
import { TutorialChecklist } from './components/Widgets/TutorialChecklist';
import { NewsTicker } from './components/Widgets/NewsTicker';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'factory' | 'rnd' | 'research' | 'racing' | 'b2b' | 'analytics' | 'bank'>('factory');
  const { t } = useLanguage(); 

  const NavButton = ({ tab, icon: Icon, label, colorClass }: any) => (
      <button
        onClick={() => setActiveTab(tab)}
        className={`w-full flex items-center space-x-3 p-3 transition-all duration-200 border-l-4 group relative overflow-hidden ${
          activeTab === tab
            ? `bg-slate-800/80 ${colorClass} border-${colorClass.split('-')[1]}-500` 
            : 'text-slate-500 border-transparent hover:bg-slate-800/40 hover:text-slate-300'
        }`}
      >
        <div className={`absolute inset-0 opacity-10 bg-${colorClass.split('-')[1]}-500 translate-x-[-100%] ${activeTab === tab ? 'translate-x-0' : 'group-hover:translate-x-[-50%]'} transition-transform duration-300`}></div>
        <Icon size={20} className={activeTab === tab ? 'animate-pulse' : ''} />
        <span className={`hidden md:block font-bold uppercase tracking-wider text-sm ${activeTab === tab ? 'text-white' : ''}`}>
            {label}
        </span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative overflow-hidden">
      
      {/* HUD OVERLAYS */}
      <div className="scanlines"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10"></div>

      {/* Global Top Bar */}
      <div className="relative z-20">
        <NewsTicker />
        <TopBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar / Navigation */}
        <aside className="w-16 md:w-64 bg-slate-950/80 border-r border-slate-800 flex-shrink-0 flex flex-col z-20">
          <nav className="flex-1 py-4 space-y-1">
            <NavButton tab="factory" icon={Car} label={t('menu.factory')} colorClass="text-blue-400" />
            <NavButton tab="rnd" icon={Wrench} label={t('menu.rnd')} colorClass="text-purple-400" />
            <NavButton tab="research" icon={Beaker} label={t('menu.research')} colorClass="text-emerald-400" />
            <NavButton tab="b2b" icon={Briefcase} label={t('menu.b2b')} colorClass="text-amber-400" />
            <NavButton tab="bank" icon={Landmark} label={t('menu.bank')} colorClass="text-yellow-400" />
            <NavButton tab="analytics" icon={BarChart2} label={t('menu.analytics')} colorClass="text-cyan-400" />
            <NavButton tab="racing" icon={Trophy} label={t('menu.motorsport')} colorClass="text-red-400" />
          </nav>
          
          <div className="p-4 border-t border-slate-800 hidden md:block">
            <div className="flex flex-col items-center justify-center gap-1 text-slate-600 font-mono">
                <div className="flex items-center gap-2 text-[10px]">
                    <Zap size={10} className="text-yellow-500"/>
                    <span>SYSTEM ONLINE</span>
                </div>
                <div className="text-[10px] opacity-50">v1.0.0 (Public)</div>
            </div>
          </div>
        </aside>

        {/* Viewport */}
        <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex items-end justify-between border-b border-slate-800 pb-2">
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 inline-block skew-x-[-12deg]"></span>
                {activeTab === 'factory' && t('menu.factory')}
                {activeTab === 'rnd' && t('menu.rnd')}
                {activeTab === 'research' && t('menu.research')}
                {activeTab === 'b2b' && t('menu.b2b')}
                {activeTab === 'bank' && t('menu.bank')}
                {activeTab === 'analytics' && t('menu.analytics')}
                {activeTab === 'racing' && t('menu.motorsport')}
              </h1>
            </header>

            {/* Dynamic View Rendering */}
            <div className="flex-1 min-h-0">
              {activeTab === 'factory' && <FactoryView />}
              {activeTab === 'rnd' && <EngineDesignerView />}
              {activeTab === 'research' && <ResearchLabView />}
              {activeTab === 'b2b' && <B2BView />}
              {activeTab === 'bank' && <BankView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'racing' && <RacingView />}
            </div>
          </div>
        </main>

      </div>

      {/* MODALS & WIDGETS */}
      <OnboardingModal />
      <EndGameModal />
      <TutorialChecklist />

    </div>
  );
};

// Wrap AppContent with Providers
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </LanguageProvider>
  );
};

export default App;
