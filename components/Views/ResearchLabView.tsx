import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { TECH_TREE } from '../../data/techTree';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { formatMoney } from '../../utils/formatters';
import { Beaker, Lock, Check, Clock, AlertTriangle, Lightbulb } from 'lucide-react';

export const ResearchLabView: React.FC = () => {
  const { money, researchPoints, year, unlockedTechIds, researchTech, calculateTechCost } = useGame();

  const currentEra = Math.floor(year / 10);
  
  // Show techs unlocked OR available within the next 2 eras (20 years)
  // We filter out techs that are complete unless we want to show a "Done" list (we do)
  const visibleTechs = TECH_TREE.filter(t => {
      const techEra = Math.floor(t.unlockYear / 10);
      return techEra <= currentEra + 2; 
  });

  const availableTechs = visibleTechs.filter(t => !unlockedTechIds.includes(t.id));
  const completedTechs = visibleTechs.filter(t => unlockedTechIds.includes(t.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Research Center Header */}
      <div className="lg:col-span-3">
        <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-lg flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Beaker className="text-purple-400" /> Advanced R&D
                </h2>
                <p className="text-slate-400 mt-1">
                    Design new vehicles to generate 
                    <span className="text-blue-400 font-bold mx-1"><Lightbulb size={14} className="inline mb-1"/> Research Points</span> 
                    and unlock the future.
                </p>
            </div>
            <div className="text-right">
                <div className="text-xs text-purple-300 uppercase font-bold">Current Era</div>
                <div className="text-3xl font-mono font-bold text-white">{currentEra}0s</div>
            </div>
        </div>
      </div>

      {/* Main List */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Available Section */}
        <div className="space-y-4">
            <h3 className="text-slate-400 font-bold uppercase text-sm tracking-wider flex justify-between">
                <span>Available Projects</span>
                <span className="text-blue-400 flex items-center gap-1"><Lightbulb size={14} /> RP Balance: {researchPoints}</span>
            </h3>
            
            {availableTechs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-700 border-dashed rounded-lg">
                    No new technology currently visible. Advance time or check back later.
                </div>
            ) : (
                availableTechs.map(tech => {
                    const costs = calculateTechCost(tech);
                    const canAffordMoney = money >= costs.money;
                    const canAffordRp = researchPoints >= costs.rp;
                    const isFuture = costs.multiplier > 1;

                    return (
                        <div 
                            key={tech.id} 
                            className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start gap-4 transition-all
                                ${isFuture ? 'bg-slate-900/80 border-amber-900/50' : 'bg-slate-800 border-slate-600'}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg text-white">{tech.name}</h4>
                                    {isFuture && (
                                        <div className="flex items-center gap-1 bg-amber-900/40 text-amber-500 text-xs px-2 py-0.5 rounded border border-amber-900">
                                            <AlertTriangle size={12} />
                                            <span>Future Tech (+{Math.round((costs.multiplier - 1) * 100)}% Cost)</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400">{tech.description}</p>
                                <div className="mt-2 flex gap-3 text-xs">
                                    <span className="bg-slate-900 px-2 py-1 rounded text-slate-500 uppercase">{tech.type}</span>
                                    <span className="text-slate-500 flex items-center gap-1"><Clock size={12}/> Era: {Math.floor(tech.unlockYear/10)}0s</span>
                                </div>
                            </div>

                            <div className="shrink-0 flex flex-col items-end gap-2 min-w-[140px]">
                                <div className="text-right">
                                    <div className={`font-mono font-bold ${isFuture ? 'text-amber-400' : 'text-white'}`}>
                                        {formatMoney(costs.money)}
                                    </div>
                                    <div className={`font-mono text-sm font-bold flex items-center justify-end gap-1 ${canAffordRp ? 'text-blue-400' : 'text-red-400'}`}>
                                        <Lightbulb size={12} /> {costs.rp} RP
                                    </div>
                                </div>
                                
                                <Button 
                                    size="sm" 
                                    variant="primary" 
                                    disabled={!canAffordMoney || !canAffordRp}
                                    onClick={() => researchTech(tech.id)}
                                    className="w-full"
                                >
                                    {!canAffordMoney ? 'Need Funds' : !canAffordRp ? 'Need RP' : 'Research'}
                                </Button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Completed Section (Collapsed view or simpler list) */}
        {completedTechs.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-800">
                <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">Researched</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {completedTechs.map(tech => (
                        <div key={tech.id} className="flex items-center gap-3 p-3 rounded bg-slate-900/30 border border-emerald-900/20 opacity-70">
                            <Check size={16} className="text-emerald-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-400 text-sm">{tech.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>

      {/* Info Sidebar */}
      <div className="space-y-6">
         <Card title="R&D Guide">
             <div className="space-y-4 text-sm text-slate-400">
                 <p>
                     <strong className="text-white">Research Points (RP)</strong> are earned by completing vehicle engineering projects. 
                     Complex cars and innovative parts yield more data.
                 </p>
                 <hr className="border-slate-700" />
                 <p>
                     <strong className="text-white">Future Tax:</strong> You can research technology from future eras ahead of time, 
                     but it incurs a massive cost penalty in both Money and RP.
                 </p>
                 <div className="bg-amber-900/20 p-3 rounded border border-amber-900/30 text-xs">
                     <div className="flex justify-between mb-1">
                         <span>1 Era Gap (10y)</span>
                         <span className="text-amber-400 font-bold">+50% Cost</span>
                     </div>
                     <div className="flex justify-between">
                         <span>2 Era Gap (20y)</span>
                         <span className="text-red-400 font-bold">+100% Cost</span>
                     </div>
                 </div>
             </div>
         </Card>
      </div>

    </div>
  );
};
