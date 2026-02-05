
// Data Models
export enum EngineType {
  // Deprecated generic types, mapping to new specific layouts
  I4 = 'Inline-4', 
  V6 = 'V6',
  V8 = 'V8',
  ELECTRIC = 'Electric',
}

export enum CylinderLayout {
  I3 = 'Inline-3',
  I4 = 'Inline-4',
  I6 = 'Inline-6',
  V6 = 'V6',
  V8 = 'V8',
  V10 = 'V10',
  V12 = 'V12'
}

export enum FuelType {
  GASOLINE = 'Gasoline',
  DIESEL = 'Diesel',
  FLEX = 'Flex (Eth/Gas)'
}

export enum ValvetrainType {
  OHV = 'OHV (Pushrod)',
  SOHC = 'SOHC',
  DOHC = 'DOHC'
}

export enum EngineBlockType {
  CAST_IRON = 'Cast Iron',
  ALUMINUM = 'Aluminum',
}

export enum InductionType {
  NA = 'Naturally Aspirated',
  TURBO = 'Turbocharged',
}

export enum BodyStyle {
  SEDAN = 'Sedan',
  HATCHBACK = 'Hatchback',
  COUPE = 'Coupe',
  SUV = 'SUV',
  PICKUP = 'Pickup',
  VAN = 'Van',
  SPORTS = 'Sports'
}

export enum ChassisFrameType {
  LADDER = 'Ladder Frame',
  MONOCOQUE = 'Monocoque',
  SPACEFRAME = 'Spaceframe'
}

export enum ChassisMaterial {
  STEEL = 'Steel',
  GALVANIZED = 'Galvanized Steel',
  ALUMINUM = 'Aluminum',
  CARBON = 'Carbon Fiber'
}

export enum DesignEra {
  BOX_70S = '1970s Box',
  AERO_90S = '1990s Aero',
  MODERN_10S = 'Modern Sharp'
}

// --- NEW MARKET SEGMENTATION ---
export enum MarketCategoryPrimary {
  POPULAR = 'Popular / Economy',
  INTERMEDIATE = 'Intermediate / Executive',
  LUXURY = 'Luxury / Premium',
  SUPERCAR = 'Supercar / Hypercar'
}

export enum MarketCategorySecondary {
  NONE = 'Standard',
  SUV = 'SUV / Utility',
  OFFROAD = 'Off-Road',
  SPORT = 'Sport'
}

export interface ReviewScore {
  reviewerId: 'frugal' | 'gearhead' | 'family' | 'adventurer';
  score: number; // 0-10
  comment: string;
}

// New Data Structures for Cosmetics
export interface BodyTypeData {
  id: string;
  name: string;
  baseDrag: number; // Lower is better (e.g. 0.30 - 0.50)
  baseWeight: number;
  type: 'Passenger' | 'Sport' | 'Utility' | 'Luxury';
  unlockYear: number;
  baseCost: number;
}

export interface CosmeticPart {
  id: string;
  name: string;
  costMod: number;
  dragMod: number; // Change to Drag Coefficient (negative is better for speed)
  handlingMod: number; // Downforce or stability bonus
  weightMod: number;
  prestigeMod: number;
  unlockYear: number;
}

export interface CosmeticCategory {
  id: string;
  name: string;
  parts: CosmeticPart[];
}

// New Data Structures for Functional Features (Trim)
export interface CarFeature {
  id: string;
  name: string;
  description: string;
  unlockYear: number;
  techIdRequirement?: string; // If null, unlocks by year only
  cost: number;
  weight: number;
  safetyMod: number;
  comfortMod: number;
  handlingMod: number; // Drivability
  reliabilityMod: number;
}

export interface FeatureCategory {
  id: string;
  name: string;
  features: CarFeature[];
}

// New Data Structures for Running Gear
export interface RunningGearPart {
  id: string;
  name: string;
  description: string;
  unlockYear: number;
  cost: number;
  weight: number;
  comfortMod: number;
  sportinessMod: number; // Handling bonus
  adaptabilityMod: number; // Off-road capability
  tractionBonus?: number; // 0-100% efficiency
}

