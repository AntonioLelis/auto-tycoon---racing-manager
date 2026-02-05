import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { 
  CylinderLayout, EngineBlockType, FuelType, ValvetrainType, 
  InductionType, EngineDesignParams, EngineType 
} from '../../types';
import { calculateEngineStats, calculateDevelopmentCost, generateDynoData, CYLINDER_CONFIGS } from '../../utils/engineCalculations';
import { TECH_TREE } from '../../data/techTree';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { formatMoney } from '../../utils/formatters';
import { AlertTriangle } from 'lucide-react';
import { DynoChart } from '../UI/DynoChart';
import { TelemetryPanel } from '../UI/TelemetryPanel';
import { EngineBlueprint } from '../Blueprints/EngineBlueprint';

export const EngineDesignerView: React.FC = () => {
  const { developEngine, money, unlockedTechIds } = useGame();
  
  // --- Form State ---
  const [name, setName] = useState<string>('Project Alpha');
  const [layout, setLayout] = useState<CylinderLayout>(CylinderLayout.I4);
  const [block, setBlock] = useState<EngineBlockType>(EngineBlockType.CAST_IRON);
  const [fuel, setFuel] = useState<FuelType>(FuelType.GASOLINE);
  const [valvetrain, setValvetrain] = useState<ValvetrainType>(ValvetrainType.OHV);
  const [induction, setInduction] = useState<InductionType>(InductionType.NA);
  const [bore, setBore] = useState<number>(86);
  const [stroke, setStroke] = useState<number>(86);
  const [quality, setQuality] = useState<number>(50);

  // --- Baseline State for Deltas ---
  // We store the stats of the engine when the component mounts (or resets)
  const baselineStatsRef = useRef<Record<string, number>>({});
  const isFirstRender = useRef(true);

  // --- Derived Calculations ---
  const layoutConfig = CYLINDER_CONFIGS[layout];
  
  const currentDisplacement = useMemo(() => {
     const radius = bore / 20;
     const strokeCm = stroke / 10;
     return Math.round((Math.PI * Math.pow(radius, 2) * strokeCm) * layoutConfig.cylinders * 1000) / 1000;
  }, [bore, stroke, layoutConfig]);

  const isOverLimit = currentDisplacement > layoutConfig.maxCapacityCc;

  const engineStats = useMemo(() => {
    const params: EngineDesignParams = {
      name, layout, blockType: block, fuelType: fuel, valvetrain, induction, bore, stroke, sliderQuality: quality,
    };
    return calculateEngineStats(params);
  }, [name, layout, block, fuel, valvetrain, induction, bore, stroke, quality]);

  // Update baseline only once
  if (isFirstRender.current) {
      baselineStatsRef.current = {
          horsepower: engineStats.horsepower,
          torque: engineStats.torque,
          weight: engineStats.weight,
          reliability: engineStats.reliability,
          fuelEfficiency: engineStats.fuelEfficiency,
          productionCost: engineStats.productionCost,
          redline: engineStats.redline
      };
      isFirstRender.current = false;
  }

  const dynoData = useMemo(() => generateDynoData(engineStats), [engineStats]);
  const devCost = useMemo(() => calculateDevelopmentCost(engineStats), [engineStats]);
  const canAfford = money >= devCost;

  // --- Handlers ---
  const handleDevelop = () => {
    if (!name.trim()) return alert("Please name your engine.");
    if (isOverLimit) return alert("Displacement exceeds block capacity limit!");
    if (!canAfford) return alert("Insufficient funds.");

    const newEngine = {
        id: `eng_${Date.now()}`,
        type: EngineType.I4, 
        ...engineStats
    };

    developEngine(newEngine, devCost);
    alert(`Engine ${newEngine.name} development started!`);
    
    // Reset baseline to current for next design
    baselineStatsRef.current = {
          horsepower: engineStats.horsepower,
          torque: engineStats.torque,
          weight: engineStats.weight,
          reliability: engineStats.reliability,
          fuelEfficiency: engineStats.fuelEfficiency,
          productionCost: engineStats.productionCost,
          redline: engineStats.redline
    };
    setName("Next Gen Engine");
  };

  const isTechUnlocked = (checkFn: (tech: any) => boolean) => {
    const tech = TECH_TREE.find(checkFn);
    return !tech || unlockedTechIds.includes(tech.id);
  };

  // --- Telemetry Config ---
  const telemetryCategories = [
      {
          title: "Performance",
          stats: [
              { id: "horsepower", label: "Peak Power", value: engineStats.horsepower, unit: "hp", description: "Top end power output." },
              { id: "torque", label: "Peak Torque", value: engineStats.torque, unit: "Nm", description: "Turning force. Important for acceleration." },
              { id: "redline", label: "Redline", value: engineStats.redline, unit: "rpm", description: "Maximum engine speed." },
          ]
      },
      {
          title: "Engineering",
          stats: [
              { id: "weight", label: "Weight", value: engineStats.weight, unit: "kg", reversed: true, description: "Lighter engines improve car handling." },
              { id: "reliability", label: "Reliability", value: engineStats.reliability, unit: "/100", description: "Durability score." },
              { id: "fuelEfficiency", label: "Efficiency Score", value: engineStats.fuelEfficiency, unit: "/100", description: "Thermal efficiency estimate." },
          ]
      },
      {
          title: "Market",
          stats: [
              { id: "productionCost", label: "Unit Cost", value: engineStats.productionCost, unit: "$", reversed: true, description: "Manufacturing cost per unit." },
          ]
      }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      
      {/* LEFT COL: Configuration (4 cols) */}
      <div className="lg:col-span-4 space-y-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-10rem)] pr-2">
        <Card title="Architecture">
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cylinder Layout</label>
                  <select 
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as CylinderLayout)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {Object.values(CylinderLayout).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Block Material</label>
                  <select 
                    value={block}
                    onChange={(e) => setBlock(e.target.value as EngineBlockType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {Object.values(EngineBlockType).map(b => (
                        <option key={b} value={b} disabled={!isTechUnlocked(t => t.effect?.unlockBlock === b)}>
                            {b} {!isTechUnlocked(t => t.effect?.unlockBlock === b) && '(Locked)'}
                        </option>
                    ))}
                  </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fuel Type</label>
                  <select 
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value as FuelType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {Object.values(FuelType).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valvetrain</label>
                  <select 
                    value={valvetrain}
                    onChange={(e) => setValvetrain(e.target.value as ValvetrainType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  >
                    {Object.values(ValvetrainType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Induction</label>
              <select 
                value={induction}
                onChange={(e) => setInduction(e.target.value as InductionType)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              >
                 {Object.values(InductionType).map(i => (
                    <option key={i} value={i} disabled={!isTechUnlocked(t => t.effect?.unlockInduction === i)}>
                        {i} {!isTechUnlocked(t => t.effect?.unlockInduction === i) && '(Locked)'}
                    </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* VISUALIZATION ADDED HERE */}
        <div className="mb-4">
            <EngineBlueprint layout={layout} induction={induction} className="bg-slate-900/50 rounded-lg border border-slate-700" />
        </div>

        <Card title="Geometry & Tuning">
              <div className="space-y-6">
                  {/* Visual Displacement Indicator */}
                  <div className={`p-4 rounded border ${isOverLimit ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/50 border-slate-700'} transition-colors`}>
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400 uppercase">Total Displacement</span>
                          <span className={`text-xl font-mono font-bold ${isOverLimit ? 'text-red-400' : 'text-blue-400'}`}>
                              {currentDisplacement} cc
                          </span>
                      </div>
                      {isOverLimit && (
                          <div className="flex items-center gap-2 text-xs text-red-400 mt-2">
                              <AlertTriangle size={14} />
                              <span>Exceeds {layoutConfig.maxCapacityCc}cc limit for {layout} block!</span>
                          </div>
                      )}
                      {!isOverLimit && (
                          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{width: `${(currentDisplacement / layoutConfig.maxCapacityCc) * 100}%`}}></div>
                          </div>
                      )}
                  </div>

                  {/* Sliders */}
                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Bore (Diameter)</span>
                          <span className="font-mono">{bore} mm</span>
                      </div>
                      <input 
                          type="range" min="60" max="105" step="0.5"
                          value={bore} onChange={(e) => setBore(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Stroke (Length)</span>
                          <span className="font-mono">{stroke} mm</span>
                      </div>
                      <input 
                          type="range" min="60" max="110" step="0.5"
                          value={stroke} onChange={(e) => setStroke(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                          <span>Short Stroke (High RPM)</span>
                          <span>Long Stroke (High Torque)</span>
                      </div>
                  </div>

                  <hr className="border-slate-700"/>

                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Quality Assurance</span>
                          <span className="font-mono text-emerald-400">{quality}%</span>
                      </div>
                      <input 
                          type="range" min="0" max="100" 
                          value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                  </div>
              </div>
          </Card>
      </div>

      {/* MIDDLE COL: Telemetry (4 cols) */}
      <div className="lg:col-span-4 h-full">
         <TelemetryPanel categories={telemetryCategories} previousData={baselineStatsRef.current} />
      </div>

      {/* RIGHT COL: Dyno & Action (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
         <Card title="Dyno Results" className="flex-1 flex flex-col">
             <div className="flex-1 min-h-[250px] mb-4">
                <DynoChart data={dynoData} />
             </div>
             
             <div className="mt-auto pt-4 border-t border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-slate-400">Unit Cost</span>
                     <span className="text-xl font-mono text-emerald-400 font-bold">{formatMoney(engineStats.productionCost)}</span>
                 </div>
                 <div className="flex justify-between items-center mb-4 text-xs text-slate-500">
                     <span>Development Fee</span>
                     <span>{formatMoney(devCost)}</span>
                 </div>

                 <Button 
                    variant="primary" 
                    className="w-full py-3 text-lg"
                    onClick={handleDevelop}
                    disabled={!canAfford || isOverLimit}
                 >
                    {isOverLimit ? 'Invalid Configuration' : canAfford ? 'Start Development' : 'Insufficient Funds'}
                 </Button>
             </div>
         </Card>
      </div>
    </div>
  );
};