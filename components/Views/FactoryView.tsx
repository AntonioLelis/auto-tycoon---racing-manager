import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GlassCard } from '../UI/GlassCard';
import { NeonButton } from '../UI/NeonButton';
import { TechProgressBar } from '../UI/TechProgressBar';
import { TechBadge } from '../UI/TechBadge';
import { formatMoney, formatNumber } from '../../utils/formatters';
import { FACTORY_TIERS } from '../../constants';
import { Car, Settings, PlusCircle, Factory, ArrowUpCircle, AlertTriangle, Trash2, Clock, CheckCircle, Layers } from 'lucide-react';
import { CarDesignerView } from './CarDesignerView';

export const FactoryView: React.FC = () => {
  const { developedCars, unlockedEngines, productionLineBusyUntil, date, liquidateStock, factory, upgradeFactory, calculateCurrentLoad, money } = useGame();
  const [isDesigning, setIsDesigning] = useState(false);

  const load = calculateCurrentLoad();
  const usagePercent = Math.min(100, (load.used / load.capacity) * 100);
  const carsPercent = (load.breakdown.cars / load.capacity) * 100;
  const b2bPercent = (load.breakdown.b2b / load.capacity) * 100;

  const currentTier = FACTORY_TIERS.find(t => t.level === factory.level) || FACTORY_TIERS[0];
  const nextTier = FACTORY_TIERS.find(t => t.level === factory.level + 1);

  if (isDesigning) {
    return <CarDesignerView onBack={() => setIsDesigning(false)} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* LEFT COL: Production Management */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Factory Status Dashboard - METAL PLATE STYLE */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-slate-600">
            {/* Metal Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30 mix-blend-overlay"></div>
            
            <div className="relative p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-600 shadow-inner">
                                <Factory className="text-blue-400" size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-tech font-bold text-white uppercase tracking-widest shadow-black drop-shadow-md">
                                    {currentTier.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <TechBadge variant="active">Level {factory.level}</TechBadge>
                                    <span className="text-xs text-slate-400 font-mono">{currentTier.description}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {nextTier && (
                        <div className="text-right">
                            <NeonButton 
                                size="sm" 
                                variant="warning" 
                                onClick={upgradeFactory}
                                disabled={money < nextTier.upgradeCost}
                                className="flex items-center gap-2"
                            >
                                <ArrowUpCircle size={16} /> Upgrade System ({formatMoney(nextTier.upgradeCost)})
                            </NeonButton>
                        </div>
                    )}
                </div>

                {/* Capacity Visualization - LED STYLE */}
                <div className="space-y-4 bg-black/30 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex justify-between items-end">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-tech">Factory Load Distribution</span>
                         <span className={`font-mono font-bold text-lg ${usagePercent > 90 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                            {Math.round(usagePercent)}%
                         </span>
                    </div>
                    
                    {/* Multi-colored LED Bar */}
                    <div className="w-full h-4 bg-slate-900 rounded-sm overflow-hidden flex relative border border-slate-700 shadow-inner">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_2px,#000_2px)] bg-[length:4px_100%] opacity-30 z-20 pointer-events-none"></div>
                        <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10 transition-all duration-500" style={{ width: `${carsPercent}%` }}></div>
                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] z-10 transition-all duration-500" style={{ width: `${b2bPercent}%` }}></div>
                    </div>

                    <div className="flex justify-between text-xs font-mono text-slate-400 pt-1">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_blue]"></span> Own Production</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_5px_orange]"></span> Contracts</span>
                        </div>
                        <span>{formatNumber(Math.round(load.used))} / {formatNumber(load.capacity)} PU</span>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-600/50 flex justify-end">
                    <NeonButton variant="primary" onClick={() => setIsDesigning(true)}>
                        <PlusCircle size={18} className="mr-2" /> Design New Vehicle
                    </NeonButton>
                </div>
            </div>
        </div>

        <GlassCard title="Production Lines" variant="default">
          {developedCars.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
              <Factory size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-tech text-lg">No active production lines.</p>
              <p className="text-xs mt-2">Design a car to start manufacturing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {developedCars.map((car) => {
                const isSoldOut = car.isReleased && car.inventory <= 0 && (!car.productionState || !car.productionState.isActive);
                const isProducing = car.productionState && car.productionState.isActive;

                return (
                  <div key={car.id} className={`bg-slate-800/40 p-1 rounded-lg border ${isSoldOut ? 'border-red-900/50' : 'border-slate-700'} hover:bg-slate-800/60 transition-colors`}>
                    <div className="p-4 flex flex-col gap-4">
                        {/* Header Row */}
                        <div className="flex justify-between items-start">
                             <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-md shadow-lg border border-white/5 ${isProducing ? 'bg-blue-600 shadow-blue-500/20' : isSoldOut ? 'bg-red-900/50 text-red-500' : 'bg-emerald-900/50 text-emerald-500'}`}>
                                    {isProducing ? <Factory size={20} className="text-white animate-pulse" /> : <Car size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-tech font-bold text-white text-xl flex items-center gap-2">
                                        {car.name} 
                                        {isProducing && <TechBadge variant="active">Active</TechBadge>}
                                        {isSoldOut && <TechBadge variant="danger">Sold Out</TechBadge>}
                                    </h4>
                                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                                        {car.specs.marketPrimary} | MSRP: {formatMoney(car.basePrice)}
                                    </div>
                                </div>
                            </div>

                            {/* Score Box */}
                            {car.isReleased && (
                                 <div className="text-right bg-slate-900/50 px-3 py-1 rounded border border-slate-700">
                                     <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Review Score</div>
                                     <div className={`text-2xl font-tech font-bold ${car.finalReviewScore >= 80 ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : car.finalReviewScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                         {car.finalReviewScore}
                                     </div>
                                 </div>
                            )}
                        </div>

                        {/* Production Progress */}
                        {isProducing && car.productionState && (
                            <div className="bg-slate-900/50 p-3 rounded border border-blue-900/30">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-blue-400 font-bold flex items-center gap-1 uppercase tracking-wide"><Settings size={12} className="animate-spin"/> Assembly Line</span>
                                    <span className="text-slate-300 font-mono">{car.productionState.weeklyRate} / week</span>
                                </div>
                                <TechProgressBar 
                                    value={car.productionState.unitsProduced} 
                                    max={car.productionState.totalBatchTarget} 
                                    color="blue"
                                    showValue={false}
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                                    <span>{formatNumber(car.productionState.unitsProduced)} produced</span>
                                    <span>Target: {formatNumber(car.productionState.totalBatchTarget)}</span>
                                </div>
                            </div>
                        )}

                        {/* Inventory & Sales Data Grid */}
                        {car.isReleased && (
                            <div className="grid grid-cols-3 gap-1 mt-1">
                                 <div className="bg-slate-900/30 p-2 rounded border border-slate-700/50">
                                     <div className="text-[10px] text-slate-500 uppercase font-bold">Stock</div>
                                     <div className={`font-mono font-bold ${car.inventory < 100 ? 'text-red-400' : 'text-slate-200'}`}>
                                         {formatNumber(car.inventory)}
                                     </div>
                                 </div>
                                 <div className="bg-slate-900/30 p-2 rounded border border-slate-700/50">
                                     <div className="text-[10px] text-slate-500 uppercase font-bold">Total Sales</div>
                                     <div className="font-mono font-bold text-white">{formatNumber(car.totalUnitsSold)}</div>
                                 </div>
                                 <div className="bg-slate-900/30 p-2 rounded border border-slate-700/50 flex items-center justify-center">
                                     {car.inventory > 0 && car.inventory < 500 && !isProducing ? (
                                         <button 
                                            onClick={() => liquidateStock(car.id)}
                                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 uppercase font-bold transition-colors"
                                         >
                                             <Trash2 size={12}/> Liquidate
                                         </button>
                                     ) : (
                                         <span className="text-[10px] text-emerald-500/50 italic font-tech uppercase">Market Active</span>
                                     )}
                                 </div>
                            </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* RIGHT COL: Tech & Parts Inventory */}
      <div className="space-y-6">
        <GlassCard title="Parts Warehouse">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-slate-700 pb-1">
                <Settings size={12}/> Power Units
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {unlockedEngines.map(e => (
                  <div key={e.id} className="text-sm bg-slate-900/50 p-2 rounded border-l-2 border-l-blue-500 border-y border-r border-slate-700/50 flex justify-between items-center hover:bg-slate-800 transition-colors">
                    <span className="font-tech font-bold text-slate-200">{e.name}</span>
                    <span className="text-slate-500 text-[10px] font-mono bg-slate-950 px-1 rounded">{e.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-slate-700 pb-1">
                 <Layers size={12}/> Chassis Tech
              </h4>
              <div className="p-3 bg-slate-900/30 rounded text-xs text-slate-400 border border-slate-700/50 italic flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500"/> Custom Chassis Fabrication Online
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Market Intel Snippet */}
        <GlassCard title="Market Intel" className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50">
            <div className="space-y-3 text-xs">
                <div className="flex gap-2 items-start">
                    <div className="w-1 h-full bg-blue-500 rounded-full"></div>
                    <p className="text-slate-300">Demand for <strong className="text-blue-300">SUVs</strong> is trending upwards by 15% this year.</p>
                </div>
                <div className="flex gap-2 items-start">
                    <div className="w-1 h-full bg-purple-500 rounded-full"></div>
                    <p className="text-slate-300"><strong className="text-purple-300">Luxury</strong> segment buyers are demanding higher safety standards (+10 req).</p>
                </div>
            </div>
        </GlassCard>
      </div>

    </div>
  );
};