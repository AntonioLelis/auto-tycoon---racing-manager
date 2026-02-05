import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { NeonButton } from '../UI/NeonButton';
import { Briefcase, Factory } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { tutorial, startTutorial } = useGame();

  // Only show if tutorial is active and at step 0 (Welcome)
  if (!tutorial.isActive || tutorial.currentStep !== 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 border-2 border-blue-500/50 rounded-lg shadow-2xl w-full max-w-lg relative overflow-hidden hud-clip">
        
        {/* Cinematic Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-slate-900 p-6 border-b border-blue-900/30">
            <h1 className="text-2xl font-bold text-white font-tech uppercase tracking-widest flex items-center gap-3">
                <Briefcase className="text-blue-400" /> Executive Order
            </h1>
        </div>

        <div className="p-8 space-y-6">
            <p className="text-slate-300 leading-relaxed text-sm">
                <strong className="text-white block mb-2 text-lg">Welcome, CEO.</strong>
                You have inherited a modest automotive facility. The market is fierce, technology is evolving, and the board expects results.
            </p>
            
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50 flex gap-4 items-start">
                <Factory size={32} className="text-slate-500 mt-1 shrink-0"/>
                <div>
                    <h3 className="text-white font-bold text-sm mb-1">Current Status: Operative</h3>
                    <p className="text-xs text-slate-400">
                        Your factory lines are empty. We have no engines, no chassis, and no revenue.
                    </p>
                </div>
            </div>

            <p className="text-slate-300 text-sm">
                Your first priority is to design a powertrain to serve as the heart of our future lineup.
            </p>

            <div className="pt-4 flex justify-end">
                <NeonButton variant="primary" size="lg" onClick={startTutorial} className="w-full md:w-auto">
                    Initialize Operations
                </NeonButton>
            </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
      </div>
    </div>
  );
};