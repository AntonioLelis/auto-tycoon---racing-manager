import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { formatMoney, formatNumber } from '../../utils/formatters';
import { Briefcase, Building2, Truck, CheckCircle, XCircle, ShoppingCart, AlertTriangle, Factory, Zap, Battery, Weight, DollarSign } from 'lucide-react';
import { SUPPLIER_ENGINES } from '../../data/supplierEngines';
import { Engine } from '../../types';

export const B2BView: React.FC = () => {
  const { 
    contractOffers, activeContracts, unlockedEngines, 
    acceptContract, rejectContract, getUnitEffort, calculateCurrentLoad,
    money, developEngine, year
  } = useGame();
  
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'inbox' | 'active' | 'market'>('inbox');

  const load = calculateCurrentLoad();
  const freeCapacity = load.capacity - load.used;

  // Filter engines available by year
  const availableSupplierEngines = SUPPLIER_ENGINES.filter(e => e.unlockYear !== undefined && e.unlockYear <= year);

  const handleBuyLicense = (engine: Engine) => {
      // Calculate License Cost (e.g., 50x production cost as a fee)
      const licenseFee = engine.productionCost * 50;
      
      if (money < licenseFee) {
          alert(t('design.insufficient_funds'));
          return;
      }

      if (window.confirm(`${t('b2b.buy_license')} for ${engine.name}?\n\nCost: ${formatMoney(licenseFee)}`)) {
          // We use developEngine to add it to our list, passing the license fee as the "dev cost"
          // We must ensure the engine object has a unique ID if we wanted to own multiple, 
          // but for supplier engines, the ID from data is fine to track ownership.
          developEngine(engine, licenseFee);
      }
  };

  return (
    <div className="grid grid-cols-1 gap-6 h-full">
      
      {/* Header Tabs */}
      <div className="flex space-x-4 border-b border-slate-700 pb-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'inbox' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Briefcase size={18} />
          <span>{t('b2b.inbox')}</span>
          {contractOffers.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{contractOffers.length}</span>
          )}
        </button>
        <button 
           onClick={() => setActiveTab('active')}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'active' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Truck size={18} />
          <span>{t('b2b.active_logistics')}</span>
          {activeContracts.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{activeContracts.length}</span>
          )}
        </button>
        <button 
           onClick={() => setActiveTab('market')}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'market' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <ShoppingCart size={18} />
          <span>{t('b2b.engine_market')}</span>
        </button>
      </div>

      {/* INBOX TAB */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {contractOffers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 border border-slate-700 border-dashed rounded-lg">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t('b2b.no_offers')}</p>
              <p className="text-sm">{t('b2b.wait_offers')}</p>
            </div>
          ) : (
            contractOffers.map(offer => {
              const engine = unlockedEngines.find(e => e.id === offer.engineId);
              if (!engine) return null;

              const totalRevenue = offer.totalQuantity * offer.pricePerUnit;
              const totalCost = offer.totalQuantity * engine.productionCost;
              const totalProfit = totalRevenue - totalCost;
              const profitMargin = (totalProfit / totalRevenue) * 100;

              // Capacity Calc
              const unitsPerWeek = Math.ceil(offer.totalQuantity / offer.durationWeeks);
              const effort = getUnitEffort(engine);
              const requiredPU = unitsPerWeek * effort;
              const canAffordPU = requiredPU <= freeCapacity;

              return (
                <Card key={offer.id} className="relative group">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">{offer.clientName}</h3>
                        <div className="text-xs text-slate-400">{t('b2b.proposal_id')}: {offer.id.slice(-6)}</div>
                      </div>
                      <div className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-xs uppercase font-bold border border-blue-500/20">
                         {t('b2b.pending')}
                      </div>
                   </div>

                   <div className="bg-slate-900/50 p-3 rounded mb-4 text-sm text-slate-300">
                      We are interested in purchasing <strong>{formatNumber(offer.totalQuantity)}</strong> units of your <strong>{engine.name}</strong> engine over the next <strong>{offer.durationWeeks} {t('common.week').toLowerCase()}s</strong>.
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-2 bg-slate-900/30 rounded border border-slate-700/50">
                          <div className="text-xs text-slate-500 uppercase">{t('b2b.est_profit')}</div>
                          <div className={`font-mono font-bold ${profitMargin > 15 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                             {formatMoney(totalProfit)} 
                             <span className="ml-1 text-xs">({profitMargin.toFixed(1)}%)</span>
                          </div>
                      </div>
                      <div className={`p-2 rounded border ${canAffordPU ? 'bg-slate-900/30 border-slate-700/50' : 'bg-red-900/20 border-red-500/50'}`}>
                          <div className="text-xs text-slate-500 uppercase">{t('b2b.factory_load')}</div>
                          <div className={`font-mono font-bold flex items-center gap-1 ${canAffordPU ? 'text-blue-400' : 'text-red-400'}`}>
                             <Factory size={14} /> +{Math.round(requiredPU)} PU/wk
                          </div>
                          {!canAffordPU && <div className="text-[10px] text-red-400 mt-1">{t('b2b.factory_full')}!</div>}
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <Button 
                        variant="success" 
                        className="flex-1" 
                        onClick={() => acceptContract(offer.id)}
                        disabled={!canAffordPU}
                      >
                         <CheckCircle size={16} className="mr-2" /> {canAffordPU ? t('b2b.accept') : t('b2b.factory_full')}
                      </Button>
                      <Button variant="danger" onClick={() => rejectContract(offer.id)}>
                         <XCircle size={16} />
                      </Button>
                   </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ACTIVE TAB */}
      {activeTab === 'active' && (
        <div className="space-y-4">
           {activeContracts.length === 0 ? (
             <div className="py-12 text-center text-slate-500 border border-slate-700 border-dashed rounded-lg">
                <Truck size={48} className="mx-auto mb-4 opacity-50" />
                <p>No active logistics contracts.</p>
             </div>
           ) : (
             activeContracts.map(contract => {
                const engine = unlockedEngines.find(e => e.id === contract.engineId);
                const progress = (contract.deliveredQuantity / contract.totalQuantity) * 100;
                const weeklyVolume = Math.ceil(contract.totalQuantity / contract.durationWeeks);

                return (
                    <Card key={contract.id}>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                            <div>
                                <h3 className="font-bold text-white text-lg">{contract.clientName}</h3>
                                <div className="text-sm text-slate-400 flex items-center gap-2">
                                    <span className="text-slate-500">Supply:</span> {engine?.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500 uppercase">Weekly Revenue</div>
                                <div className="font-mono text-emerald-400 font-bold text-lg">
                                    +{formatMoney(weeklyVolume * contract.pricePerUnit)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Progress</span>
                                <span>{formatNumber(contract.deliveredQuantity)} / {formatNumber(contract.totalQuantity)} units</span>
                            </div>
                            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </Card>
                );
             })
           )}
        </div>
      )}

      {/* MARKETPLACE TAB */}
      {activeTab === 'market' && (
        <Card title={t('b2b.market_title')}>
             <div className="mb-6 p-4 bg-slate-900/50 rounded border border-slate-700">
                 <p className="text-slate-400 text-sm">
                     {t('b2b.market_desc')}
                 </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {availableSupplierEngines.map(engine => {
                     const isOwned = unlockedEngines.some(ue => ue.id === engine.id);
                     const licenseFee = engine.productionCost * 50;
                     
                     return (
                         <div key={engine.id} className={`p-4 rounded border transition-all ${isOwned ? 'bg-slate-900/30 border-emerald-900/50 opacity-75' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <h4 className="font-bold text-white">{engine.name}</h4>
                                     <div className="flex gap-2 text-xs text-slate-400 mt-1">
                                         <span className="bg-slate-900 px-1.5 py-0.5 rounded">{engine.layout}</span>
                                         <span className="bg-slate-900 px-1.5 py-0.5 rounded">{engine.induction}</span>
                                     </div>
                                 </div>
                                 {isOwned ? (
                                     <div className="text-emerald-500 text-xs font-bold flex items-center gap-1 bg-emerald-900/20 px-2 py-1 rounded">
                                         <CheckCircle size={14} /> {t('b2b.owned')}
                                     </div>
                                 ) : (
                                     <div className="text-right">
                                         <div className="text-[10px] text-slate-500 uppercase">{t('b2b.license_cost')}</div>
                                         <div className="font-mono text-amber-400 font-bold">{formatMoney(licenseFee)}</div>
                                     </div>
                                 )}
                             </div>

                             <div className="space-y-2 mb-4">
                                 <div className="grid grid-cols-2 gap-2 text-xs">
                                     <div className="bg-slate-900/50 p-2 rounded flex justify-between items-center">
                                         <span className="text-slate-500 flex items-center gap-1"><Zap size={10}/> HP</span>
                                         <span className="text-white font-mono">{engine.horsepower}</span>
                                     </div>
                                     <div className="bg-slate-900/50 p-2 rounded flex justify-between items-center">
                                         <span className="text-slate-500 flex items-center gap-1"><Weight size={10}/> Kg</span>
                                         <span className="text-white font-mono">{engine.weight}</span>
                                     </div>
                                     <div className="bg-slate-900/50 p-2 rounded flex justify-between items-center">
                                         <span className="text-slate-500 flex items-center gap-1"><Battery size={10}/> Eco</span>
                                         <span className="text-white font-mono">{engine.fuelEfficiency}</span>
                                     </div>
                                     <div className="bg-slate-900/50 p-2 rounded flex justify-between items-center">
                                         <span className="text-slate-500 flex items-center gap-1"><DollarSign size={10}/> Cost</span>
                                         <span className="text-emerald-400 font-mono">{formatMoney(engine.productionCost)}</span>
                                     </div>
                                 </div>
                             </div>

                             <Button 
                                className="w-full"
                                variant={isOwned ? "secondary" : "primary"}
                                disabled={isOwned || money < licenseFee}
                                onClick={() => handleBuyLicense(engine)}
                             >
                                 {isOwned ? t('b2b.owned') : money < licenseFee ? t('design.insufficient_funds') : t('b2b.buy_license')}
                             </Button>
                         </div>
                     );
                 })}
             </div>
        </Card>
      )}

    </div>
  );
};