export interface LegacyChassis {
  id: string;
  name: string;
  type: string; 
  weight: number; 
  aerodynamics: number; 
  engineBaySize: number; 
  productionCost: number;
}

export type Chassis = LegacyChassis; // Alias for backward compatibility

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number;
  baseRpCost: number; // Research Points Cost
  unlockYear: number;
  type: 'part' | 'process' | 'chassis';
  effect?: {
    unlockBlock?: EngineBlockType;
    unlockInduction?: InductionType;
    unlockChassis?: string; // chassis ID
    qualityBonus?: number;
  };
}

export interface DynoPoint {
  rpm: number;
  torque: number;
  hp: number;
}

export interface Engine {
  id: string;
  name: string;
  
  // Specs
  layout: CylinderLayout;
  type: EngineType; // Kept for legacy compatibility
  fuelType: FuelType;
  valvetrain: ValvetrainType;
  blockType: EngineBlockType;
  induction: InductionType;
  
  // Dimensions
  displacement: number; // cc
  bore: number; // mm
  stroke: number; // mm

  // Performance
  horsepower: number;
  torque: number; // Nm
  redline: number; // RPM
  weight: number; // kg
  reliability: number; // 0-100
  fuelEfficiency: number; // 0-100 Score (higher is better)
  productionCost: number;
  
  // Supplier Logic
  isSupplier?: boolean;
  unlockYear?: number; // For supplier engines
}

export interface CarStats {
  acceleration: number; // 0-60 mph in seconds
  topSpeed: number; // km/h
  handling: number; // 0-100
  comfort: number; // 0-100
  safety: number; // 0-100
  fuelEconomy: number; // L/100km approx
  adaptability: number; // 0-100 (Offroad/Utility Score)
}

export interface CarDesignConfiguration {
  marketPrimary: MarketCategoryPrimary;
  marketSecondary: MarketCategorySecondary;

  frameType: ChassisFrameType;
  frameMaterial: ChassisMaterial;
  wheelbase: number; // cm
  engineBaySize: number; // 0-100 scale
  
  // Running Gear (New)
  drivetrainId: string;
  suspensionId: string;
  tireId: string;
  rideHeight: number; // 0 (Low/Sport) to 100 (High/Offroad)

  // Updated Body Config
  bodyTypeId: string;
  cosmetics: Record<string, string>; // e.g., { headlights: 'hl_popup', spoiler: 'sp_none' }
  
  // New Functional Config
  features: Record<string, string>; // e.g. { seatbelts: 'sb_3point', steering: 'str_hydro' }

  designEra: DesignEra;
  sliderInterior: number; // Keeping for base calculation, modified by 'features'
  sliderSuspension: number;
}

// --- NEW PRODUCTION STATE INTERFACE ---
export interface CarProductionState {
    isActive: boolean;
    totalBatchTarget: number; // Total units ordered
    unitsProduced: number; // Units finished so far
    weeklyRate: number; // Throughput: Units per week
    puPerUnit: number; // Cached PU cost
}

export interface CarModel {
  id: string;
  name: string;
  engineId: string;
  isOutsourcedEngine?: boolean; // If true, engine PU is 0
  specs: CarDesignConfiguration;
  chassisName: string; 
  
  // Financials
  basePrice: number;
  productionCost: number;
  
  // Market & Sales (New Finite Logic)
  prestigeValue: number;
  marketAppeal: number; // 0-100 (Legacy)
  stats: CarStats;
  
  // Inventory System
  inventory: number; // Current stock (Available for sale)
  
  // Active Production (Throughput System)
  productionState?: CarProductionState;

  // Legacy Fields (Deprecated but kept for compat if needed, prefer productionState)
  batchSize: number; 
  launchDay: number; 
  isReleased: boolean; 

