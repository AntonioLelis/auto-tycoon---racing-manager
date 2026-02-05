import { CarModel, CarStats, MarketCategoryPrimary, MarketCategorySecondary, ReviewScore } from '../types';

// --- CONFIGURATION MATRICES ---

// 1. Attribute Weights: How important is each stat for this category? (Sum doesn't strictly need to be 1, we normalize later)
const CATEGORY_WEIGHTS: Record<MarketCategoryPrimary, { hp: number, eco: number, reliability: number, comfort: number, price: number, safety: number, adaptability: number }> = {
  [MarketCategoryPrimary.POPULAR]: {
      hp: 0.2,          // Power is irrelevant
      eco: 2.5,         // Efficiency is critical
      reliability: 2.0, // Must work
      comfort: 0.8,
      price: 3.0,       // Must be cheap
      safety: 1.0,
      adaptability: 0.5
  },
  [MarketCategoryPrimary.INTERMEDIATE]: {
      hp: 1.0,
      eco: 1.0,
      reliability: 1.5,
      comfort: 1.5,
      price: 1.5,
      safety: 1.5,
      adaptability: 0.5
  },
  [MarketCategoryPrimary.LUXURY]: {
      hp: 1.2,
      eco: 0.2,         // Rich people don't care about gas prices
      reliability: 1.0,
      comfort: 3.0,     // The most important thing
      price: 0.2,       // Price is less relevant (Veblen good)
      safety: 2.0,
      adaptability: 0.5
  },
  [MarketCategoryPrimary.SUPERCAR]: {
      hp: 4.0,          // POWER IS EVERYTHING
      eco: 0.0,         // Irrelevant
      reliability: 0.5, // Expected to break
      comfort: 0.2,     // Unimportant
      price: 0.1,       // Expensive is good
      safety: 0.5,
      adaptability: 0.0
  }
};

// 2. Category Targets: Multipliers applied to the "Base Year Stat" to find the Ideal Value.
// e.g. If Base HP for 1980 is 100... Popular Target is 0.6x (60hp), Supercar is 3.5x (350hp).
const CATEGORY_TARGETS: Record<MarketCategoryPrimary, { hp: number, eco: number, comfort: number, price: number }> = {
  [MarketCategoryPrimary.POPULAR]:      { hp: 0.6, eco: 1.5, comfort: 0.6, price: 0.6 },
  [MarketCategoryPrimary.INTERMEDIATE]: { hp: 1.0, eco: 1.0, comfort: 1.0, price: 1.2 },
  [MarketCategoryPrimary.LUXURY]:       { hp: 1.5, eco: 0.7, comfort: 2.0, price: 3.0 },
  [MarketCategoryPrimary.SUPERCAR]:     { hp: 3.5, eco: 0.4, comfort: 0.5, price: 6.0 }
};

// --- HELPER FUNCTIONS ---

/**
 * Calculates the "Standard" stats expected for a generic car in the given year.
 */
const getYearlyBaseStats = (year: number) => {
  // Linear progression models
  const age = Math.max(0, year - 1900);
  
  return {
      hp: 40 + (age * 1.5),           // 1950: 115hp, 2000: 190hp (Average fleet)
      price: 2000 + (age * 300),      // 1950: $17k, 2000: $32k (Adjusted inflation logic)
      eco: 10 + (age * 0.2),          // 1950: 20mpg, 2000: 30mpg (Slow progress)
      comfort: 10 + (age * 0.8),      // Technology improves comfort steadily
      safety: 5 + (age * 0.9)         // Safety improves steadily
  };
};

/**
 * Calculates a score (0-10) for a single attribute based on a target.
 * @param actual The car's actual stat
 * @param target The ideal stat for the category
 * @param higherIsBetter True for HP, False for Price (Lower price is better usually)
 */
