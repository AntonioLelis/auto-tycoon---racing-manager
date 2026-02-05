import { RunningGearPart } from '../types';

export const DRIVETRAINS: RunningGearPart[] = [
  {
    id: 'drive_fwd',
    name: 'FWD (Front Wheel Drive)',
    description: 'Cost-effective and space-saving. Prone to understeer.',
    unlockYear: 1960,
    cost: 500,
    weight: 100,
    comfortMod: 5,
    sportinessMod: -5,
    adaptabilityMod: 0,
    tractionBonus: 0.75
  },
  {
    id: 'drive_rwd',
    name: 'RWD (Rear Wheel Drive)',
    description: 'Classic layout. Excellent weight balance and acceleration.',
    unlockYear: 1900,
    cost: 800,
    weight: 150,
    comfortMod: 5,
    sportinessMod: 15,
    adaptabilityMod: 0,
    tractionBonus: 0.85
  },
  {
    id: 'drive_awd',
    name: 'AWD (All Wheel Drive)',
    description: 'Computer-controlled grip for all conditions. Heavy.',
    unlockYear: 1980,
    cost: 1500,
    weight: 220,
    comfortMod: 10,
    sportinessMod: 10,
    adaptabilityMod: 15,
    tractionBonus: 0.95
  },
  {
    id: 'drive_4x4',
    name: '4x4 (Off-Road)',
    description: 'Heavy duty transfer case with low range gear. Unstoppable.',
    unlockYear: 1940,
    cost: 1200,
    weight: 300,
    comfortMod: -10,
    sportinessMod: -20,
    adaptabilityMod: 40,
    tractionBonus: 0.90
  }
];

export const SUSPENSIONS: RunningGearPart[] = [
  {
    id: 'susp_leaf',
    name: 'Leaf Springs',
    description: 'Simple, robust, and can carry heavy loads. Bumpy ride.',
    unlockYear: 1900,
    cost: 200,
    weight: 80,
    comfortMod: -15,
    sportinessMod: -10,
    adaptabilityMod: 20
  },
  {
    id: 'susp_coil',
    name: 'MacPherson / Coil',
    description: 'Standard passenger car suspension. Good balance.',
    unlockYear: 1950,
    cost: 500,
    weight: 60,
    comfortMod: 5,
    sportinessMod: 5,
    adaptabilityMod: 5
  },
  {
    id: 'susp_multilink',
    name: 'Multi-Link',
    description: 'Complex geometry for superior handling and comfort.',
    unlockYear: 1985,
    cost: 1000,
    weight: 90,
    comfortMod: 20,
    sportinessMod: 25,
    adaptabilityMod: -5
  },
  {
    id: 'susp_air',
    name: 'Air Suspension',
    description: 'Adjustable ride height. Ultimate comfort and versatility.',
    unlockYear: 1990,
    cost: 2000,
    weight: 120,
    comfortMod: 30,
    sportinessMod: 5,
    adaptabilityMod: 15
  }
];

export const TIRES: RunningGearPart[] = [
  {
    id: 'tire_eco',
    name: 'Eco / Hard Compound',
    description: 'Long lasting and cheap. Low grip.',
    unlockYear: 1900,
    cost: 200,
    weight: 0,
    comfortMod: -5,
    sportinessMod: -10,
    adaptabilityMod: 0
  },
  {
    id: 'tire_sport',
    name: 'Sport / Soft Compound',
    description: 'Maximum grip on tarmac. Useless on dirt.',
    unlockYear: 1960,
    cost: 600,
    weight: 0,
    comfortMod: 0,
    sportinessMod: 30,
    adaptabilityMod: -20
  },
  {
    id: 'tire_all_terrain',
    name: 'All-Terrain',
    description: 'Balanced for road and light trails.',
    unlockYear: 1970,
    cost: 400,
    weight: 10,
    comfortMod: 0,
    sportinessMod: -5,
    adaptabilityMod: 20
  },
  {
    id: 'tire_mud',
    name: 'Mud-Terrain',
    description: 'Aggressive tread for deep mud and rocks. Noisy.',
    unlockYear: 1950,
    cost: 500,
    weight: 20,
    comfortMod: -15,
    sportinessMod: -20,
    adaptabilityMod: 50
  }
];