  // Review System
  reviews: ReviewScore[];
  finalReviewScore: number; // 0-100

  totalUnitsSold: number;
}

// --- RACING REGULATIONS ---
export interface RacingRegulations {
    maxDisplacement: number; // cc
    maxPower: number; // HP (Hard or Soft cap logic)
    allowedCylinders: number[]; // e.g. [6, 8, 10]
    forcedInductionAllowed: boolean;
    minWeight?: number; // Not heavily used yet, but good for future
}

export interface RacingCategory {
  id: string;
  name: string;
  tier: number; // 1 = High, 3 = Low
  minPrestige: number; // Requirement to unlock
  entryFee: number;
  weeklyCost: number;
  difficulty: number; // 0-100
  riskFactor: number; // 1-10 (How dangerous the tracks are)
  prestigeReward: number; // Prestige gained for 1st place
  description: string;
  
  regulations: RacingRegulations; // Technical Rules
}

export interface IndividualRaceResult {
  driverId: string;
  driverName: string;
  position: number;
  isCrash: boolean;
}

export interface RaceResult {
  totalPrizeMoney: number;
  totalPrestigeChange: number;
  results: IndividualRaceResult[];
}

export interface Driver {
  id: string;
  name: string;
  age: number;
  salary: number; // Monthly cost
  contractEndYear: number;
  stats: {
    skill: number; // 0-100 (Base speed/consistency)
    talent: number; // 0-100 (Hard cap for skill)
    experience: number; // 0-100 (Helps setup and consistency)
    aggression: number; // 0-100 (The "Insanity" factor)
  };
  marketValue: number; // For hiring fee
}

export interface RacingTeam {
  name: string;
  activeCategoryId: string | null;
  selectedEngineId: string | null; // Specific engine allocated to race cars
  
  // New Manager Logic (2 Slots)
  drivers: Driver[]; 
  driver: Driver | null; // Deprecated, kept for type safety during migration if needed, but unused
  
  monthlyBudget: number; // Replaces manual investment. 0-1M/month
  
  // Car Stats
  carPerformance: number; // 0-100 (Chassis & Aero)
  carReliability: number; // 0-100
  
  lastResult: RaceResult | null;
  history: number[]; // Array of past positions (Best finish of the week)
}

export interface ClientCompany {
  id: string;
  name: string;
  description: string;
  qualityPreference: 'economy' | 'performance' | 'reliability';
}

export interface Contract {
  id: string;
  clientName: string;
  clientId: string;
  engineId: string; // The engine they want to buy
  totalQuantity: number;
  deliveredQuantity: number;
  pricePerUnit: number;
  durationWeeks: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: number; // date timestamp
}

export interface HistoryEntry {
  dateLabel: string; // e.g., "1980-Jan"
  money: number;
  salesVolume: number; // Total units sold in that period
  prestige: number;
}

export interface EngineDesignParams {
  name: string;
  layout: CylinderLayout;
  blockType: EngineBlockType;
  fuelType: FuelType;
  valvetrain: ValvetrainType;
  induction: InductionType;
  bore: number; // mm
  stroke: number; // mm
  sliderQuality: number; // 0-100
}

export interface GameNotification {
  id: string;
  text: string;
  date: string;
  type: 'info' | 'alert' | 'success';
}

// --- FACTORY & PRODUCTION TYPES ---
export interface FactoryTier {
    level: number;
    name: string;
    weeklyCapacityPU: number; // Production Units per week
    upgradeCost: number;
    description: string;
}

export interface FactoryState {
    level: number;
}

// --- FINANCIAL TYPES ---
export interface LoanOffer {
    id: string;
    name: string;
    amount: number;
    minPrestige: number;
    interestRate: number; // 0.05 = 5%
    description: string;
}

export interface Loan {
    id: string;
    tierId: string; // The ID of the offer this loan came from
    name: string;
    principal: number;
    interestRate: number;
    dateTaken: number;
}

