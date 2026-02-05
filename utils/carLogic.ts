import { 
  Engine, EngineType, CarStats, CarDesignConfiguration, 
  ChassisFrameType, ChassisMaterial, DesignEra 
} from '../types';
import { BODY_TYPES, COSMETIC_CATEGORIES } from '../data/cosmeticParts';
import { CAR_FEATURES } from '../data/carFeatures';
import { DRIVETRAINS, SUSPENSIONS, TIRES } from '../data/runningGear';

/**
 * Returns the physical volume requirement of an engine (0-100 scale).
 * Used for the Fit System 2.0.
 */
export const getEngineVolume = (engine: Engine): number => {
  let baseVolume = 0;
  switch (engine.type) {
    case EngineType.I4: baseVolume = 35; break;
    case EngineType.V6: baseVolume = 55; break;
    case EngineType.V8: baseVolume = 75; break;
    case EngineType.ELECTRIC: baseVolume = 40; break;
    default: baseVolume = 50;
  }
  
  // Modifiers
  if (engine.induction !== 'Naturally Aspirated') {
    baseVolume += 15; // Intercoolers and piping take space
  }

  return baseVolume;
};

interface CalculatedCarData {
  stats: CarStats;
  productionCost: number;
  weight: number;
  aerodynamics: number;
  compatible: boolean;
  message?: string;
  marketAppeal: number;
}

