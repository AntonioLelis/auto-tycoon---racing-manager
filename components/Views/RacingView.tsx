import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { RACING_CATEGORIES } from '../../constants';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { validateEngineForCategory } from '../../utils/racingLogic';
import { formatMoney } from '../../utils/formatters';
import { Trophy, Gauge, DollarSign, Skull, User, UserPlus, UserMinus, Globe, Lock, Unlock, AlertTriangle, Settings, ChevronRight, XCircle, CheckCircle, Zap, Scale, Battery } from 'lucide-react';

export const RacingView: React.FC = () => {
  const { racingTeam, freeAgents, joinRacingCategory, setRacingBudget, hireDriver, fireDriver, selectRaceEngine, unlockedEngines, money, brandPrestige, year } = useGame();
  const [isSelectingSeries, setIsSelectingSeries] = useState(false);
  const [isSelectingEngine, setIsSelectingEngine] = useState(false);
  
  // State to track which driver is currently being considered for firing (Two-step confirm)
  const [confirmFireId, setConfirmFireId] = useState<string | null>(null);

  const activeCategory = useMemo(() => 
    RACING_CATEGORIES.find(c => c.id === racingTeam.activeCategoryId), 
  [racingTeam.activeCategoryId]);

  const selectedEngine = useMemo(() => 
    unlockedEngines.find(e => e.id === racingTeam.selectedEngineId),
  [racingTeam.selectedEngineId, unlockedEngines]);

  // Auto-reset confirmation button after 3 seconds if not clicked
  useEffect(() => {
    if (confirmFireId) {
        const timer = setTimeout(() => setConfirmFireId(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [confirmFireId]);

  const handleFireClick = (driverId: string) => {
      if (confirmFireId === driverId) {
          fireDriver(driverId);
          setConfirmFireId(null);
      } else {
          setConfirmFireId(driverId);
      }
  };

  // --- SUB-COMPONENT: LEAGUE SELECTOR ---
  const renderLeagueSelector = () => (
      <div className="space-y-6">
          <Card title="Championship Selection" action={
              activeCategory && (
                  <Button size="sm" variant="secondary" onClick={() => setIsSelectingSeries(false)}>Cancel</Button>
              )
          }>
              <div className="p-4 bg-slate-900/50 rounded border border-slate-700 mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Global Motorsport Sanctioning Body</h3>
                  <p className="text-slate-400">
                      Select a championship to enter. Higher tiers require more prestige and funding.
                      <br/>
                      <span className="text-amber-400 font-bold">Warning:</span> Changing series will reset your Car Performance development.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {RACING_CATEGORIES.map(cat => {
                      const isActive = activeCategory?.id === cat.id;
                      const isLocked = brandPrestige < cat.minPrestige;
                      const canAfford = money >= cat.entryFee;

                      return (
                          <div key={cat.id} className={`bg-slate-800 border rounded-lg p-6 flex flex-col transition-all relative ${isActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-600 hover:border-slate-400'} ${isLocked ? 'opacity-75 bg-slate-900' : ''}`}>
                              
                              {isActive && (
                                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                      ACTIVE TEAM
                                  </div>
                              )}

                              <div className="mb-4">
                                  <div className="flex justify-between items-start">
                                      <h4 className="text-lg font-bold text-white">{cat.name}</h4>
                                      {isLocked ? <Lock className="text-slate-500" size={20}/> : <Unlock className="text-emerald-500" size={20}/>}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-white font-bold">Tier {cat.tier}</span>
                                      <div className="text-xs text-slate-400 uppercase">Difficulty: {cat.difficulty}/100</div>
                                  </div>
                              </div>
                              
                              <p className="text-sm text-slate-300 flex-1 mb-6">{cat.description}</p>
                              
                              <div className="space-y-3 mb-6 bg-slate-900/30 p-3 rounded">
                                  <div className="flex justify-between text-sm">
                                      <span className="text-slate-400">Entry Fee:</span>
                                      <span className={canAfford ? 'text-white font-mono' : 'text-red-400 font-mono'}>{formatMoney(cat.entryFee)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                      <span className="text-slate-400">Weekly Cost:</span>
                                      <span className="text-white font-mono">{formatMoney(cat.weeklyCost)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                      <span className="text-slate-400">Req. Prestige:</span>
                                      <span className={isLocked ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{cat.minPrestige}</span>
                                  </div>
                              </div>

                              <Button 
                                  variant={isActive ? 'success' : 'primary'} 
                                  className="w-full"
                                  disabled={isActive || isLocked || !canAfford}
                                  onClick={() => {
                                      joinRacingCategory(cat.id);
                                      setIsSelectingSeries(false);
                                  }}
                              >
                                  {isActive ? 'Current Series' : isLocked ? 'Locked (Low Prestige)' : !canAfford ? 'Insufficient Funds' : 'Join Championship'}
                              </Button>
                          </div>
                      );
                  })}
              </div>
          </Card>
      </div>
  );

  // --- SUB-COMPONENT: ENGINE SELECTOR ---
  const renderEngineSelector = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Settings className="text-blue-500" /> Select Power Unit
                  </h3>
                  <button onClick={() => setIsSelectingEngine(false)} className="text-slate-400 hover:text-white"><XCircle size={24}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                  
                  {/* Category Rules Header */}
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-600 mb-4 text-sm">
                      <h4 className="font-bold text-slate-300 uppercase mb-2">Technical Regulations: {activeCategory?.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                              <span className="text-slate-500 block text-xs">Max Displacement</span>
                              <span className="text-white font-mono">{activeCategory?.regulations.maxDisplacement}cc</span>
                          </div>
                          <div>
                              <span className="text-slate-500 block text-xs">Max Power (Cap)</span>
                              <span className="text-white font-mono">{activeCategory?.regulations.maxPower} HP</span>
                          </div>
                          <div>
                              <span className="text-slate-500 block text-xs">Allowed Cylinders</span>
                              <span className="text-white font-mono">{activeCategory?.regulations.allowedCylinders.join(', ')}</span>
                          </div>
                          <div>
                              <span className="text-slate-500 block text-xs">Forced Induction</span>
                              <span className={activeCategory?.regulations.forcedInductionAllowed ? 'text-emerald-400' : 'text-red-400'}>
                                  {activeCategory?.regulations.forcedInductionAllowed ? 'Allowed' : 'Banned'}
                              </span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {unlockedEngines.map(engine => {
                          const validation = activeCategory ? validateEngineForCategory(engine, activeCategory) : { isValid: false, status: 'BANNED', reason: 'No Category' };
                          const isSelected = racingTeam.selectedEngineId === engine.id;
                          
                          // Calc Simulation Stats for Display
                          const weightScore = Math.max(0, 10 - (Math.max(0, engine.weight - 100) * 0.1));
                          const ecoScore = engine.fuelEfficiency / 10;
                          
                          return (
                              <div key={engine.id} className={`flex flex-col md:flex-row gap-4 p-4 rounded-lg border transition-all ${isSelected ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-800 border-slate-700'}`}>
                                  {/* Info */}
                                  <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                          <h4 className="font-bold text-white text-lg">{engine.name}</h4>
                                          {validation.status === 'BANNED' && <span className="bg-red-900/50 text-red-400 text-xs px-2 py-0.5 rounded font-bold border border-red-900">BANNED: {validation.reason}</span>}
                                          {validation.status === 'RESTRICTED' && <span className="bg-yellow-900/50 text-yellow-400 text-xs px-2 py-0.5 rounded font-bold border border-yellow-900">RESTRICTED: {validation.reason}</span>}
                                          {validation.status === 'VALID' && <span className="bg-emerald-900/50 text-emerald-400 text-xs px-2 py-0.5 rounded font-bold border border-emerald-900">HOMOLOGATED</span>}
                                      </div>
                                      <div className="text-xs text-slate-400 flex gap-3">
                                          <span>{engine.layout}</span>
                                          <span>{engine.displacement}cc</span>
                                          <span>{engine.induction}</span>
                                      </div>
                                  </div>

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-3 gap-6 items-center">
                                      <div className="text-center">
                                          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1"><Zap size={10}/> Power</div>
                                          <div className={`font-mono font-bold ${validation.status === 'RESTRICTED' ? 'text-yellow-400' : 'text-white'}`}>
                                              {validation.status === 'RESTRICTED' ? activeCategory?.regulations.maxPower : engine.horsepower} hp
                                          </div>
                                      </div>
                                      <div className="text-center">
                                          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1"><Scale size={10}/> Weight</div>
                                          <div className={`font-mono font-bold ${weightScore < 5 ? 'text-red-400' : 'text-emerald-400'}`}>{engine.weight} kg</div>
                                      </div>
                                      <div className="text-center">
                                          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1"><Battery size={10}/> Efficiency</div>
                                          <div className={`font-mono font-bold ${ecoScore < 5 ? 'text-red-400' : 'text-emerald-400'}`}>{engine.fuelEfficiency}/100</div>
                                      </div>
                                  </div>

                                  {/* Action */}
                                  <div className="flex items-center">
                                      <Button 
                                          variant={isSelected ? 'success' : 'primary'}
                                          disabled={validation.status === 'BANNED' || isSelected}
                                          onClick={() => {
                                              selectRaceEngine(engine.id);
                                              setIsSelectingEngine(false);
                                          }}
                                      >
                                          {isSelected ? 'Equipped' : validation.status === 'BANNED' ? 'Illegal' : 'Select'}
                                      </Button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>
  );

  // --- VIEW: NO TEAM or SELECTING ---
  if (!activeCategory || isSelectingSeries) {
    return renderLeagueSelector();
  }

  // --- VIEW: ACTIVE TEAM DASHBOARD ---
  const lastResult = racingTeam.lastResult;
  const drivers = racingTeam.drivers; 
  
  // Render a specific driver slot
  const renderDriverSlot = (driverIndex: number) => {
      const driver = drivers[driverIndex];
      if (!driver) {
          return (
              <div className="bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 h-full min-h-[250px]">
                  <User size={48} className="opacity-20 mb-2"/>
                  <span className="font-bold text-sm">Empty Seat</span>
                  <span className="text-xs">Hire a driver from the market</span>
              </div>
          );
      }
      const driverResult = lastResult?.results.find(r => r.driverId === driver.id);
      const isConfirming = confirmFireId === driver.id;
      const penalty = Math.max(driver.salary * 3, 500000);

      return (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-auto flex flex-col relative group min-h-[250px]">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                      <User size={20} />
                  </div>
                  <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{driver.name}</h3>
                      <div className="text-[10px] text-slate-400">
                          Age: {driver.age} <span className="text-slate-600">({year - driver.age})</span>
                      </div>
                  </div>
              </div>
              <div className="space-y-3 flex-1">
                  <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-400">Skill / Pot</span>
                            <span className="font-bold text-white">{driver.stats.skill.toFixed(1)} <span className="text-slate-600">/ {driver.stats.talent}</span></span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-slate-700 h-full w-full relative">
                                <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${driver.stats.skill}%` }}></div>
                                <div className="absolute top-0 left-0 h-full border-r-2 border-slate-500 opacity-50" style={{ width: `${driver.stats.talent}%` }}></div>
                            </div>
                        </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div className="bg-slate-800 p-1.5 rounded">
                          Exp: <span className="text-white font-bold">{driver.stats.experience.toFixed(0)}</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded">
                          Aggro: <span className="text-white font-bold">{driver.stats.aggression}</span>
                      </div>
                  </div>
                  {driverResult && (
                      <div className={`mt-2 p-2 rounded text-center border ${driverResult.isCrash ? 'bg-red-900/30 border-red-900 text-red-400' : driverResult.position <= 3 ? 'bg-amber-900/30 border-amber-700 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                          <span className="text-xs font-bold uppercase block">Last Race</span>
                          <span className="text-lg font-black">{driverResult.isCrash ? 'DNF' : `P${driverResult.position}`}</span>
                      </div>
                  )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs mb-3">
                      <span className="text-slate-500">Salary</span>
                      <span className="text-red-400 font-mono">-{formatMoney(driver.salary)}</span>
                  </div>
                  <Button 
                    variant={isConfirming ? "danger" : "secondary"} 
                    size="sm" 
                    className={`w-full transition-all duration-200 ${isConfirming ? 'bg-red-700 hover:bg-red-600 animate-pulse font-bold' : 'hover:bg-red-900/50 hover:text-red-400'}`}
                    onClick={() => handleFireClick(driver.id)}
                  >
                      {isConfirming ? (
                          <span className="flex items-center justify-center gap-1">
                              <AlertTriangle size={14}/> Confirm (Fee: {formatMoney(penalty)})
                          </span>
                      ) : (
                          <span className="flex items-center justify-center gap-1">
                              <UserMinus size={14}/> Fire Driver
                          </span>
                      )}
                  </Button>
              </div>
          </div>
      );
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
      
      {/* LEFT COL: Team & Car Management (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
          <Card title="Team Operations">
              <div className="space-y-6">
                
                {/* Team Info */}
                <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-yellow-400" size={32} />
                        <div>
                            <h2 className="text-lg font-bold text-white">{racingTeam.name}</h2>
                            <p className="text-indigo-300 text-xs font-bold">{activeCategory.name}</p>
                        </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setIsSelectingSeries(true)}>
                        <Globe size={14} className="mr-1"/> Change
                    </Button>
                </div>

                {/* ENGINE SELECTION SLOT */}
                <div 
                    onClick={() => setIsSelectingEngine(true)}
                    className="bg-slate-900 border border-slate-700 p-3 rounded cursor-pointer hover:border-blue-500 transition-colors group"
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Settings size={12}/> Power Unit</span>
                        <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400"/>
                    </div>
                    {selectedEngine ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-white font-bold text-sm">{selectedEngine.name}</div>
                                <div className="text-[10px] text-slate-500">{selectedEngine.horsepower}hp | {selectedEngine.weight}kg</div>
                            </div>
                            <div className="text-emerald-400"><CheckCircle size={18}/></div>
                        </div>
                    ) : (
                        <div className="text-sm text-red-400 italic flex items-center gap-2">
                            <AlertTriangle size={14}/> No Engine Selected
                        </div>
                    )}
                </div>

                {/* Car Development Slider */}
                <div>
                     <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <DollarSign size={12}/> Monthly Dev Budget
                        </label>
                        <span className="font-mono text-emerald-400 font-bold">{formatMoney(racingTeam.monthlyBudget)}</span>
                     </div>
                     <input 
                        type="range" min="0" max="1000000" step="50000"
                        value={racingTeam.monthlyBudget}
                        onChange={(e) => setRacingBudget(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                     />
                     <p className="text-[10px] text-slate-500 mt-1">
                         Allocates funds to improve car performance weekly. High budget = faster upgrades.
                     </p>
                </div>

                {/* Car Stats */}
                <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300 flex items-center gap-1"><Gauge size={12}/> Car Performance</span>
                            <span className="font-bold">{racingTeam.carPerformance.toFixed(1)}/100</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${racingTeam.carPerformance}%` }}></div>
                        </div>
                    </div>
                </div>

              </div>
          </Card>

          {/* Championship Info */}
          <Card title="Championship">
               <div className="space-y-4">
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                       <span className="text-sm text-slate-400">Difficulty</span>
                       <span className="text-white font-mono">{activeCategory.difficulty}</span>
                   </div>
                   
                   <div className="pt-2 border-t border-slate-700">
                       <h4 className="text-xs text-slate-500 uppercase mb-2">Team Best Results</h4>
                       <div className="flex gap-1 flex-wrap">
                           {racingTeam.history.map((pos, idx) => (
                               <div 
                                    key={idx} 
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold 
                                        ${pos === 1 ? 'bg-yellow-500 text-black' : pos <= 3 ? 'bg-slate-300 text-black' : pos === 20 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}
                                    `}
                                    title={pos === 20 ? "DNF (Crash)" : `P${pos}`}
                               >
                                   {pos === 20 ? <Skull size={10} /> : pos}
                               </div>
                           ))}
                           {racingTeam.history.length === 0 && <span className="text-xs text-slate-600">No races yet</span>}
                       </div>
                   </div>

                   {/* Last Race Summary */}
                    {lastResult && (
                        <div className="mt-4 p-3 bg-slate-800 border border-slate-600 rounded">
                            <div className="text-xs text-slate-500 uppercase mb-1">Last Race Summary</div>
                            <div className="flex justify-between items-end">
                                <div className="text-white font-bold">
                                    {lastResult.results.length} Cars Entered
                                </div>
                                <div className="text-right text-xs">
                                    <div className={lastResult.totalPrestigeChange > 0 ? 'text-amber-400' : 'text-red-400'}>
                                        {lastResult.totalPrestigeChange > 0 ? '+' : ''}{lastResult.totalPrestigeChange} Prestige
                                    </div>
                                    <div className="text-emerald-400">+{formatMoney(lastResult.totalPrizeMoney)}</div>
                                </div>
                            </div>
                        </div>
                    )}
               </div>
          </Card>
      </div>

      {/* CENTER COL: Driver Management (4 cols) */}
      <div className="lg:col-span-4">
         <Card title="Team Garage (Drivers)">
            <div className="grid grid-cols-2 gap-4">
                {renderDriverSlot(0)}
                {renderDriverSlot(1)}
            </div>
         </Card>
      </div>

      {/* RIGHT COL: Driver Market (4 cols) */}
      <div className="lg:col-span-4">
          <Card title="Driver Market (Free Agents)" className="h-full flex flex-col">
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
                  {freeAgents.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">No drivers available. Wait for next year.</div>
                  ) : (
                      freeAgents.map(agent => (
                          <div key={agent.id} className="bg-slate-900/50 p-3 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <div className="font-bold text-white text-sm">{agent.name}</div>
                                      <div className="text-xs text-slate-400">Age: {agent.age}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="font-mono text-emerald-400 font-bold text-sm">{formatMoney(agent.salary)}<span className="text-[10px] text-slate-500">/mo</span></div>
                                      <div className="text-[10px] text-slate-500">Fee: {formatMoney(agent.marketValue)}</div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                                  <div className="bg-slate-800 p-1 rounded text-center">
                                      <div className="text-slate-500 text-[10px]">Skill</div>
                                      <div className="font-bold text-blue-400">{agent.stats.skill}</div>
                                  </div>
                                  <div className="bg-slate-800 p-1 rounded text-center">
                                      <div className="text-slate-500 text-[10px]">Talent</div>
                                      <div className="font-bold text-purple-400">{agent.stats.talent}</div>
                                  </div>
                                  <div className="bg-slate-800 p-1 rounded text-center">
                                      <div className="text-slate-500 text-[10px]">Aggro</div>
                                      <div className={`font-bold ${agent.stats.aggression > 70 ? 'text-red-400' : 'text-slate-300'}`}>{agent.stats.aggression}</div>
                                  </div>
                              </div>

                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="w-full text-xs"
                                disabled={money < agent.marketValue || drivers.length >= 2}
                                onClick={() => hireDriver(agent.id)}
                              >
                                  {drivers.length >= 2 ? 'Team Full (Fire First)' : <><UserPlus size={14} className="mr-1"/> Hire</>}
                              </Button>
                          </div>
                      ))
                  )}
              </div>
          </Card>
      </div>

    </div>

    {isSelectingEngine && renderEngineSelector()}
    </>
  );
};