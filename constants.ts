
import { 
  Engine, 
  Chassis, 
  EngineType, 
  EngineBlockType, 
  InductionType, 
  BodyStyle, 
  CarModel, 
  RacingTeam, 
  RacingCategory,
  CylinderLayout,
  FuelType,
  ValvetrainType,
  FactoryTier,
  LoanOffer,
  WorldEvent
} from './types';

export const INITIAL_MONEY = 5000000; // 5 Million starting capital
export const INITIAL_PRESTIGE = 10;
export const WEEKLY_OPEX = 15000; // Weekly operational expenses (Factory maintenance, salaries)
export const START_DATE_TIMESTAMP = new Date('1970-01-01').getTime();
export const MS_PER_TICK = 2000; // 1 real second = 1 game week at normal speed

export const GAME_LIMITS = {
    BANKRUPTCY: -10000000, // -10 Million (Fatal Limit)
    VICTORY_MONEY: 1000000000, // 1 Billion
    VICTORY_PRESTIGE: 1000
};

export const FACTORY_TIERS: FactoryTier[] = [
    { level: 1, name: "Backyard Garage", weeklyCapacityPU: 500, upgradeCost: 0, description: "Basic tooling. Good for small batches." },
    { level: 2, name: "Industrial Workshop", weeklyCapacityPU: 2000, upgradeCost: 500000, description: "Professional equipment. Enables consistent B2B work." },
    { level: 3, name: "Manufacturing Plant", weeklyCapacityPU: 10000, upgradeCost: 2000000, description: "Automated assembly lines. Mass production capable." },
    { level: 4, name: "Mega Factory", weeklyCapacityPU: 50000, upgradeCost: 10000000, description: "Regional manufacturing hub. High output." },
    { level: 5, name: "Giga Factory", weeklyCapacityPU: 200000, upgradeCost: 50000000, description: "Global production dominance." }
];

export const LOAN_OFFERS: LoanOffer[] = [
    { 
        id: 'loan_venture', 
        name: "Venture Capital", 
        amount: 10000000, 
        minPrestige: 10, 
        interestRate: 0.05, // 5%
        description: "High-risk capital for startups. Expects rapid returns." 
    },
    { 
        id: 'loan_investment', 
        name: "Investment Bank", 
        amount: 100000000, 
        minPrestige: 70, 
        interestRate: 0.035, // 3.5%
        description: "Standard corporate credit line. Balanced terms." 
    },
    { 
        id: 'loan_global', 
        name: "Global Fund", 
        amount: 500000000, 
        minPrestige: 200, 
        interestRate: 0.02, // 2%
        description: "Massive liquidity for industry leaders. Low rates." 
    }
];

export const PRODUCTION_CONSTANTS = {
    PU_BASE_ENGINE: 2,
    PU_BASE_CAR: 10,
    PU_MOD_V12: 1,
    PU_MOD_TURBO: 0.5,
    PU_MOD_SUV_LUXURY: 2,
    PU_MOD_COMPACT: -1
};

// --- EVENTS ---
export const WORLD_EVENTS: Omit<WorldEvent, 'dateStart'>[] = [
    {
        id: 'evt_boom',
        title: 'Economic Boom',
        description: 'Global markets are surging! Demand for all vehicles is up, but material costs are rising slightly.',
        type: 'ECONOMIC',
        durationWeeks: 24,
        modifiers: {
            demandMultiplier: 1.25,
            productionCostMultiplier: 1.1,
            interestRateOffset: 0.01 // Rates go up slightly
        }
    },
    {
        id: 'evt_recession',
        title: 'Global Recession',
        description: 'Consumer confidence hits a new low. Vehicle sales plummet across the board.',
        type: 'ECONOMIC',
        durationWeeks: 32,
        modifiers: {
            demandMultiplier: 0.7,
            interestRateOffset: -0.01 // Rates drop to encourage spending
        }
    },
    {
        id: 'evt_fuel_crisis',
        title: 'Oil Crisis',
        description: 'Fuel prices skyrocket. Buyers are desperate for fuel-efficient engines. Gas guzzlers are sitting on lots.',
        type: 'RESOURCE',
        durationWeeks: 20,
        modifiers: {
            demandMultiplier: 0.9, // General dip
            preferredEngineType: 'economy' // Logic handled in sales
        }
    },
    {
        id: 'evt_steel_shortage',
        title: 'Steel Shortage',
        description: 'Supply chain disruptions have caused steel prices to spike. Production costs increased.',
        type: 'RESOURCE',
        durationWeeks: 12,
        modifiers: {
            productionCostMultiplier: 1.3
        }
    },
    {
        id: 'evt_tech_bubble',
        title: 'Tech Bubble',
        description: 'Investors are pouring money into new ventures. Demand for expensive, high-tech cars is up.',
        type: 'ECONOMIC',
        durationWeeks: 16,
        modifiers: {
            demandMultiplier: 1.1,
            preferredEngineType: 'performance'
        }
    }
];