// --- WORLD EVENTS ---
export type EventType = 'ECONOMIC' | 'POLITICAL' | 'AUTOMOTIVE' | 'RESOURCE';

export interface WorldEvent {
    id: string;
    title: string;
    description: string;
    type: EventType;
    dateStart: number;
    durationWeeks: number;
    modifiers: {
        demandMultiplier?: number; // 1.0 = normal, 0.7 = -30%
        productionCostMultiplier?: number; // 1.0 = normal, 1.2 = +20%
        interestRateOffset?: number; // e.g., +0.02 for +2%
        preferredEngineType?: 'economy' | 'performance'; // 'economy' boosts efficient cars
    };
}

// --- TUTORIAL / QUEST SYSTEM ---
export interface TutorialState {
    isActive: boolean; // Is the tutorial system running?
    currentStep: number; // 0=Welcome, 1=Engine, 2=Car, 3=Prod, 4=Sales, 5=Complete
    isCompleted: boolean;
}

export interface GameState {
  money: number;
  researchPoints: number; // New Currency
  date: number; // Days since start
  year: number; // Current game year (Calculated)
  brandPrestige: number; // 0-1000
  isPaused: boolean;
  gameSpeed: number; // 0 = Paused, 1 = Normal, 2 = Fast
  lastWeeklyProfit: number; // Financial feedback for UI
  
  // End Game State
  endGameState: 'playing' | 'victory' | 'defeat';
  hasWon: boolean;

  // Production Line State
  factory: FactoryState;
  productionLineBusyUntil: number; // Deprecated but kept for compatibility logic if needed
  
  // Inventory/Assets
  unlockedEngines: Engine[];
  unlockedChassis: Chassis[];
  developedCars: CarModel[];
  
  // Racing Manager
  racingTeam: RacingTeam;
  freeAgents: Driver[]; // Driver Market

  // Research
  unlockedTechIds: string[];

  // B2B
  contractOffers: Contract[];
  activeContracts: Contract[];

  // Financials
  activeLoans: Loan[];
  totalInterestPaid: number;

  // World State
  activeEvent: WorldEvent | null;

  // Analytics
  historyLog: HistoryEntry[];
  notifications: GameNotification[];

  // Tutorial
  tutorial: TutorialState;
}

export interface GameContextType extends GameState {
  tick: () => void;
  togglePause: () => void;
  setGameSpeed: (speed: number) => void;
  startProduction: (car: CarModel, batchSize: number, productionWeeks: number) => void;
  liquidateStock: (carId: string) => void;
  developEngine: (engine: Engine, developmentCost: number) => void;
  joinRacingCategory: (categoryId: string) => void;
  
  // Updated Racing Actions
  setRacingBudget: (amount: number) => void;
  hireDriver: (driverId: string) => void;
  fireDriver: (driverId: string) => void;
  selectRaceEngine: (engineId: string) => void;

  researchTech: (techId: string) => void;
  calculateTechCost: (tech: Technology) => { money: number, rp: number, multiplier: number }; 
  gainResearchPoints: (amount: number) => void; 
  acceptContract: (contractId: string) => void;
  rejectContract: (contractId: string) => void;
  debugForceYear: () => void; 
  
  // Factory Management
  upgradeFactory: () => void;
  getUnitEffort: (item: Engine | CarModel) => number;
  calculateCurrentLoad: () => { 
      used: number, 
      capacity: number, 
      breakdown: { cars: number, b2b: number } 
  };

  // Financial Actions
  takeLoan: (offerId: string) => void;
  repayLoan: (loanId: string) => void;
  currentDebt: number;
  
  // Persistence
  saveGame: () => void;
  resetGame: () => void;
  exportSave: () => string;
  importSave: (jsonString: string) => boolean;

  // Tutorial Actions
  startTutorial: () => void; // Advances from step 0 (Welcome) to 1
  completeTutorial: () => void; // Finalizes step 5

  // End Game Actions
  continuePlaying: () => void;
}