const calculateStatScore = (actual: number, target: number, higherIsBetter: boolean): number => {
  if (target === 0) return 5;
  
  let ratio = actual / target;
  
  if (!higherIsBetter) {
      // For Price: If actual (20k) < target (30k), ratio is 0.66. We want high score.
      // Invert logic: 
      if (actual < target) {
          // Under budget = Bonus
          // e.g. 20k / 30k = 0.66. Score should be > 10? 
          // Let's model: 50% price = 10/10. 100% price = 7/10. 150% price = 2/10.
          return Math.min(10, 7 + (1 - ratio) * 5); 
      } else {
          // Over budget = Penalty
          return Math.max(0, 7 - (ratio - 1) * 10);
      }
  }

  // For HP/Comfort:
  if (ratio >= 1.0) {
      // Met or exceeded target. 
      // 100% match = 8/10. 120% match = 10/10.
      return Math.min(10, 8 + (ratio - 1) * 10);
  } else {
      // Below target.
      // 80% match = 6/10. 50% match = 2/10.
      return Math.max(0, 8 - (1 - ratio) * 10);
  }
};

// --- MAIN REVIEW LOGIC ---

export const calculateCarReviews = (car: CarModel): { reviews: ReviewScore[], finalScore: number } => {
  // 1. Setup Context
  const year = 1980 + Math.floor(car.launchDay / 365); // Approx year logic if not passed
  const baseStats = getYearlyBaseStats(year);
  const catTargets = CATEGORY_TARGETS[car.specs.marketPrimary];
  const catWeights = CATEGORY_WEIGHTS[car.specs.marketPrimary];

  const stats = car.stats;
  
  // 2. Calculate Targets for this specific car
  const targetHP = baseStats.hp * catTargets.hp;
  const targetPrice = baseStats.price * catTargets.price; // This is the "Expected" price point
  const targetEco = baseStats.eco * catTargets.eco;
  const targetComfort = baseStats.comfort * catTargets.comfort;

  // 3. Calculate Component Scores (0-10) based on Targets
  // Note: For Popular cars, TargetHP is low. If car meets that low target, scoreHP is high (10/10).
  const scoreHP = calculateStatScore(stats.acceleration < 5 ? 500 : (20 - stats.acceleration) * 15, targetHP, true); // Approx HP from accel
  // We use engine horsepower directly if available, but here we use car stats. 
  // Let's use acceleration as proxy for performance relative to era.
  // Actually, better to use the engine attached to car if we had it, but stats.acceleration is the result.
  // Let's invert acceleration to a "Speed Score" for comparison. 
  // Standard car 0-60: 10s. Target HP usually yields 10s. 
  // Score = 10 if Accel <= TargetAccel.
  
  // Revised Stat Scoring using direct values where possible
  // Using simplified logic: Value / Target * Scaling
  const perfScore = calculateStatScore(stats.topSpeed, baseStats.hp * catTargets.hp * 1.5, true); // Top speed proxy
  const ecoScore = calculateStatScore(stats.fuelEconomy, targetEco, true);
  const comfortScore = calculateStatScore(stats.comfort, targetComfort, true);
  const reliabilityScore = calculateStatScore(car.stats.safety, baseStats.safety, true); // Using safety as proxy for build quality/reliability in stats
  
  // Price Score:
  // Popular car: Target $15k. Car is $14k. Score: High.
  // Supercar: Target $100k. Car is $14k. Score: High (Cheap supercar!), but weight is low.
  const priceScore = calculateStatScore(car.basePrice, targetPrice, false);

  // 4. Calculate Final Weighted Market Score (0-100)
  // This is the "Objective" score of how well the car fits its category.
  
  let weightedSum = 0;
  let totalWeight = 0;

  // Apply weights
  weightedSum += perfScore * catWeights.hp;
  totalWeight += catWeights.hp;

  weightedSum += ecoScore * catWeights.eco;
  totalWeight += catWeights.eco;

  weightedSum += comfortScore * catWeights.comfort;
  totalWeight += catWeights.comfort;

  weightedSum += reliabilityScore * catWeights.reliability; // Safety/Reliability
  totalWeight += catWeights.reliability;

  weightedSum += priceScore * catWeights.price;
  totalWeight += catWeights.price;

  // Secondary Category Bonuses (Flat bonus to final score if criteria met)
  let nicheBonus = 0;
  if (car.specs.marketSecondary === MarketCategorySecondary.SPORT) {
      if (stats.handling > 60) nicheBonus += 5;
      if (stats.acceleration < 6.0) nicheBonus += 5;
  }
  if (car.specs.marketSecondary === MarketCategorySecondary.OFFROAD || car.specs.marketSecondary === MarketCategorySecondary.SUV) {
      if (stats.adaptability > 60) nicheBonus += 5;
      if (stats.adaptability > 80) nicheBonus += 5;
  }

  const finalScoreRaw = (weightedSum / totalWeight) * 10; // Scale to 0-100
  const finalScore = Math.min(100, Math.max(0, Math.round(finalScoreRaw + nicheBonus)));


  // 5. Generate Subjective Reviewer Scores (UI Flavor)
  // These remain biased by personality, ignoring category targets mostly.
  // Gearhead compares against GLOBAL performance standards, not "Popular" standards.
  
  // Frugal: Loves cheap, high MPG.
  let frugalReview = 0;
  frugalReview += Math.max(0, (40000 - car.basePrice) / 4000); // 10 pts if free, 0 pts if >40k
  frugalReview += (stats.fuelEconomy / 5); // 30mpg = +6pts
  frugalReview = Math.min(10, frugalReview);

  // Gearhead: Loves speed, accel.
  let gearheadReview = 0;
  gearheadReview += Math.max(0, (12 - stats.acceleration)); // < 2s = 10pts. > 12s = 0pts.
  gearheadReview += (stats.topSpeed - 100) / 20; // 300kmh = +10pts
  gearheadReview = Math.min(10, gearheadReview);

  // Family: Loves Safety, Comfort.
  let familyReview = 0;
  familyReview += stats.safety / 10; // 50 safety = 5pts
  familyReview += stats.comfort / 10;
  familyReview = Math.min(10, familyReview / 2 * 2); // Normalize roughly

  // Adventurer: Loves Adaptability.
  let adventurerReview = 0;
  adventurerReview += stats.adaptability / 10;
  if (car.specs.rideHeight > 60) adventurerReview += 2;
  adventurerReview = Math.min(10, adventurerReview);

  const reviews: ReviewScore[] = [
    { reviewerId: 'frugal', score: Number(frugalReview.toFixed(1)), comment: getComment('frugal', frugalReview) },
    { reviewerId: 'gearhead', score: Number(gearheadReview.toFixed(1)), comment: getComment('gearhead', gearheadReview) },
    { reviewerId: 'family', score: Number(familyReview.toFixed(1)), comment: getComment('family', familyReview) },
    { reviewerId: 'adventurer', score: Number(adventurerReview.toFixed(1)), comment: getComment('adventurer', adventurerReview) },
  ];

  return { reviews, finalScore };
};

const getComment = (type: string, score: number): string => {
    if (score >= 8) {
        if (type === 'frugal') return "An absolute steal! Incredible value.";
        if (type === 'gearhead') return "This thing rips! A true driver's car.";
        if (type === 'family') return "Safe, sensible, and soothing.";
        if (type === 'adventurer') return "Ready for the apocalypse.";
    } else if (score >= 5) {
        if (type === 'frugal') return "Reasonably priced for what you get.";
        if (type === 'gearhead') return "It's got some pep, but lacks soul.";
        if (type === 'family') return "Good enough for the daily commute.";
        if (type === 'adventurer') return "Handles gravel roads okay.";
    } else {
        if (type === 'frugal') return "Overpriced junk.";
        if (type === 'gearhead') return "My lawnmower is faster.";
        if (type === 'family') return "I wouldn't put my kids in this.";
        if (type === 'adventurer') return "Got stuck in a puddle.";
    }
    return "";
};
