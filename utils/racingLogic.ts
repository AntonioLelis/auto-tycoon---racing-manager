import { RacingTeam, RacingCategory, RaceResult, IndividualRaceResult, Engine, CylinderLayout, InductionType } from '../types';
import { CYLINDER_CONFIGS } from './engineCalculations';

export interface ValidationResult {
    isValid: boolean;
    status: 'VALID' | 'RESTRICTED' | 'BANNED';
    reason: string;
}

export const validateEngineForCategory = (engine: Engine, category: RacingCategory): ValidationResult => {
    const regs = category.regulations;
    const cylCount = CYLINDER_CONFIGS[engine.layout].cylinders;

    // 1. Hard Bans (Displacement, Cylinders, Turbo)
    if (engine.displacement > regs.maxDisplacement * 1.05) { // 5% tolerance
        return { isValid: false, status: 'BANNED', reason: `Displacement > ${regs.maxDisplacement}cc` };
    }
    if (!regs.allowedCylinders.includes(cylCount)) {
        return { isValid: false, status: 'BANNED', reason: `Invalid Cylinder Count (${cylCount})` };
    }
    if (engine.induction === InductionType.TURBO && !regs.forcedInductionAllowed) {
        return { isValid: false, status: 'BANNED', reason: `Forced Induction Banned` };
    }

    // 2. Restrictions (Power Cap)
    if (engine.horsepower > regs.maxPower) {
        return { isValid: true, status: 'RESTRICTED', reason: `Power capped at ${regs.maxPower}HP` };
    }

    return { isValid: true, status: 'VALID', reason: 'Homologated' };
};

/**
 * Simulates a race event for the whole team (1 or 2 drivers).
 * Incorporates Engine Weight (Handling), Efficiency (Strategy), and Power.
 */
export const simulateRaceResult = (team: RacingTeam, category: RacingCategory, teamEngine: Engine | undefined): RaceResult => {
  const drivers = team.drivers;
  
  if (!drivers || drivers.length === 0) {
      return { results: [], totalPrestigeChange: -2, totalPrizeMoney: 0 };
  }

  // Fallback engine if none selected (Generic weak engine)
  const engine = teamEngine || {
      horsepower: 80,
      weight: 150,
      reliability: 50,
      fuelEfficiency: 50,
      induction: InductionType.NA,
      layout: CylinderLayout.I4
  } as Engine;

  const validation = validateEngineForCategory(engine, category);
  
  // If banned engine is somehow selected (exploit?), auto DNF
  if (validation.status === 'BANNED') {
       return {
          results: drivers.map(d => ({ driverId: d.id, driverName: d.name, position: 20, isCrash: true })),
          totalPrestigeChange: -5,
          totalPrizeMoney: 0
      };
  }

  // Calculate Effective HP (BOP)
  const effectiveHp = validation.status === 'RESTRICTED' ? category.regulations.maxPower : engine.horsepower;

  const results: IndividualRaceResult[] = [];
  let totalPrize = 0;
  let totalPrestige = 0;

  // 1. Calculate Score for each driver
  const driverScores = drivers.map(driver => {
      const { skill, aggression, experience } = driver.stats;
      
      // --- PHYSICS SIMULATION ---
      
      // Weight Penalty Logic
      // In heavy categories (Touring), engine weight matters less.
      // In light categories (Grand Prix), engine weight matters hugely.
      // We simulate this by checking weight relative to the category's MinWeight.
      const minWeight = category.regulations.minWeight || 1000;
      
      // Sensitivity: How much does 1kg of engine weight hurt?
      // Grand Prix (750kg): High sensitivity (0.15)
      // Touring (1200kg): Low sensitivity (0.05)
      const weightSensitivity = 100 / minWeight; 
      
      // Base engine ideal weight approx 100kg.
      // Penalty applies if engine is heavier than 100kg.
      // Ballast Effect: If engine is < 100kg, no huge bonus because you have to add ballast to meet MinWeight anyway.
      const excessWeight = Math.max(0, engine.weight - 100);
      const weightPenalty = excessWeight * weightSensitivity;
      
      // Strategy Bonus: Efficiency reduces pit stops
      // 50 is baseline. >50 adds consistency. <50 risks extra stops.
      const strategyMod = (engine.fuelEfficiency - 50) * 0.1;

      // Reliability Check
      const reliabilityCheck = Math.random() * 100;
      let isMechanicalFailure = false;
      if (reliabilityCheck > (engine.reliability + team.carReliability)/2 + 20) {
          if (Math.random() > 0.8) isMechanicalFailure = true; 
      }

      // Crash Logic (Driver Error)
      const danger = category.riskFactor || 5;
      const crashProbability = (aggression / (skill || 1)) * danger * 0.01; 
      const finalCrashChance = Math.max(0.01, crashProbability - (experience * 0.002));

      if (Math.random() < finalCrashChance || isMechanicalFailure) {
          return { driver, score: -1, isCrash: true };
      }

      // Performance Score Calculation
      // Chassis (50%) + Engine (30%) + Driver (20%)
      const chassisScore = team.carPerformance * 0.5;
      
      // Engine Score: Power vs Weight
      // 100HP = 10pts approx.
      const powerScore = (effectiveHp / 10) * 0.8; 
      
      const engineScore = powerScore - weightPenalty + strategyMod;

      const driverScore = skill * 0.3;
      const aggroBonus = aggression * 0.1;
      const variance = Math.random() * 10;
      
      const totalScore = chassisScore + engineScore + driverScore + aggroBonus + variance;
      return { driver, score: totalScore, isCrash: false };
  });

  // 2. Determine Positions
  driverScores.sort((a, b) => b.score - a.score); // Highest score first

  const usedPositions = new Set<number>();

  driverScores.forEach((entry) => {
      if (entry.isCrash) {
          results.push({
              driverId: entry.driver.id,
              driverName: entry.driver.name,
              position: 20,
              isCrash: true
          });
          totalPrestige -= 1; 
      } else {
          // Calculate theoretical position relative to difficulty
          const scoreDelta = entry.score - category.difficulty;
          let rawPosition = 10 - Math.round(scoreDelta / 2.5);
          let position = Math.max(1, Math.min(19, rawPosition));

          while (usedPositions.has(position) && position < 20) {
              position++;
          }
          usedPositions.add(position);

          // Rewards
          let prestigeChange = 0;
          let prizeMoney = 0;

          if (position === 1) {
            prestigeChange = category.prestigeReward;
            prizeMoney = category.weeklyCost * 6; // Buffed prize for winning
          } else if (position <= 3) {
            prestigeChange = Math.floor(category.prestigeReward / 2);
            prizeMoney = category.weeklyCost * 2.5;
          } else if (position <= 10) {
            prestigeChange = 1;
            prizeMoney = Math.floor(category.weeklyCost * 0.8);
          } else {
            prestigeChange = -1;
          }

          totalPrize += prizeMoney;
          totalPrestige += prestigeChange;

          results.push({
              driverId: entry.driver.id,
              driverName: entry.driver.name,
              position,
              isCrash: false
          });
      }
  });

  return {
    results,
    totalPrestigeChange: totalPrestige,
    totalPrizeMoney: totalPrize
  };
};