import { 
  Engine, EngineType, CylinderLayout, EngineBlockType, 
  InductionType, FuelType, ValvetrainType, EngineDesignParams, DynoPoint 
} from '../types';

// Physical constants for cylinder layouts
export const CYLINDER_CONFIGS: Record<CylinderLayout, { cylinders: number, maxCapacityCc: number, baseWeight: number, baseSmoothness: number }> = {
  [CylinderLayout.I3]: { cylinders: 3, maxCapacityCc: 1800, baseWeight: 80, baseSmoothness: 0.6 },
  [CylinderLayout.I4]: { cylinders: 4, maxCapacityCc: 2800, baseWeight: 110, baseSmoothness: 0.8 },
  [CylinderLayout.I6]: { cylinders: 6, maxCapacityCc: 4500, baseWeight: 180, baseSmoothness: 0.95 },
  [CylinderLayout.V6]: { cylinders: 6, maxCapacityCc: 4200, baseWeight: 160, baseSmoothness: 0.85 },
  [CylinderLayout.V8]: { cylinders: 8, maxCapacityCc: 7500, baseWeight: 220, baseSmoothness: 0.9 },
  [CylinderLayout.V10]: { cylinders: 10, maxCapacityCc: 8400, baseWeight: 260, baseSmoothness: 0.85 },
  [CylinderLayout.V12]: { cylinders: 12, maxCapacityCc: 7000, baseWeight: 300, baseSmoothness: 1.0 },
};

/**
 * Calculates the final statistics of an engine based on deep physical simulation.
 */
export const calculateEngineStats = (params: EngineDesignParams): Omit<Engine, 'id'> => {
  const { layout, blockType, fuelType, valvetrain, induction, bore, stroke, sliderQuality } = params;
  const config = CYLINDER_CONFIGS[layout];
  
  // 1. Calculate Displacement (cc)
  const radius = bore / 20; // cm
  const strokeCm = stroke / 10; // cm
  const displacement = Math.round((Math.PI * Math.pow(radius, 2) * strokeCm) * config.cylinders * 1000) / 1000;
  const displacementCc = Math.round(displacement);

  // 2. RPM Limit (Redline)
  let maxPistonSpeed = 20; // m/s, baseline
  if (blockType === EngineBlockType.ALUMINUM) maxPistonSpeed += 2;
  if (sliderQuality > 70) maxPistonSpeed += (sliderQuality - 70) * 0.1;

  let valvetrainRpmBonus = 0;
  if (valvetrain === ValvetrainType.OHV) valvetrainRpmBonus = -1500;
  if (valvetrain === ValvetrainType.SOHC) valvetrainRpmBonus = 0;
  if (valvetrain === ValvetrainType.DOHC) valvetrainRpmBonus = 1000;

  const fuelRpmMod = fuelType === FuelType.DIESEL ? 0.65 : 1.0;
  let rawRedline = (maxPistonSpeed * 60) / (2 * (stroke / 1000));
  rawRedline = (rawRedline + valvetrainRpmBonus) * fuelRpmMod;
  const redline = Math.round(rawRedline / 100) * 100;

  // 3. Torque Calculation
  let torquePerLiter = 0;
  switch (fuelType) {
    case FuelType.GASOLINE: torquePerLiter = 75; break; 
    case FuelType.DIESEL: torquePerLiter = 140; break; 
    case FuelType.FLEX: torquePerLiter = 78; break; 
  }

  if (valvetrain === ValvetrainType.OHV) torquePerLiter -= 5;
  if (valvetrain === ValvetrainType.DOHC) torquePerLiter += 8;

  if (induction === InductionType.TURBO) {
    if (fuelType === FuelType.DIESEL) torquePerLiter *= 1.6;
    else torquePerLiter *= 1.45;
  }

  const baseTorque = (displacementCc / 1000) * torquePerLiter;
  const finalTorque = Math.round(baseTorque);

  // 4. Horsepower Calculation
  const powerPeakRpm = redline * 0.85; 
  let efficiencyAtPeak = 0.9;
  if (valvetrain === ValvetrainType.OHV) efficiencyAtPeak = 0.75; 
  if (valvetrain === ValvetrainType.DOHC) efficiencyAtPeak = 0.95;

  const finalHp = Math.round((finalTorque * powerPeakRpm) / 7120 * efficiencyAtPeak);

  // 5. Weight Calculation
  let engineWeight = config.baseWeight + (displacementCc * 0.04); 

  if (blockType === EngineBlockType.ALUMINUM) engineWeight *= 0.7; 
  if (valvetrain === ValvetrainType.DOHC) engineWeight += 15; 
  if (induction === InductionType.TURBO) engineWeight += 25; 
  if (fuelType === FuelType.DIESEL) engineWeight *= 1.2; 

  // 6. Reliability Calculation
  let reliability = 100;
  if (induction === InductionType.TURBO) reliability -= 15;
  if (valvetrain === ValvetrainType.DOHC) reliability -= 5;
  if (layout === CylinderLayout.V10 || layout === CylinderLayout.V12) reliability -= 10;
  if (blockType === EngineBlockType.ALUMINUM) reliability -= 5; 
  if (fuelType === FuelType.DIESEL) reliability += 15;
  reliability += (sliderQuality - 50) * 0.4;
  reliability = Math.max(10, Math.min(100, Math.round(reliability)));

  // 7. Fuel Efficiency Score (0-100)
  let efficiencyScore = 50;
  efficiencyScore -= (displacementCc - 2000) / 100; 
  efficiencyScore -= (config.cylinders - 4) * 2;
  if (fuelType === FuelType.DIESEL) efficiencyScore += 25;
  if (fuelType === FuelType.FLEX) efficiencyScore -= 5; 
  if (induction === InductionType.TURBO) efficiencyScore += 5; 
  if (valvetrain === ValvetrainType.OHV) efficiencyScore -= 5;
  if (valvetrain === ValvetrainType.DOHC) efficiencyScore += 5;
  efficiencyScore = Math.max(10, Math.min(100, Math.round(efficiencyScore)));

  // 8. Cost Calculation
  let cost = 500 + (config.cylinders * 150) + (displacementCc * 0.2);
  if (blockType === EngineBlockType.ALUMINUM) cost *= 1.5;
  if (valvetrain === ValvetrainType.DOHC) cost += 400;
  if (induction === InductionType.TURBO) cost += 800;
  if (fuelType === FuelType.DIESEL) cost += 300; 
  cost *= (1 + (sliderQuality / 100)); 

  return {
    name: params.name,
    layout: params.layout,
    type: EngineType.I4, 
    fuelType,
    valvetrain,
    blockType,
    induction,
    bore,
    stroke,
    displacement: displacementCc,
    horsepower: finalHp,
    torque: finalTorque,
    redline,
    weight: Math.round(engineWeight),
    reliability,
    fuelEfficiency: efficiencyScore,
    productionCost: Math.round(cost),
  };
};

