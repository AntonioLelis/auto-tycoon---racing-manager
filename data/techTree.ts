import { Technology, EngineBlockType, InductionType } from '../types';

export const TECH_TREE: Technology[] = [
  {
    id: 'tech_alum_block',
    name: 'Aluminum Casting',
    description: 'Enables the production of Aluminum engine blocks. Lighter than Cast Iron, but more expensive.',
    cost: 150000,
    baseRpCost: 200,
    unlockYear: 1980,
    type: 'part',
    effect: {
      unlockBlock: EngineBlockType.ALUMINUM
    }
  },
  {
    id: 'tech_turbo_v1',
    name: 'Forced Induction I',
    description: 'Basic Turbocharging technology. Significantly increases power output at the cost of complexity and reliability.',
    cost: 300000,
    baseRpCost: 400,
    unlockYear: 1982,
    type: 'part',
    effect: {
      unlockInduction: InductionType.TURBO
    }
  },
  {
    id: 'tech_qa_process',
    name: 'Six Sigma Basics',
    description: 'Improved Quality Assurance processes that boost base reliability for all future engines.',
    cost: 100000,
    baseRpCost: 150,
    unlockYear: 1981,
    type: 'process',
    effect: {
      qualityBonus: 10
    }
  },
  {
    id: 'tech_adv_aero',
    name: 'Wind Tunnel Testing',
    description: 'Unlocks advanced aerodynamic chassis designs.',
    cost: 500000,
    baseRpCost: 600,
    unlockYear: 1985,
    type: 'process'
  },
  // --- New Safety & Tech ---
  {
    id: 'tech_power_steering',
    name: 'Hydraulic Systems',
    description: 'Enables Hydraulic Power Steering for improved comfort and handling.',
    cost: 200000,
    baseRpCost: 250,
    unlockYear: 1950,
    type: 'part'
  },
  {
    id: 'tech_abs',
    name: 'Anti-Lock Braking',
    description: 'Essential safety technology that prevents wheel lockup. Unlocks ABS and Traction Control.',
    cost: 450000,
    baseRpCost: 500,
    unlockYear: 1978,
    type: 'part'
  },
  {
    id: 'tech_airbags',
    name: 'SRS Airbags',
    description: 'Supplemental Restraint Systems. Unlocks Driver and Passenger airbags.',
    cost: 400000,
    baseRpCost: 450,
    unlockYear: 1980,
    type: 'part'
  },
  {
    id: 'tech_electronics',
    name: 'Digital Electronics',
    description: 'Advanced microprocessors for cars. Unlocks SatNav and advanced Engine Management.',
    cost: 600000,
    baseRpCost: 800,
    unlockYear: 1990,
    type: 'process'
  },
  {
    id: 'tech_adv_safety',
    name: 'Advanced Safety Cells',
    description: 'Unlocks Curtain Airbags, Pretensioners, and Electronic Stability Control.',
    cost: 800000,
    baseRpCost: 900,
    unlockYear: 1995,
    type: 'process'
  },
  {
    id: 'tech_eps',
    name: 'Electric Actuators',
    description: 'Unlocks Electric Power Steering (EPS).',
    cost: 500000,
    baseRpCost: 600,
    unlockYear: 1994,
    type: 'part'
  }
];
