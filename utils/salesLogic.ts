
import { CarModel, MarketCategoryPrimary, WorldEvent } from '../types';

export interface SalesResult {
  unitsSold: number;
  revenue: number;
  grossProfit: number;
  stockRemaining: number;
}

/**
 * Calculates the "Fair" price for a car based on its cost and category.
 * Used by both the Sales Engine and the UI for feedback.
 */
export const calculateFairMarketValue = (car: CarModel, currentYear: number): number => {
    // 1. Base Margin by Category
    let marginMultiplier = 1.3; // Default
    switch (car.specs.marketPrimary) {
        case MarketCategoryPrimary.POPULAR: marginMultiplier = 1.20; break; // Low margin, high volume
        case MarketCategoryPrimary.INTERMEDIATE: marginMultiplier = 1.35; break;
        case MarketCategoryPrimary.LUXURY: marginMultiplier = 1.60; break; // High margin
        case MarketCategoryPrimary.SUPERCAR: marginMultiplier = 2.00; break; // Exclusive
    }

    let fmv = car.productionCost * marginMultiplier;

    // 2. Obsolescence Penalty
    // If the car design is older than 5 years, its fair value drops.
    const carYear = 1980 + Math.floor(car.launchDay / 365);
    const age = currentYear - carYear;
    
    if (age > 5) {
        fmv *= 0.85; // 15% drop
    }
    if (age > 10) {
        fmv *= 0.70; // 30% drop (Obsolete)
    }

    return Math.round(fmv);
};

export const calculateWeeklySales = (car: CarModel, brandPrestige: number, currentYear: number, event: WorldEvent | null): SalesResult => {
  // If no inventory or not released yet, no sales
  if (car.inventory <= 0 || !car.isReleased) {
      return { unitsSold: 0, revenue: 0, grossProfit: 0, stockRemaining: car.inventory };
  }

  // 1. Calculate Fair Market Value & Price Ratio
  const fairValue = calculateFairMarketValue(car, currentYear);
  const priceRatio = car.basePrice / fairValue;

  // --- THE WALL: Zero Sales Check ---
  // If price is double the fair value, nobody buys it. Period.
  if (priceRatio > 2.0) {
      return { unitsSold: 0, revenue: 0, grossProfit: 0, stockRemaining: car.inventory };
  }

  // 2. Base Demand from Quality (Review Score)
  // 0-100 Score.
  let baseDemandScore = car.finalReviewScore; 

  // --- QUALITY PENALTY ---
  // If the car is trash (Score < 30), sales are decimated.
  if (baseDemandScore < 30) {
      baseDemandScore = baseDemandScore / 10;
  }

  // 3. Prestige Multiplier
  // Prestige helps, but it cannot save a bad product (Linear scaling)
  // 1000 Prestige = 1.5x Multiplier (capped effect)
  const prestigeFactor = 1 + Math.min(0.5, (brandPrestige / 2000)); 
  
  // 4. Price Elasticity ( The Demand Curve )
  let priceDemandMultiplier = 1.0;

  if (priceRatio < 0.95) {
      // Bargain: High boost
      priceDemandMultiplier = 1.5 + ((1 - priceRatio) * 2); 
  } else if (priceRatio >= 0.95 && priceRatio <= 1.2) {
      // Fair Zone: Normal demand
      priceDemandMultiplier = 1.0;
  } else if (priceRatio > 1.2 && priceRatio <= 1.5) {
      // Expensive Zone: Rapid drop off
      priceDemandMultiplier = 0.5;
  } else if (priceRatio > 1.5) {
      // Abusive Zone: Almost zero
      priceDemandMultiplier = 0.1;
  }

  // 5. Calculate Weekly Volume
  // Base Volume Unit: 50 units (modified by category caps)
  let rawDemand = 50 * (baseDemandScore / 50) * prestigeFactor * priceDemandMultiplier;

  // --- REVIEW HIT BONUS ---
  // If the car is a masterpiece (>80), demand doubles.
  if (car.finalReviewScore > 80) {
      rawDemand *= 2.0;
  }

  // 6. Category Volume Caps & Adjustments
  // Realism: You can sell 10,000 Civics a week, but only 10 Ferraris.
  let volumeCap = 2000;
  
  switch (car.specs.marketPrimary) {
      case MarketCategoryPrimary.POPULAR: 
          volumeCap = 5000; 
          rawDemand *= 4; // Popular cars sell in higher numbers natively
          break;
      case MarketCategoryPrimary.INTERMEDIATE: 
          volumeCap = 2000; 
          rawDemand *= 2;
          break;
      case MarketCategoryPrimary.LUXURY: 
          volumeCap = 300; 
          rawDemand *= 0.5;
          break;
      case MarketCategoryPrimary.SUPERCAR: 
          volumeCap = 40; 
          rawDemand *= 0.1;
          break;
  }

  // Apply Volume Cap (Logarithmic soft cap)
  if (rawDemand > volumeCap) {
      rawDemand = volumeCap + Math.sqrt(rawDemand - volumeCap) * 5;
  }

  // 7. Event Modifiers
  if (event) {
      if (event.modifiers.demandMultiplier) {
          rawDemand *= event.modifiers.demandMultiplier;
      }
      if (event.modifiers.preferredEngineType) {
          const isEco = car.stats.fuelEconomy >= 30; // 30+ MPG is decent
          const isPerf = car.stats.acceleration <= 7.0;

          if (event.modifiers.preferredEngineType === 'economy') {
              rawDemand *= isEco ? 1.5 : 0.5; // Huge swing during Fuel Crisis
          } else if (event.modifiers.preferredEngineType === 'performance') {
              rawDemand *= isPerf ? 1.3 : 0.8;
          }
      }
  }

  // Random Market Fluctuation (+/- 10%)
  const marketFluctuation = 0.9 + (Math.random() * 0.2); 
  rawDemand *= marketFluctuation;

  // 8. Finalize Transaction
  const potentialSales = Math.floor(Math.max(0, rawDemand));
  const actualSales = Math.min(potentialSales, car.inventory);

  const revenue = actualSales * car.basePrice;
  const grossProfit = revenue - (actualSales * car.productionCost);

  return {
    unitsSold: actualSales,
    revenue: revenue,
    grossProfit: grossProfit, 
    stockRemaining: car.inventory - actualSales
  };
};