export const calculateDynamicCarStats = (
  engine: Engine,
  config: CarDesignConfiguration
): CalculatedCarData => {
  
  // 1. Compatibility Check (Fit System 2.0)
  const requiredSpace = getEngineVolume(engine);
  if (config.engineBaySize < requiredSpace) {
    return {
      compatible: false,
      message: `Engine requires size ${requiredSpace}, but bay is only ${config.engineBaySize}. Increase Bay Size slider!`,
      stats: {} as CarStats,
      productionCost: 0,
      weight: 0,
      aerodynamics: 0,
      marketAppeal: 0
    };
  }

  // --- Fetch Data ---
  const bodyData = BODY_TYPES.find(b => b.id === config.bodyTypeId) || BODY_TYPES[0];
  const drivetrain = DRIVETRAINS.find(d => d.id === config.drivetrainId) || DRIVETRAINS[0];
  const suspension = SUSPENSIONS.find(s => s.id === config.suspensionId) || SUSPENSIONS[0];
  const tires = TIRES.find(t => t.id === config.tireId) || TIRES[0];
  
  // 2. Physical Dimensions & Material
  let matDensity = 1.0;
  let matCost = 1.0;
  
  switch (config.frameMaterial) {
    case ChassisMaterial.STEEL: matDensity = 1.0; matCost = 1.0; break;
    case ChassisMaterial.GALVANIZED: matDensity = 1.05; matCost = 1.2; break; // Heavier coating
    case ChassisMaterial.ALUMINUM: matDensity = 0.6; matCost = 2.5; break;
    case ChassisMaterial.CARBON: matDensity = 0.4; matCost = 6.0; break;
  }

  // Frame Weight
  const frameBaseWeight = 400 + (config.wheelbase * 1.5); 
  const chassisWeight = frameBaseWeight * matDensity;

  // Body Base Weight
  const bayWeightPenalty = config.engineBaySize * 2; 
  const bodyWeight = (bodyData.baseWeight + bayWeightPenalty) * matDensity;

  // Interior Base Weight (from slider)
  const interiorBaseWeight = 50 + (config.sliderInterior / 100) * 100;

  // Running Gear Weight
  const runningGearWeight = drivetrain.weight + suspension.weight + tires.weight;

  // --- Features Calculation (Trim) ---
  let featureWeight = 0;
  let featureCost = 0;
  let featureSafety = 0;
  let featureComfort = 0;
  let featureHandling = 0;
  
  if (config.features) {
    Object.entries(config.features).forEach(([catId, featureId]) => {
      const category = CAR_FEATURES[catId];
      if (category) {
        const feature = category.features.find(f => f.id === featureId);
        if (feature) {
          featureWeight += feature.weight;
          featureCost += feature.cost;
          featureSafety += feature.safetyMod;
          featureComfort += feature.comfortMod;
          featureHandling += feature.handlingMod;
        }
      }
    });
  }

  // --- Cosmetic Parts Modifiers ---
  let cosmeticWeight = 0;
  let cosmeticCost = 0;
  let cosmeticDragMod = 0;
  let cosmeticHandlingMod = 0;

  Object.entries(config.cosmetics).forEach(([catId, partId]) => {
    const category = COSMETIC_CATEGORIES[catId];
    const part = category?.parts.find(p => p.id === partId);
    if (part) {
      cosmeticWeight += part.weightMod;
      cosmeticCost += part.costMod;
      cosmeticDragMod += part.dragMod;
      cosmeticHandlingMod += part.handlingMod;
    }
  });

  const totalWeight = Math.round(chassisWeight + bodyWeight + interiorBaseWeight + engine.weight + cosmeticWeight + featureWeight + runningGearWeight);

  // 3. Cost Calculation
  const frameCost = 500 + (config.wheelbase * 2);
  const bodyBaseCost = bodyData.baseCost + (config.engineBaySize * 5); 
  
  const chassisTotalCost = (frameCost + bodyBaseCost) * matCost;
  const interiorCost = 500 + (config.sliderInterior / 100) * 2000;
  const suspensionCost = 200 + (config.sliderSuspension / 100) * 500;
  const runningGearCost = drivetrain.cost + suspension.cost + tires.cost;
  
  const productionCost = Math.round(chassisTotalCost + engine.productionCost + interiorCost + suspensionCost + cosmeticCost + featureCost + runningGearCost);

  // 4. Aerodynamics
  let dragCoeff = bodyData.baseDrag + cosmeticDragMod; 
  
  if (config.designEra === DesignEra.BOX_70S) dragCoeff += 0.05;
  if (config.designEra === DesignEra.AERO_90S) dragCoeff -= 0.03;
  
  // Ride Height Aerodynamic Penalty (Lifted trucks have bad aero)
  const rideHeightRatio = config.rideHeight / 100; // 0.0 to 1.0
  if (rideHeightRatio > 0.5) {
      dragCoeff += (rideHeightRatio - 0.5) * 0.15;
  } else {
      dragCoeff -= (0.5 - rideHeightRatio) * 0.05; // Lowered cars have slightly better aero
  }

  dragCoeff = Math.max(0.20, dragCoeff);
  const aeroScore = Math.max(0, Math.min(100, (0.6 - dragCoeff) * 200));

  // 5. Performance Stats
  
  // Acceleration with Traction Logic
  const powerToWeight = engine.horsepower / (totalWeight / 1000); 
  const tractionBonus = drivetrain.tractionBonus || 0.75;
  // FWD struggles with high power. AWD handles it well.
  // If Power > 200 and FWD, efficiency drops.
  let tractionEfficiency = tractionBonus;
  if (drivetrain.id === 'drive_fwd' && engine.horsepower > 200) {
      tractionEfficiency -= 0.1;
  }
  
  let acceleration = (1200 / (powerToWeight + 10)) * (1.1 - (tractionEfficiency - 0.75)); 
  acceleration = Math.max(2.5, Math.min(25, acceleration));

  // Top Speed
  const topSpeed = 100 + Math.sqrt(engine.horsepower) * 9 * (aeroScore / 50);

  // Handling
  const weightPenalty = totalWeight / 2000; 
  const suspensionFactor = config.sliderSuspension / 100;
  let handling = (aeroScore * 0.2) + (suspensionFactor * 30) + (60 * (1 - weightPenalty));
  
  // Ride Height Handling Logic
  // Lower (0) = Better cornering (low CG). Higher (100) = Worse cornering (rollover risk).
  // Neutral is 40.
  const cgPenalty = Math.max(0, (config.rideHeight - 40) * 0.5); 
  const lowCgBonus = Math.max(0, (40 - config.rideHeight) * 0.2);
  handling = handling - cgPenalty + lowCgBonus;

  // Running Gear Mods
  handling += drivetrain.sportinessMod;
  handling += suspension.sportinessMod;
  handling += tires.sportinessMod;
  handling += cosmeticHandlingMod;
  handling += featureHandling;

  // Wheelbase modifier
  const wheelbaseDiff = Math.abs(270 - config.wheelbase);
  handling -= (wheelbaseDiff * 0.2); 

  handling = Math.max(10, Math.min(100, handling));

  // Comfort
  const suspensionPenalty = suspensionFactor * 30; // Stiff is uncomfortable
  const comfortBase = config.sliderInterior; 
  let comfort = comfortBase - suspensionPenalty;
  comfort += featureComfort; 
  comfort += drivetrain.comfortMod + suspension.comfortMod + tires.comfortMod;
  
  // Ride Height Comfort
  // Too low (0-20) = Harsh. Too high (80-100) = Wobbly. Middle is sweet spot.
  if (config.rideHeight < 20) comfort -= (20 - config.rideHeight);
  
  comfort += (config.wheelbase - 250) * 0.2; 
  comfort = Math.max(5, Math.min(100, comfort));

  // Safety
  let safety = 10 + (totalWeight / 3000) * 30; // Base mass safety
  if (config.frameMaterial === ChassisMaterial.ALUMINUM) safety -= 5;
  safety += featureSafety; 

  if (config.frameType === ChassisFrameType.LADDER && safety > 60) safety = 60 + (safety-60)*0.5;
  safety = Math.max(10, Math.min(100, safety));

  // 6. ADAPTABILITY CALCULATION (Off-Road / Utility)
  let adaptability = 10; // Base
  adaptability += drivetrain.adaptabilityMod;
  adaptability += suspension.adaptabilityMod;
  adaptability += tires.adaptabilityMod;

  // Ride Height Impact on Adaptability
  // Low (0-30): Severe penalty. High (70-100): Bonus.
  if (config.rideHeight < 30) {
      adaptability -= (30 - config.rideHeight) * 1.5;
  } else if (config.rideHeight > 60) {
      adaptability += (config.rideHeight - 60) * 0.5;
  }
  
  adaptability = Math.max(0, Math.min(100, adaptability));

  // 7. Market Appeal Calculation
  let marketAppeal = 50 + (comfort * 0.25) + (handling * 0.2) + (safety * 0.2) + (aeroScore * 0.1) + (adaptability * 0.1);

  // Market Fit Logic (Penalties)
  if (bodyData.type === 'Luxury') {
      const hasLeather = config.features['interior'] === 'int_leather';
      const isAuto = config.features['transmission']?.includes('auto');
      if (!hasLeather) marketAppeal -= 20;
      if (!isAuto) marketAppeal -= 10;
  }

  // SUV/Pickup Requirement: High Adaptability
  if ((bodyData.type === 'Utility' || bodyData.name.includes('SUV')) && adaptability < 60) {
      // Massive penalty for "Mall Crawlers" in a utilitarian segment
      marketAppeal -= 30; 
  }

  // Sport Requirement: Ignore Adaptability, penalize high ride height
  if (bodyData.type === 'Sport') {
      if (config.rideHeight > 40) marketAppeal -= (config.rideHeight - 40);
  }

  // Economy Penalty
  if (bodyData.type === 'Passenger' && productionCost > 18000) {
      marketAppeal -= 10;
  }

  return {
    compatible: true,
    stats: {
      acceleration: Number(acceleration.toFixed(1)),
      topSpeed: Math.round(topSpeed),
      handling: Math.round(handling),
      comfort: Math.round(comfort),
      safety: Math.round(safety),
      adaptability: Math.round(adaptability),
      fuelEconomy: 8 
    },
    weight: totalWeight,
    productionCost: productionCost,
    aerodynamics: aeroScore,
    marketAppeal: Math.round(marketAppeal)
  };
};