export const FLAVOR_NEWS = [
    "Competitor Zeus Motors announces new factory in Detroit.",
    "Govt considers new emissions regulations for next year.",
    "Local racing scene heating up with new amateur entries.",
    "Steel workers union threatens strike next month.",
    "Market analysts predict stable growth for the automotive sector.",
    "Rumors of a revolutionary new engine technology from Japan.",
    "Oil prices remain stable for now.",
    "Consumer report praises high safety standards in modern cars.",
    "Global logistics facing minor delays due to weather.",
    "Celebrity endorsees driving sales for luxury convertibles."
];

export const RACING_CATEGORIES: RacingCategory[] = [
  {
    id: 'rc_amateur',
    name: 'Sunday Cup',
    description: 'Local street racing legalised. Low entry cost, focusing on 0-100 acceleration. Perfect for testing modified production engines.',
    tier: 3,
    minPrestige: 0,
    entryFee: 5000, // Cheap
    weeklyCost: 500,
    difficulty: 15,
    riskFactor: 2, // Low risk
    prestigeReward: 3,
    regulations: {
        maxDisplacement: 10000, // Unlimited (Run a V8 if you want)
        maxPower: 350, // Cap is low, so big engines are wasteful
        allowedCylinders: [3,4,5,6,8],
        forcedInductionAllowed: true,
        minWeight: 1000
    }
  },
  {
    id: 'rc_touring',
    name: 'National Touring',
    description: 'The roaring thunder of Stock Cars. High contact, heavy chassis, and reliability tests. Favors big torque and sturdy blocks.',
    tier: 2,
    minPrestige: 250,
    entryFee: 200000, // Mid-tier
    weeklyCost: 20000,
    difficulty: 50,
    riskFactor: 5, // Medium risk
    prestigeReward: 15,
    regulations: {
        maxDisplacement: 6000, // 6.0L Limit
        maxPower: 600,
        allowedCylinders: [6, 8, 10], // V6/V8/V10
        forcedInductionAllowed: true,
        minWeight: 1200 // Heavy cars = Engine weight matters less
    }
  },
  {
    id: 'rc_grand',
    name: 'Global Grand Prix',
    description: 'The absolute pinnacle. Cars are featherweight. Engines must be small (3.0L) yet produce massive power. Technology race.',
    tier: 1,
    minPrestige: 1500,
    entryFee: 50000000, // Elite
    weeklyCost: 500000,
    difficulty: 90,
    riskFactor: 9, // High risk
    prestigeReward: 100,
    regulations: {
        maxDisplacement: 3000, // The choke point: 3.0L Limit
        maxPower: 1000, // Physics limit
        allowedCylinders: [6, 8, 10, 12],
        forcedInductionAllowed: true, // Needed to hit 1000hp with 3.0L
        minWeight: 750 // Ultralight
    }
  }
];

export const INITIAL_ENGINES: Engine[] = [];

export const INITIAL_CHASSIS: Chassis[] = [
  {
    id: 'chs_001',
    name: 'Boxy Hatch',
    type: BodyStyle.HATCHBACK,
    weight: 900,
    aerodynamics: 30, // 80s aero
    engineBaySize: 5, // Fits I4
    productionCost: 1000,
  },
  {
    id: 'chs_002',
    name: 'Family Sedan',
    type: BodyStyle.SEDAN,
    weight: 1400,
    aerodynamics: 40,
    engineBaySize: 7, // Fits I4, V6
    productionCost: 1500,
  }
];

export const INITIAL_RACING_TEAM: RacingTeam = {
  name: 'Factory Works Team',
  activeCategoryId: null,
  selectedEngineId: null,
  monthlyBudget: 0,
  drivers: [], // 2-Slot System
  driver: null, // Deprecated
  carPerformance: 10,
  carReliability: 50,
  lastResult: null,
  history: []
};

export const INITIAL_CARS: CarModel[] = [];
