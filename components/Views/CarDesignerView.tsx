import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ChassisFrameType, ChassisMaterial, DesignEra, 
  CarDesignConfiguration, CarModel, MarketCategoryPrimary, MarketCategorySecondary, Engine 
} from '../../types';
import { calculateDynamicCarStats, getEngineVolume } from '../../utils/carLogic';
import { calculateCarReviews } from '../../utils/reviewLogic';
import { BODY_TYPES, COSMETIC_CATEGORIES } from '../../data/cosmeticParts';
import { CAR_FEATURES } from '../../data/carFeatures';
import { DRIVETRAINS, SUSPENSIONS, TIRES } from '../../data/runningGear';
import { SUPPLIER_ENGINES } from '../../data/supplierEngines'; // New Data
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { TelemetryPanel } from '../UI/TelemetryPanel';
import { formatMoney } from '../../utils/formatters';
import { CarBlueprint } from '../Blueprints/CarBlueprint';
import { 
  CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, 
  Box, Layers, Wrench, Shield, Armchair, MoveVertical, Target, Factory, DollarSign, Lightbulb, Clock, Beaker, Globe, ShoppingCart
} from 'lucide-react';

interface CarDesignerViewProps {
  onBack: () => void;
}

export const CarDesignerView: React.FC<CarDesignerViewProps> = ({ onBack }) => {
  const { unlockedEngines, startProduction, year, unlockedTechIds, money, date, gainResearchPoints, getUnitEffort, calculateCurrentLoad } = useGame(); 
  const { t } = useLanguage();
  const [step, setStep] = useState<number>(0); // 0 = Market Strategy

  // --- Step 0: Market Strategy ---
  const [marketPrimary, setMarketPrimary] = useState<MarketCategoryPrimary>(MarketCategoryPrimary.POPULAR);
  const [marketSecondary, setMarketSecondary] = useState<MarketCategorySecondary>(MarketCategorySecondary.NONE);

  // --- Step 1: Engine State ---
  const [engineTab, setEngineTab] = useState<'my_engines' | 'global_market'>('my_engines');
  const [selectedEngineId, setSelectedEngineId] = useState<string>(unlockedEngines[0]?.id || '');

  // --- Step 2: Chassis & Mechanics State ---
  const [frameType, setFrameType] = useState<ChassisFrameType>(ChassisFrameType.MONOCOQUE);
  const [frameMaterial, setFrameMaterial] = useState<ChassisMaterial>(ChassisMaterial.STEEL);
  const [wheelbase, setWheelbase] = useState<number>(260); 
  const [engineBaySize, setEngineBaySize] = useState<number>(50);
  
  // Mechanics (Running Gear)
  const [drivetrainId, setDrivetrainId] = useState<string>(DRIVETRAINS[0].id);
  const [suspensionId, setSuspensionId] = useState<string>(SUSPENSIONS[1].id); // Default to Coil
  const [tireId, setTireId] = useState<string>(TIRES[0].id);
  const [rideHeight, setRideHeight] = useState<number>(40); // Default neutral

  // --- Step 3: Body & Trim State ---
  const [bodyTypeId, setBodyTypeId] = useState<string>(BODY_TYPES[0].id);
  const [designEra, setDesignEra] = useState<DesignEra>(DesignEra.BOX_70S);
  const [cosmetics, setCosmetics] = useState<Record<string, string>>({});

  // --- Step 4: Interior & Tech State ---
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [interiorQuality, setInteriorQuality] = useState<number>(30);
  const [suspensionStiff, setSuspensionStiff] = useState<number>(40);

  // --- Step 5: Production Planning ---
  const [modelName, setModelName] = useState<string>('Model 1');
  const [batchSize, setBatchSize] = useState<number>(1000);
  const [salePrice, setSalePrice] = useState<number>(0); // Will initialize based on cost

  // --- Baseline Refs ---
  const baselineStatsRef = useRef<Record<string, number>>({});
  const isFirstRender = useRef(true);
  
  // Initialize default parts based on availability
  useEffect(() => {
    // Cosmetics Defaults
    const cosDefaults: Record<string, string> = {};
    Object.values(COSMETIC_CATEGORIES).forEach(cat => {
        const availableParts = cat.parts.filter(p => p.unlockYear <= year);
        if (availableParts.length > 0) {
            cosDefaults[cat.id] = availableParts[0].id;
        }
    });
    setCosmetics(prev => ({...cosDefaults, ...prev}));

    // Features Defaults
    const featDefaults: Record<string, string> = {};
    Object.values(CAR_FEATURES).forEach(cat => {
        const availableFeatures = cat.features.filter(f => {
            const timeUnlocked = f.unlockYear <= year;
            const techUnlocked = !f.techIdRequirement || unlockedTechIds.includes(f.techIdRequirement);
            return timeUnlocked && techUnlocked;
        });
        if (availableFeatures.length > 0) {
            featDefaults[cat.id] = availableFeatures[0].id;
        }
    });
    setFeatures(prev => ({...featDefaults, ...prev}));
  }, [year, unlockedTechIds]);

  // --- Derived Calculations ---
  // Combine own engines + available supplier engines for lookup
  const availableSupplierEngines = useMemo(() => 
    SUPPLIER_ENGINES.filter(e => e.unlockYear !== undefined && e.unlockYear <= year), 
  [year]);

  const allEngines = useMemo(() => [...unlockedEngines, ...availableSupplierEngines], [unlockedEngines, availableSupplierEngines]);

  const selectedEngine = useMemo(() => 
    allEngines.find(e => e.id === selectedEngineId) || unlockedEngines[0] || availableSupplierEngines[0], 
  [selectedEngineId, allEngines, unlockedEngines, availableSupplierEngines]);

  const engineVolume = useMemo(() => selectedEngine ? getEngineVolume(selectedEngine) : 0, [selectedEngine]);
  const selectedBodyData = useMemo(() => BODY_TYPES.find(b => b.id === bodyTypeId) || BODY_TYPES[0], [bodyTypeId]);

  const config: CarDesignConfiguration = {
    marketPrimary,
    marketSecondary,
    frameType,
    frameMaterial,
    wheelbase,
    engineBaySize,
    drivetrainId,
    suspensionId,
    tireId,
    rideHeight,
    bodyTypeId,
    cosmetics,
    features,
    designEra,
    sliderInterior: interiorQuality,
    sliderSuspension: suspensionStiff
  };

  const calculatedData = useMemo(() => {
    if (!selectedEngine) return { 
        stats: { acceleration: 0, topSpeed: 0, handling: 0, comfort: 0, safety: 0, adaptability: 0, fuelEconomy: 0 },
        productionCost: 0, weight: 0, compatible: false, aerodynamics: 0, marketAppeal: 0 
    } as any;
    return calculateDynamicCarStats(selectedEngine, config);
  }, [selectedEngine, config]);

  const { stats, productionCost, weight, compatible, aerodynamics, marketAppeal } = calculatedData;
  
  // Auto-init sale price on first entry to step 5 (or if 0)
  useEffect(() => {
      if (salePrice === 0 && productionCost > 0) {
          setSalePrice(Math.round(productionCost * 1.3)); // 30% margin default
      }
  }, [productionCost, salePrice]);

  const totalProductionCost = productionCost * batchSize;
  const canAfford = money >= totalProductionCost;
  const margin = salePrice > 0 ? ((salePrice - productionCost) / salePrice) * 100 : 0;
  const profitPerUnit = salePrice - productionCost;
  
  // Validation for Combos
  const isValidCombo = useMemo(() => {
      if (marketPrimary === MarketCategoryPrimary.POPULAR) {
          if (marketSecondary === MarketCategorySecondary.SPORT) return false;
      }
      return true;
  }, [marketPrimary, marketSecondary]);

  // Set baseline only once on mount
  if (isFirstRender.current) {
      baselineStatsRef.current = {
          acceleration: stats.acceleration,
          topSpeed: stats.topSpeed,
          handling: stats.handling,
          comfort: stats.comfort,
          safety: stats.safety,
          weight: weight,
          productionCost: productionCost,
          aerodynamics: aerodynamics,
          adaptability: stats.adaptability
      };
      isFirstRender.current = false;
  }

  // --- Telemetry Config ---
  const telemetryCategories = [
      {
          title: "Performance",
          stats: [
              { id: "acceleration", label: "0-100 km/h", value: stats.acceleration, unit: "s", reversed: true, description: "Time to reach 100km/h." },
              { id: "topSpeed", label: "Top Speed", value: stats.topSpeed, unit: "km/h", description: "Theoretical maximum speed." },
              { id: "handling", label: "Handling", value: stats.handling, unit: "/100", description: "Cornering and stability score." },
          ]
      },
      {
          title: "Engineering",
          stats: [
              { id: "weight", label: "Curb Weight", value: weight, unit: "kg", reversed: true, description: "Total vehicle weight including engine." },
              { id: "adaptability", label: "Adaptability", value: stats.adaptability, unit: "/100", description: "Off-road and utility capability." },
              { id: "safety", label: "Safety Rating", value: stats.safety, unit: "/100", description: "Crash test performance." },
              { id: "comfort", label: "Comfort", value: stats.comfort, unit: "/100", description: "Ride quality and luxury." },
          ]
      },
      {
          title: "Market",
          stats: [
              { id: "productionCost", label: "Manuf. Cost", value: productionCost, unit: "$", reversed: true, description: "Cost to build one unit." },
              { id: "marketAppeal", label: "Est. Appeal", value: marketAppeal, unit: "/100", description: "Predicted market desire based on specs." },
          ]
      }
  ];

  // --- Handlers ---
  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleCosmeticChange = (categoryId: string, partId: string) => {
      setCosmetics(prev => ({ ...prev, [categoryId]: partId }));
  };

  const handleFeatureChange = (categoryId: string, featureId: string) => {
      setFeatures(prev => ({ ...prev, [categoryId]: featureId }));
  };

  // --- RP CALCULATION HELPERS ---
  const isPartNew = (unlockYear: number) => {
      return (year - unlockYear) <= 5;
  };

  const calculateRpReward = () => {
      let rp = 100; // Base Reward

      // Complexity Bonus (using Cost as proxy)
      rp += Math.floor(productionCost / 100);

      // Innovation Bonus (Parts < 5 years old)
      // Body
      if(isPartNew(selectedBodyData.unlockYear)) rp += 20;
      
      // Running Gear
      const drivetrain = DRIVETRAINS.find(d => d.id === drivetrainId);
      const suspension = SUSPENSIONS.find(s => s.id === suspensionId);
      const tires = TIRES.find(t => t.id === tireId);
      if(drivetrain && isPartNew(drivetrain.unlockYear)) rp += 15;
      if(suspension && isPartNew(suspension.unlockYear)) rp += 15;
      if(tires && isPartNew(tires.unlockYear)) rp += 10;

      // Features Innovation
      Object.entries(features).forEach(([catId, featureId]) => {
          const category = CAR_FEATURES[catId];
          const feature = category?.features.find(f => f.id === featureId);
          if (feature && isPartNew(feature.unlockYear)) {
              rp += 10;
          }
      });

      return rp;
  };

  const handleProduce = () => {
    if (!compatible) return;
    if (!selectedEngine) return;
    if (!modelName.trim()) return alert("Name your model!");
    if (!canAfford) return alert("Insufficient funds for production batch!");
    
    // Check PU Logic (Recalculated from render step to be safe)
    const tempCar: CarModel = {
      id: 'temp',
      name: modelName,
      engineId: selectedEngine.id,
      isOutsourcedEngine: selectedEngine.isSupplier, // Flag for PU savings
      specs: config,
      chassisName: `${selectedBodyData.name} on ${frameType}`, 
      basePrice: salePrice,
      productionCost: productionCost,
      prestigeValue: 0,
      marketAppeal: marketAppeal, 
      stats,
      totalUnitsSold: 0,
      inventory: 0, 
      batchSize: 0, 
      launchDay: 0, 
      isReleased: false,
      reviews: [],
      finalReviewScore: 0
    };

    const puEffortPerUnit = getUnitEffort(tempCar);
    const load = calculateCurrentLoad();
    const freeCapacity = load.capacity - load.used;
    const maxRate = Math.floor(freeCapacity / puEffortPerUnit);

    if (maxRate < 1) {
        alert(t('design.factory_full'));
        return;
    }

    const newCar: CarModel = {
      ...tempCar,
      id: `car_${Date.now()}`
    };

    const rpGained = calculateRpReward();
    gainResearchPoints(rpGained);
    alert(`Project Complete! Engineering team gained +${rpGained} Research Points.`);

    startProduction(newCar, batchSize, 0); // 0 weeks because it's calculated internally now
    onBack();
  };

  // --- Render Steps ---

  // STEP 0: MARKET STRATEGY
  const renderStep0 = () => (
      <div className="space-y-8">
          <div className="bg-slate-900/50 p-6 rounded border border-slate-700">
              <h3 className="font-bold text-white mb-4 text-lg">{t('design.market_positioning')}</h3>
              <p className="text-slate-400 mb-6">{t('design.market_desc')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <label className="block text-sm font-bold text-blue-400 uppercase mb-2">{t('design.primary_segment')}</label>
                      <div className="flex flex-col gap-2">
                          {Object.values(MarketCategoryPrimary).map(cat => (
                              <label key={cat} className={`flex items-center gap-3 p-4 rounded border cursor-pointer transition-colors ${marketPrimary === cat ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                                  <input type="radio" name="marketPrimary" checked={marketPrimary === cat} onChange={() => setMarketPrimary(cat)} className="accent-blue-500 w-4 h-4" />
                                  <span className="text-white font-bold">{cat}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-purple-400 uppercase mb-2">{t('design.secondary_niche')}</label>
                      <div className="flex flex-col gap-2">
                          {Object.values(MarketCategorySecondary).map(cat => (
                              <label key={cat} className={`flex items-center gap-3 p-4 rounded border cursor-pointer transition-colors ${marketSecondary === cat ? 'bg-purple-900/30 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                                  <input type="radio" name="marketSecondary" checked={marketSecondary === cat} onChange={() => setMarketSecondary(cat)} className="accent-purple-500 w-4 h-4" />
                                  <span className="text-white font-bold">{cat}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              </div>

              {!isValidCombo && (
                  <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded flex items-center gap-3 text-red-200">
                      <AlertTriangle />
                      <span>Invalid Combination! A {marketPrimary} car cannot be a {marketSecondary}.</span>
                  </div>
              )}
          </div>
      </div>
  );

  // STEP 1: ENGINE SELECTION
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
         <h3 className="font-bold text-white mb-4">{t('design.select_powertrain')}</h3>
         
         {/* Engine Source Tabs */}
         <div className="flex space-x-2 mb-6 border-b border-slate-700 pb-2">
             <button 
                onClick={() => setEngineTab('my_engines')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${engineTab === 'my_engines' ? 'bg-blue-900/40 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
             >
                <Beaker size={16} /> {t('design.my_engines')}
             </button>
             <button 
                onClick={() => setEngineTab('global_market')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${engineTab === 'global_market' ? 'bg-emerald-900/40 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
             >
                <Globe size={16} /> {t('design.global_market')}
             </button>
         </div>

         {/* Content Area */}
         {engineTab === 'my_engines' && unlockedEngines.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-red-500 rounded bg-red-900/10">
                <Beaker size={48} className="mx-auto text-red-500 mb-4 opacity-50"/>
                <h3 className="text-red-400 font-bold mb-2">No Engines Available</h3>
                <p className="text-slate-400 mb-4 max-w-md mx-auto">
                    You haven't designed any engines yet. Visit the <strong className="text-white">{t('menu.rnd')}</strong> to build one, or buy one from the Global Market.
                </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {(engineTab === 'my_engines' ? unlockedEngines : availableSupplierEngines).map(e => {
                    const vol = getEngineVolume(e);
                    return (
                        <div 
                            key={e.id}
                            onClick={() => setSelectedEngineId(e.id)}
                            className={`p-4 rounded border cursor-pointer transition-all ${selectedEngineId === e.id ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-800 border-slate-600 hover:border-slate-400'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white">{e.name}</span>
                                <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">{e.type}</span>
                            </div>
                            <div className="space-y-1 text-xs text-slate-300">
                                <div className="flex justify-between"><span>Power:</span> <span className="text-white font-mono">{e.horsepower} hp</span></div>
                                <div className="flex justify-between">
                                    <span>Cost:</span> 
                                    <span className={e.isSupplier ? 'text-red-400 font-bold' : 'text-emerald-400 font-mono'}>
                                        {formatMoney(e.productionCost)} {e.isSupplier && '(Buy Price)'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                                    <span>Physical Size:</span> 
                                    <span className="font-bold">{vol}/100</span>
                                </div>
                                {e.isSupplier && (
                                    <div className="flex justify-between items-center mt-2 bg-emerald-900/30 p-1 rounded border border-emerald-900">
                                        <span className="text-emerald-400 font-bold flex items-center gap-1"><Factory size={10}/> Factory Effort:</span>
                                        <span className="text-white font-bold">0 PU</span>
                                    </div>
                                )}
                                {!e.isSupplier && (
                                     <div className="flex justify-between items-center mt-2 text-slate-500">
                                         <span>Factory Effort:</span>
                                         <span>2.0 PU</span>
                                     </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
         )}
      </div>
    </div>
  );

  // STEP 2: CHASSIS & MECHANICS
  const renderStep2 = () => (
    <div className="space-y-8">
       {/* Frame Config */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.frame_type')}</label>
              <div className="flex flex-col gap-2">
                  {Object.values(ChassisFrameType).map(t => (
                      <label key={t} className={`flex items-center gap-3 p-3 rounded border cursor-pointer ${frameType === t ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
                          <input type="radio" name="frameType" checked={frameType === t} onChange={() => setFrameType(t)} className="accent-blue-500" />
                          <span className="text-sm text-white">{t}</span>
                      </label>
                  ))}
              </div>
          </div>
          <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.frame_material')}</label>
              <div className="flex flex-col gap-2">
                  {Object.values(ChassisMaterial).map(m => (
                      <label key={m} className={`flex items-center gap-3 p-3 rounded border cursor-pointer ${frameMaterial === m ? 'bg-purple-900/30 border-purple-500' : 'bg-slate-800 border-slate-700'}`}>
                          <input type="radio" name="frameMaterial" checked={frameMaterial === m} onChange={() => setFrameMaterial(m)} className="accent-purple-500" />
                          <span className="text-sm text-white">{m}</span>
                      </label>
                  ))}
              </div>
          </div>
       </div>

       <hr className="border-slate-700" />

       {/* Running Gear Selectors */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.drivetrain')}</label>
               <select 
                    value={drivetrainId}
                    onChange={(e) => setDrivetrainId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
               >
                   {DRIVETRAINS.filter(p => p.unlockYear <= year).map(part => (
                       <option key={part.id} value={part.id}>{part.name} (+${part.cost})</option>
                   ))}
               </select>
           </div>
           <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.suspension')}</label>
               <select 
                    value={suspensionId}
                    onChange={(e) => setSuspensionId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
               >
                   {SUSPENSIONS.filter(p => p.unlockYear <= year).map(part => (
                       <option key={part.id} value={part.id}>{part.name} (+${part.cost})</option>
                   ))}
               </select>
           </div>
           <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.tires')}</label>
               <select 
                    value={tireId}
                    onChange={(e) => setTireId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
               >
                   {TIRES.filter(p => p.unlockYear <= year).map(part => (
                       <option key={part.id} value={part.id}>{part.name} (+${part.cost})</option>
                   ))}
               </select>
           </div>
       </div>

       <hr className="border-slate-700" />

       {/* Sliders */}
       <div className="space-y-6">
           <div>
               <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-white flex items-center gap-2"><ArrowLeft size={14}/> {t('design.wheelbase')} <ArrowRight size={14}/></label>
                   <span className="font-mono text-blue-400">{wheelbase} cm</span>
               </div>
               <input 
                 type="range" min="200" max="350" step="5"
                 value={wheelbase} onChange={(e) => setWheelbase(Number(e.target.value))}
                 className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
               <p className="text-xs text-slate-500 mt-1">Affects: Stability, Comfort, Weight</p>
           </div>

           <div>
               <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-white flex items-center gap-2"><MoveVertical size={14}/> {t('design.ride_height')}</label>
                   <span className={`font-mono ${rideHeight > 70 ? 'text-amber-400' : rideHeight < 30 ? 'text-blue-400' : 'text-slate-200'}`}>
                       {rideHeight < 30 ? 'Low (Sport)' : rideHeight > 70 ? 'High (Offroad)' : 'Neutral'} ({rideHeight})
                   </span>
               </div>
               <input 
                 type="range" min="0" max="100" 
                 value={rideHeight} onChange={(e) => setRideHeight(Number(e.target.value))}
                 className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
               />
               <p className="text-xs text-slate-500 mt-1">Low: Better Aero/Handling. High: Better Adaptability.</p>
           </div>

           {/* FIT SYSTEM 2.0 */}
           <div className={`p-4 rounded border transition-colors ${compatible ? 'bg-slate-800 border-slate-600' : 'bg-red-900/20 border-red-500'}`}>
               <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-white flex items-center gap-2"><Box size={14}/> {t('design.engine_bay')}</label>
                   <span className={`font-mono font-bold ${compatible ? 'text-emerald-400' : 'text-red-400'}`}>{engineBaySize}/100</span>
               </div>
               
               <input 
                 type="range" min="20" max="100" 
                 value={engineBaySize} onChange={(e) => setEngineBaySize(Number(e.target.value))}
                 className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${compatible ? 'bg-slate-700 accent-emerald-500' : 'bg-red-900/50 accent-red-500'}`}
               />

               <div className="mt-3 relative h-6 w-full bg-slate-900 rounded overflow-hidden border border-slate-700">
                   <div 
                      className="absolute top-0 bottom-0 bg-blue-500/30 border-r-2 border-blue-500 z-10 flex items-center justify-end px-1"
                      style={{ width: `${engineVolume}%` }}
                   >
                       <span className="text-[10px] text-blue-200 font-bold whitespace-nowrap bg-slate-900/80 px-1 rounded">Req: {engineVolume}</span>
                   </div>
                   <div 
                      className={`h-full transition-all duration-300 ${compatible ? 'bg-emerald-600' : 'bg-red-600'}`}
                      style={{ width: `${engineBaySize}%` }}
                   ></div>
               </div>

               <div className="mt-2 text-xs flex items-center gap-2">
                  {compatible 
                    ? <><CheckCircle size={14} className="text-emerald-500"/> <span className="text-emerald-400">Engine fits comfortably.</span></>
                    : <><AlertTriangle size={14} className="text-red-500"/> <span className="text-red-400">Bay too small! Increase size to fit the engine.</span></>
                  }
               </div>
           </div>
       </div>
    </div>
  );

  // STEP 3: BODYWORK & COSMETICS
  const renderStep3 = () => (
     <div className="space-y-8">
        
        {/* === VISUALIZATION ADDED === */}
        <div className="mb-6">
            <CarBlueprint 
                bodyType={selectedBodyData.name} 
                color="#3b82f6" 
                wheelbase={wheelbase}
                rideHeight={rideHeight}
                className="bg-slate-900/50 rounded-lg border border-slate-700"
            />
        </div>

        {/* Core Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.body_shape')}</label>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {BODY_TYPES.filter(b => b.unlockYear <= year).map(b => (
                      <div 
                        key={b.id}
                        onClick={() => setBodyTypeId(b.id)}
                        className={`p-3 rounded border cursor-pointer transition-colors ${bodyTypeId === b.id ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                      >
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-sm font-bold text-white">{b.name}</span>
                             <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                                 {t(`vehicle_types.${b.type.toLowerCase()}`)}
                             </span>
                         </div>
                         <div className="text-[10px] text-slate-500 flex justify-between">
                             <span>Base Drag: {b.baseDrag.toFixed(2)}</span>
                             <span>Base Cost: {formatMoney(b.baseCost)}</span>
                         </div>
                      </div>
                  ))}
              </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('design.design_era')}</label>
                    <select 
                        value={designEra} 
                        onChange={(e) => setDesignEra(e.target.value as DesignEra)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    >
                        {Object.values(DesignEra).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                {/* Visual Feedback of Selection */}
                <div className="p-4 bg-slate-900 rounded border border-slate-800 text-center">
                    <div className="text-white font-bold">{selectedBodyData.name}</div>
                    <div className="text-xs text-slate-500">{designEra} Styling</div>
                </div>
            </div>
        </div>

        <hr className="border-slate-700" />

        {/* Cosmetic Details Section */}
        <div>
             <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Wrench size={16} className="text-amber-500"/> {t('design.exterior_detail')}
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {Object.values(COSMETIC_CATEGORIES).map(cat => {
                     const unlockedParts = cat.parts.filter(p => p.unlockYear <= year);
                     if (unlockedParts.length === 0) return null;

                     return (
                         <div key={cat.id}>
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{cat.name}</label>
                             <select 
                                 value={cosmetics[cat.id] || unlockedParts[0].id} 
                                 onChange={(e) => handleCosmeticChange(cat.id, e.target.value)}
                                 className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-amber-500"
                             >
                                 {unlockedParts.map(part => (
                                     <option key={part.id} value={part.id}>
                                         {part.name} ({part.costMod > 0 ? `+${t('common.free')}` : 'Free'})
                                         {part.costMod > 0 ? `+$${part.costMod}` : ''}
                                     </option>
                                 ))}
                             </select>
                         </div>
                     );
                 })}
             </div>
        </div>
     </div>
  );

  // STEP 4: INTERIOR & TECH
  const renderStep4 = () => (
      <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Col: Safety & Core */}
              <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
                      <Shield size={16} className="text-emerald-500"/> {t('design.safety_control')}
                  </h3>
                  
                  {['seatbelts', 'airbags', 'steering', 'assists'].map(catId => {
                      const category = CAR_FEATURES[catId];
                      if (!category) return null;
                      return (
                          <div key={catId}>
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{category.name}</label>
                               <select 
                                   value={features[catId] || category.features[0].id}
                                   onChange={(e) => handleFeatureChange(catId, e.target.value)}
                                   className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500"
                               >
                                   {category.features.map(feat => {
                                       const isTimeUnlocked = feat.unlockYear <= year;
                                       const isTechUnlocked = !feat.techIdRequirement || unlockedTechIds.includes(feat.techIdRequirement);
                                       const isUnlocked = isTimeUnlocked && isTechUnlocked;
                                       
                                       return (
                                           <option key={feat.id} value={feat.id} disabled={!isUnlocked}>
                                               {feat.name} {!isUnlocked ? `(${t('common.locked')})` : `(+$${feat.cost})`}
                                           </option>
                                       )
                                   })}
                               </select>
                          </div>
                      );
                  })}
              </div>

              {/* Right Col: Comfort & Trim */}
              <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
                      <Armchair size={16} className="text-purple-500"/> {t('design.comfort_trim')}
                  </h3>

                  {['transmission', 'interior', 'infotainment'].map(catId => {
                      const category = CAR_FEATURES[catId];
                      if (!category) return null;
                      return (
                          <div key={catId}>
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{category.name}</label>
                               <select 
                                   value={features[catId] || category.features[0].id}
                                   onChange={(e) => handleFeatureChange(catId, e.target.value)}
                                   className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                               >
                                   {category.features.map(feat => {
                                       const isTimeUnlocked = feat.unlockYear <= year;
                                       const isTechUnlocked = !feat.techIdRequirement || unlockedTechIds.includes(feat.techIdRequirement);
                                       const isUnlocked = isTimeUnlocked && isTechUnlocked;
                                       
                                       return (
                                           <option key={feat.id} value={feat.id} disabled={!isUnlocked}>
                                               {feat.name} {!isUnlocked ? `(${t('common.locked')})` : `(+$${feat.cost})`}
                                           </option>
                                       )
                                   })}
                               </select>
                          </div>
                      );
                  })}

                  <div className="mt-4 pt-4 border-t border-slate-700">
                     <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-300 mb-2">{t('design.sliders_quality')}</label>
                        <input 
                            type="range" min="0" max="100" 
                            value={interiorQuality} onChange={(e) => setInteriorQuality(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">{t('design.sliders_sport')}</label>
                        <input 
                            type="range" min="0" max="100" 
                            value={suspensionStiff} onChange={(e) => setSuspensionStiff(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                  </div>
              </div>
          </div>
      </div>
  );

  // STEP 5: PRODUCTION PLANNING
  const renderStep5 = () => {
      // 1. Create Temp Model to get Specs
      const tempCarForReview: CarModel = {
          id: 'temp',
          name: modelName,
          engineId: selectedEngine ? selectedEngine.id : '',
          isOutsourcedEngine: selectedEngine?.isSupplier, // Flag logic
          specs: config,
          chassisName: 'temp',
          basePrice: salePrice,
          productionCost: productionCost,
          prestigeValue: 0,
          marketAppeal: marketAppeal,
          stats: stats,
          totalUnitsSold: 0,
          inventory: 0,
          batchSize: 0, 
          launchDay: date,
          isReleased: false,
          reviews: [],
          finalReviewScore: 0
      };

      const { finalScore } = calculateCarReviews(tempCarForReview);
      
      // 2. Capacity Calculations
      const puEffortPerUnit = getUnitEffort(tempCarForReview);
      const load = calculateCurrentLoad();
      const freeCapacity = load.capacity - load.used;
      const maxPossibleRate = Math.floor(freeCapacity / puEffortPerUnit);
      const weeklyPU = maxPossibleRate * puEffortPerUnit;
      const durationWeeks = maxPossibleRate > 0 ? Math.ceil(batchSize / maxPossibleRate) : 0;
      const isCapacityBlocked = maxPossibleRate < 1;

      // Range settings for slider
      const minPrice = Math.floor(productionCost * 0.9); // Can sell at loss if desperate
      const maxPrice = Math.floor(productionCost * 4.0); 

      // Quality Warning
      const isJunk = finalScore < 30;

      return (
        <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Factory /> {t('design.step5')}</h3>
                <div className="space-y-6">
                    
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('design.model_name')}</label>
                        <input 
                            type="text" 
                            value={modelName} onChange={e => setModelName(e.target.value)}
                            placeholder={t('design.name_placeholder')}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <hr className="border-slate-700" />

                    {/* Batch Size Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase">{t('design.production_run')}</label>
                            <span className="font-mono text-xl text-blue-400 font-bold">{batchSize.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" min="100" max="100000" step="100"
                            value={batchSize} onChange={e => setBatchSize(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Total units to produce over time.</p>
                    </div>

                    {/* Factory Capacity Impact */}
                    <div className={`p-3 rounded border ${isCapacityBlocked ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/30 border-slate-700/50'}`}>
                         <div className="flex justify-between items-center mb-1">
                             <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Factory size={12}/> Production Rate</div>
                             <div className={`font-mono font-bold ${isCapacityBlocked ? 'text-red-400' : 'text-blue-400'}`}>
                                 {maxPossibleRate} cars/week
                             </div>
                         </div>
                         
                         {!isCapacityBlocked ? (
                             <div className="space-y-2 mt-2">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <span className="flex items-center gap-1"><Clock size={12}/> Estimated Duration:</span>
                                    <span className="font-bold text-white">{durationWeeks} {t('common.week')}s</span>
                                </div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{width: `${Math.min(100, (weeklyPU/load.capacity)*100)}%`}}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Consumes {Math.round(weeklyPU)} PU/wk</span>
                                    <span>Available: {Math.round(freeCapacity)} PU</span>
                                </div>
                                {selectedEngine?.isSupplier && (
                                     <div className="mt-1 text-xs text-emerald-400 font-bold flex items-center gap-1">
                                         <CheckCircle size={10} /> {t('design.efficiency_alert')}
                                     </div>
                                )}
                             </div>
                         ) : (
                             <div className="text-xs text-red-400 font-bold mt-1 flex items-center gap-1">
                                 <AlertTriangle size={12}/> {t('design.factory_full')}
                             </div>
                         )}
                    </div>

                    <hr className="border-slate-700" />

                    {/* DYNAMIC PRICING SLIDER (BLIND MODE) */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('design.pricing')}</label>
                                <div className="flex items-center gap-2 text-2xl text-white font-mono font-bold">
                                    <DollarSign size={20} className="text-emerald-500" />
                                    {formatMoney(salePrice)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500 uppercase">{t('design.est_profit')}</div>
                                <div className={`font-mono font-bold text-lg ${profitPerUnit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {profitPerUnit > 0 ? '+' : ''}{formatMoney(profitPerUnit)}
                                    <span className="text-xs ml-1 opacity-75">({margin.toFixed(1)}%)</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-8 mb-2 bg-slate-700 rounded-full">
                            <input 
                                type="range" 
                                min={minPrice} 
                                max={maxPrice} 
                                step={50}
                                value={salePrice} 
                                onChange={e => setSalePrice(Number(e.target.value))}
                                className="w-full h-full opacity-0 cursor-pointer absolute z-20"
                            />
                            {/* Simple visual thumb approximation */}
                            <div 
                                className="absolute top-0 bottom-0 bg-blue-500 rounded-l-full pointer-events-none"
                                style={{ width: `${((salePrice - minPrice) / (maxPrice - minPrice)) * 100}%` }}
                            ></div>
                            <div 
                                className="absolute top-1 bottom-1 w-6 bg-white rounded-full shadow pointer-events-none transition-all"
                                style={{ left: `calc(${((salePrice - minPrice) / (maxPrice - minPrice)) * 100}% - 12px)` }}
                            ></div>
                        </div>
                        
                        <div className="text-xs text-slate-500 italic text-center mt-2">
                            Set your price carefully. Market reaction is unknown until launch.
                        </div>
                        
                        {isJunk && (
                            <div className="mt-4 text-xs text-red-400 font-bold flex items-center gap-2 bg-red-900/20 p-2 rounded justify-center">
                                <AlertTriangle size={14} /> Quality Alert: Low review scores will severely impact sales regardless of price.
                            </div>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-2 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-300">{t('design.total_cost')}</span>
                            <span className={`font-mono text-xl font-bold ${canAfford ? 'text-white' : 'text-red-500'}`}>
                                {formatMoney(totalProductionCost)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center bg-blue-900/20 p-2 rounded border border-blue-500/20">
                            <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                                <Lightbulb size={12} /> {t('design.innovation_bonus')}
                            </span>
                            <span className="font-mono text-sm text-white font-bold">
                                +{calculateRpReward()} RP
                            </span>
                        </div>

                        {!canAfford && <div className="text-xs text-red-500 text-right mt-1">{t('design.insufficient_funds')}</div>}
                    </div>

                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Progress Header */}
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
         <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-blue-500" /> {t('design.title')}
         </h2>
         <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4, 5].map(s => (
                <div 
                    key={s} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500'}`}
                >
                    {step > s ? <CheckCircle size={16} /> : s}
                </div>
            ))}
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
         {/* Main Content Area */}
         <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2">
            <Card title={
                step === 0 ? t('design.step0') :
                step === 1 ? t('design.step1') : 
                step === 2 ? t('design.step2') : 
                step === 3 ? t('design.step3') : 
                step === 4 ? t('design.step4') : t('design.step5')
            } className="h-full">
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </Card>
         </div>

         {/* Sidebar / Info */}
         <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
             <div className="flex-1 min-h-0">
                 {step === 0 ? (
                     <div className="bg-slate-900 border border-slate-700 p-4 rounded h-full">
                         <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Target size={16}/> Market Info</h4>
                         <p className="text-sm text-slate-400 mb-4">
                             Different categories require different specs. 
                             <br/><br/>
                             <strong>Popular:</strong> Needs low cost and reliability.<br/>
                             <strong>Luxury:</strong> Needs comfort and features.<br/>
                             <strong>Supercar:</strong> Needs raw performance.
                         </p>
                     </div>
                 ) : (
                    <TelemetryPanel categories={telemetryCategories} previousData={baselineStatsRef.current} />
                 )}
             </div>

             <div className="mt-auto flex gap-3">
                 <Button 
                    variant="secondary" 
                    onClick={step === 0 ? onBack : handlePrev}
                    className="flex-1"
                 >
                    {step === 0 ? t('common.cancel') : t('common.back')}
                 </Button>
                 
                 {step < 5 ? (
                     <Button 
                        variant="primary" 
                        onClick={handleNext}
                        disabled={(step === 0 && !isValidCombo) || (step === 1 && !selectedEngine) || (step === 2 && !compatible)}
                        className="flex-1"
                     >
                        {t('common.next')}
                     </Button>
                 ) : (
                     <Button 
                        variant="success" 
                        onClick={handleProduce}
                        disabled={!canAfford}
                        className="flex-1"
                     >
                        {t('design.start_production')}
                     </Button>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};