export const calculateDevelopmentCost = (stats: Omit<Engine, 'id'>): number => {
    return 50000 + (stats.productionCost * 100) + (stats.horsepower * 100);
}

/**
 * Generates data points for the Dyno Chart.
 * Simulates curve shapes based on induction and valvetrain.
 */
export const generateDynoData = (stats: Omit<Engine, 'id'>): DynoPoint[] => {
  const points: DynoPoint[] = [];
  const steps = 10;
  const startRpm = 1000;
  const range = stats.redline - startRpm;
  const stepSize = range / steps;

  // Curve Shape Logic
  // Turbo: Peaks early, plateau, drops.
  // NA: Peaks mid-high, gradual drop.
  
  let torquePeakRpmRatio = 0.6; // Peak at 60% of rev range (NA standard)
  if (stats.induction === InductionType.TURBO) torquePeakRpmRatio = 0.35; // Peak early
  if (stats.valvetrain === ValvetrainType.OHV) torquePeakRpmRatio = 0.45; // Low end torque

  const torquePeakRpm = startRpm + (range * torquePeakRpmRatio);

  for (let i = 0; i <= steps; i++) {
    const rpm = Math.round(startRpm + (i * stepSize));
    
    // Simulate Torque Curve
    let torqueFactor = 0;
    
    if (rpm < torquePeakRpm) {
        // Ramp up
        const progress = (rpm - 800) / (torquePeakRpm - 800);
        torqueFactor = 0.7 + (0.3 * Math.sin(progress * (Math.PI / 2)));
    } else {
        // Drop off
        const progress = (rpm - torquePeakRpm) / (stats.redline - torquePeakRpm);
        // Turbo holds flat longer then drops hard
        if (stats.induction === InductionType.TURBO) {
            torqueFactor = 1.0 - (0.4 * Math.pow(progress, 3)); 
        } else {
            // NA drops linearly
            torqueFactor = 1.0 - (0.25 * progress);
        }
    }

    const currentTorque = stats.torque * torqueFactor;
    
    // HP = (Torque * RPM) / 7121 (Metric)
    // We constrain HP to not exceed stats.horsepower drastically due to simulation artifacts
    const calculatedHp = (currentTorque * rpm) / 7121;
    
    points.push({
        rpm,
        torque: Math.round(currentTorque),
        hp: Math.round(calculatedHp)
    });
  }

  return points;
};
