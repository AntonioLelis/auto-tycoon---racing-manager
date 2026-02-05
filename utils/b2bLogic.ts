import { Engine, Contract, ClientCompany, InductionType, EngineBlockType, ValvetrainType } from '../types';
import { CLIENT_COMPANIES } from '../data/companies';

/**
 * Determines if an engine is considered "High Tech" for the era.
 * High tech engines command higher profit margins.
 */
const isHighTech = (engine: Engine): boolean => {
    let techScore = 0;
    if (engine.induction === InductionType.TURBO) techScore++;
    if (engine.blockType === EngineBlockType.ALUMINUM) techScore++;
    if (engine.valvetrain === ValvetrainType.DOHC) techScore++;
    
    // If it has at least 2 modern features, it's high tech
    return techScore >= 2;
};

export const generateContractOffer = (engines: Engine[], currentDate: number): Contract | null => {
  if (engines.length === 0) return null;

  // 1. Pick a random company
  const company = CLIENT_COMPANIES[Math.floor(Math.random() * CLIENT_COMPANIES.length)];

  // 2. Pick a random engine
  const engine = engines[Math.floor(Math.random() * engines.length)];

  // 3. Determine Volume and Duration
  // Contracts are now hefty commitments.
  // Duration: 10 to 40 weeks.
  const durationWeeks = Math.floor(Math.random() * 30) + 10; 
  
  // Volume: 50 to 500 units/week depending on engine cost
  // Cheaper engines = higher volume demands
  let baseVolume = 300;
  if (engine.productionCost > 2000) baseVolume = 100;
  if (engine.productionCost > 5000) baseVolume = 30;

  const volumeVariation = 0.5 + Math.random(); // 0.5x to 1.5x
  const weeklyVolume = Math.floor(baseVolume * volumeVariation);
  const totalQuantity = weeklyVolume * durationWeeks;

  // 4. Calculate Price (The Nerf)
  // Old Logic: Production Cost + Random huge markup
  // New Logic: Tighter margins. 
  // Base Markup: 1.10 (10%) to 1.35 (35%)
  let markup = 1.1 + (Math.random() * 0.25);

  // Tech Bonus: High tech engines get better margins (up to ~50%)
  if (isHighTech(engine)) {
      markup += 0.15;
  }

  // Preference Bonus: If engine matches company desire perfectly, small bonus
  if (company.qualityPreference === 'performance' && engine.horsepower > 200) markup += 0.05;
  if (company.qualityPreference === 'economy' && engine.fuelEfficiency > 60) markup += 0.05;

  const pricePerUnit = Math.floor(engine.productionCost * markup);

  return {
    id: `contract_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    clientId: company.id,
    clientName: company.name,
    engineId: engine.id,
    totalQuantity,
    deliveredQuantity: 0,
    pricePerUnit,
    durationWeeks,
    status: 'pending',
    createdAt: currentDate
  };
};