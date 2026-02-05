import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { GameContextType, GameState, CarModel, Engine, Chassis, RacingTeam, RacingCategory, Contract, HistoryEntry, Technology, Driver, GameNotification, FactoryState, TutorialState, Loan, WorldEvent } from '../types';
import { calculateWeeklySales } from '../utils/salesLogic';
import { calculateCarReviews } from '../utils/reviewLogic';
import { simulateRaceResult } from '../utils/racingLogic';
import { generateContractOffer } from '../utils/b2bLogic';
import { calculateProductionEffort } from '../utils/productionLogic';
import { generateRandomDriver, processDriverYearlyAging } from '../utils/driverLogic';
import { formatDate, formatMoney } from '../utils/formatters';
import { TECH_TREE } from '../data/techTree';
import { 
  INITIAL_MONEY, 
  INITIAL_PRESTIGE, 
  INITIAL_ENGINES, 
  INITIAL_CHASSIS, 
  INITIAL_RACING_TEAM, 
  INITIAL_CARS, 
  WEEKLY_OPEX,
  MS_PER_TICK,
  RACING_CATEGORIES,
  START_DATE_TIMESTAMP,
  FACTORY_TIERS,
  LOAN_OFFERS,
  WORLD_EVENTS,
  GAME_LIMITS
} from '../constants';

const GameContext = createContext<GameContextType | undefined>(undefined);
const SAVE_KEY = 'auto_tycoon_save_v2';
const SAVE_VERSION = "1.0";

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // --- Game State ---
  const [money, setMoney] = useState<number>(INITIAL_MONEY);
  const [researchPoints, setResearchPoints] = useState<number>(200); 
  const [date, setDate] = useState<number>(0); 
  const [brandPrestige, setBrandPrestige] = useState<number>(INITIAL_PRESTIGE);
  const [isPaused, setIsPaused] = useState<boolean>(true); 
  const [gameSpeed, setGameSpeed] = useState<number>(1); // 1 = Normal (2s), 2 = Fast (0.5s)
  const [lastWeeklyProfit, setLastWeeklyProfit] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false); 
  
  // End Game State
  const [endGameState, setEndGameState] = useState<'playing' | 'victory' | 'defeat'>('playing');
  const [hasWon, setHasWon] = useState(false);

  // Financial State
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0);
  // Virtual field for backward compatibility or simple display logic, derived from activeLoans
  const currentDebt = activeLoans.reduce((acc, loan) => acc + loan.principal, 0);

  // Production State
  const [factory, setFactory] = useState<FactoryState>({ level: 1 });
  const [productionLineBusyUntil, setProductionLineBusyUntil] = useState<number>(0); // Deprecated

  // World State
  const [activeEvent, setActiveEvent] = useState<WorldEvent | null>(null);

  // Calculated Year
  const startDate = new Date(START_DATE_TIMESTAMP);
  const year = startDate.getFullYear() + Math.floor(date / 365);

  // --- Inventory/Assets State ---
  const [unlockedEngines, setUnlockedEngines] = useState<Engine[]>(INITIAL_ENGINES);
  const [unlockedChassis, setUnlockedChassis] = useState<Chassis[]>(INITIAL_CHASSIS);
  const [developedCars, setDevelopedCars] = useState<CarModel[]>(INITIAL_CARS);
  
  // --- Racing Manager State ---
  const [racingTeam, setRacingTeam] = useState<RacingTeam>(INITIAL_RACING_TEAM);
  const [freeAgents, setFreeAgents] = useState<Driver[]>([]);

  // --- Research State ---
  const [unlockedTechIds, setUnlockedTechIds] = useState<string[]>([]);

  // --- B2B State ---
  const [contractOffers, setContractOffers] = useState<Contract[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);

  // --- Analytics State ---
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  // --- Tutorial State ---
  const [tutorial, setTutorial] = useState<TutorialState>({
      isActive: true,
      currentStep: 0,
      isCompleted: false
  });

  // --- Safety Ref for Reset ---
  const isResetting = useRef(false);

  // --- Helpers ---
  const addNotification = useCallback((text: string, type: 'info' | 'alert' | 'success' = 'info') => {
      setNotifications(prev => [{
          id: `notif_${Date.now()}_${Math.random()}`,
          text,
          date: formatDate(date),
          type
      }, ...prev].slice(0, 20)); // Keep last 20
  }, [date]);

  // --- Tutorial Watchdog (Logic to Advance Steps) ---
  useEffect(() => {
      if (!tutorial.isActive || tutorial.isCompleted) return;

      setTutorial(prev => {
          // Do not mutate if logic hasn't changed to avoid loops
          let nextStep = prev.currentStep;

          // Step 0: Welcome Modal (Advanced manually by user via startTutorial)
          
          // Step 1: Design Engine
          if (prev.currentStep === 1 && unlockedEngines.length > 0) {
              nextStep = 2;
          }
          
          // Step 2: Design Car
          else if (prev.currentStep === 2 && developedCars.length > 0) {
              nextStep = 3;
          }

          // Step 3: Start Production / Inventory
          // We check if any car has inventory > 0 (meaning production finished at least 1 unit)
          else if (prev.currentStep === 3) {
              const hasProduction = developedCars.some(c => c.inventory > 0);
              if (hasProduction) nextStep = 4;
          }

          // Step 4: First Sale
          else if (prev.currentStep === 4) {
              const hasSales = developedCars.some(c => c.totalUnitsSold > 0);
              if (hasSales) nextStep = 5; // Ready to complete
          }

          if (nextStep !== prev.currentStep) {
              return { ...prev, currentStep: nextStep };
          }
          return prev;
      });
  }, [unlockedEngines, developedCars, tutorial.isActive, tutorial.isCompleted, tutorial.currentStep]);

  // --- Factory Capacity Logic ---
  const calculateCurrentLoad = useCallback(() => {
      const currentTier = FACTORY_TIERS.find(t => t.level === factory.level) || FACTORY_TIERS[0];
      const capacity = currentTier.weeklyCapacityPU;
      
      let loadCars = 0;
      let loadB2B = 0;

      // 1. Calculate Active Car Production (Throughput Based)
      developedCars.forEach(car => {
          if (car.productionState && car.productionState.isActive) {
              loadCars += car.productionState.weeklyRate * car.productionState.puPerUnit;
          }
      });

      // 2. Calculate Active B2B Contracts
      activeContracts.forEach(contract => {
          const weeklyTarget = Math.ceil(contract.totalQuantity / contract.durationWeeks);
          if (contract.deliveredQuantity < contract.totalQuantity) {
              const engine = unlockedEngines.find(e => e.id === contract.engineId);
              if (engine) {
                  const effort = calculateProductionEffort(engine);
                  loadB2B += weeklyTarget * effort;
              }
          }
      });

      return {
          used: loadCars + loadB2B,
          capacity,
          breakdown: { cars: loadCars, b2b: loadB2B }
      };
  }, [factory.level, developedCars, activeContracts, unlockedEngines]);

  // --- Persistence Logic ---
  const saveGame = useCallback(() => {
    // CRITICAL GUARD: Do not save if resetting.
    if (isResetting.current) {
        return; 
    }
    if (!isLoaded) return;

    const gameState = {
        version: SAVE_VERSION,
        money, researchPoints, date, brandPrestige, 
        lastWeeklyProfit, productionLineBusyUntil,
        factory, 
        activeLoans, totalInterestPaid,
        activeEvent,
        endGameState, hasWon,
        unlockedEngines, unlockedChassis, developedCars, 
        racingTeam, freeAgents, 
        unlockedTechIds, contractOffers, activeContracts, historyLog, notifications,
        tutorial // Persist Tutorial
    };
    
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        console.debug('Game Saved');
    } catch (e) {
        console.error('Failed to save game', e);
    }
  }, [money, researchPoints, date, brandPrestige, lastWeeklyProfit, productionLineBusyUntil, factory, activeLoans, totalInterestPaid, activeEvent, endGameState, hasWon, unlockedEngines, unlockedChassis, developedCars, racingTeam, freeAgents, unlockedTechIds, contractOffers, activeContracts, historyLog, notifications, tutorial, isLoaded]);

  const loadGame = useCallback(() => {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            
            if (typeof parsed.money !== 'number') throw new Error("Invalid save file");

            setMoney(parsed.money);
            if (parsed.researchPoints !== undefined) setResearchPoints(parsed.researchPoints);
            setDate(parsed.date);
            setBrandPrestige(parsed.brandPrestige);
            setLastWeeklyProfit(parsed.lastWeeklyProfit);
            if (parsed.productionLineBusyUntil) setProductionLineBusyUntil(parsed.productionLineBusyUntil);
            if (parsed.factory) setFactory(parsed.factory);
            
            // Financials
            if (parsed.activeLoans) setActiveLoans(parsed.activeLoans);
            // Migration for old generic debt
            if (parsed.currentDebt && (!parsed.activeLoans || parsed.activeLoans.length === 0)) {
                // Convert legacy debt to a generic "Legacy Loan"
                setActiveLoans([{
                    id: 'loan_legacy',
                    tierId: 'loan_legacy', // Fallback ID for migration
                    name: "Legacy Bank Loan",
                    principal: parsed.currentDebt,
                    interestRate: 0.10, // 10% was old rate
                    dateTaken: parsed.date
                }]);
            }
            if (parsed.totalInterestPaid) setTotalInterestPaid(parsed.totalInterestPaid);

            // Game End State
            if (parsed.endGameState) setEndGameState(parsed.endGameState);
            if (parsed.hasWon) setHasWon(parsed.hasWon);

            if (parsed.activeEvent) setActiveEvent(parsed.activeEvent);

            if(parsed.unlockedEngines) setUnlockedEngines(parsed.unlockedEngines);
            if(parsed.unlockedChassis) setUnlockedChassis(parsed.unlockedChassis);
            if(parsed.developedCars) setDevelopedCars(parsed.developedCars);
            
            // Racing State
            if(parsed.racingTeam) {
                const team = parsed.racingTeam;
                if (!team.drivers && team.driver) {
                    team.drivers = [team.driver]; // Migrate old save
                } else if (!team.drivers) {
                    team.drivers = [];
                }
                setRacingTeam(team);
            }

            if(parsed.freeAgents) setFreeAgents(parsed.freeAgents);
            if(parsed.unlockedTechIds) setUnlockedTechIds(parsed.unlockedTechIds);
            if(parsed.contractOffers) setContractOffers(parsed.contractOffers);
            if(parsed.activeContracts) setActiveContracts(parsed.activeContracts);
            if(parsed.historyLog) setHistoryLog(parsed.historyLog);
            if(parsed.notifications) setNotifications(parsed.notifications);
            
            // Tutorial State
            if (parsed.tutorial) {
                setTutorial(parsed.tutorial);
            } else {
                // Legacy Save: If cars exist, assume tutorial is done. Else, start it.
                const isLegacySaveDone = (parsed.developedCars && parsed.developedCars.length > 0);
                setTutorial({
                    isActive: !isLegacySaveDone,
                    currentStep: isLegacySaveDone ? 5 : 0,
                    isCompleted: isLegacySaveDone
                });
            }

            console.log("Game Loaded Successfully. Version:", parsed.version || "Legacy");
        } else {
            const initialDrivers = Array.from({length: 4}, () => generateRandomDriver(1980));
            setFreeAgents(initialDrivers);
        }
    } catch (e) {
        console.error('Load failed', e);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // --- HARD RESET LOGIC (Sandbox Friendly) ---
  const resetGame = useCallback(() => {
      console.log("Executando Hard Reset direto...");
      try {
          isResetting.current = true;
          // 1. Nuclear Option
          localStorage.clear();
          
          // 2. Short Delay to ensure storage is flushed before reload
          setTimeout(() => {
               window.location.reload();
          }, 100);
      } catch (e) {
          console.error("Erro crítico ao resetar:", e);
      }
  }, []);

  // Returns Raw JSON string
  const exportSave = useCallback(() => {
    const gameState = {
        version: SAVE_VERSION,
        money, researchPoints, date, brandPrestige, 
        lastWeeklyProfit, productionLineBusyUntil,
        factory, 
        activeLoans, totalInterestPaid,
        activeEvent,
        endGameState, hasWon,
        unlockedEngines, unlockedChassis, developedCars, 
        racingTeam, freeAgents, 
        unlockedTechIds, contractOffers, activeContracts, historyLog, notifications,
        tutorial
    };
    return JSON.stringify(gameState);
  }, [money, researchPoints, date, brandPrestige, lastWeeklyProfit, productionLineBusyUntil, factory, activeLoans, totalInterestPaid, activeEvent, endGameState, hasWon, unlockedEngines, unlockedChassis, developedCars, racingTeam, freeAgents, unlockedTechIds, contractOffers, activeContracts, historyLog, notifications, tutorial]);

  const importSave = useCallback((jsonString: string): boolean => {
      try {
          // 1. Try Parse as JSON
          let parsed;
          try {
              parsed = JSON.parse(jsonString);
          } catch(e) {
              // Legacy support: Try decoding Base64 if simple parse fails
              try {
                  const decoded = decodeURIComponent(escape(atob(jsonString)));
                  parsed = JSON.parse(decoded);
              } catch(e2) {
                  throw new Error("Invalid file format");
              }
          }

          // 2. Validate Vital Fields
          if (typeof parsed.money !== 'number' || typeof parsed.date !== 'number' || !parsed.factory) {
              throw new Error("Invalid save file structure: Missing core fields.");
          }

          // 3. Save to Disk (No reload here, handled by UI)
          localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
          
          return true;
      } catch (e) {
          console.error("Import Failed", e);
          return false;
      }
  }, []);

  // --- Initial Load ---
  useEffect(() => {
      loadGame();
  }, [loadGame]);

  // --- Auto Save (Every 4 weeks) ---
  useEffect(() => {
      if (date > 0 && date % 28 === 0) {
          saveGame();
      }
  }, [date, saveGame]);

  // --- YEAR END LOGIC ---
  const handleYearEnd = useCallback((newYear: number) => {
      addNotification(`Happy New Year! Welcome to ${newYear}.`, 'info');

      setRacingTeam(prevTeam => {
          if (!prevTeam.drivers || prevTeam.drivers.length === 0) return prevTeam;

          const updatedDrivers = prevTeam.drivers.map(driver => {
              const { updatedDriver, message } = processDriverYearlyAging(driver);
              if (message) addNotification(`${updatedDriver.name} ${message}`, updatedDriver.age > 33 ? 'alert' : 'success');
              if (updatedDriver.contractEndYear < newYear) {
                  addNotification(`Contract expired for ${updatedDriver.name}.`, 'alert');
              }
              return updatedDriver;
          });

          return { ...prevTeam, drivers: updatedDrivers };
      });

      setFreeAgents(prevAgents => {
          const agedAgents = prevAgents.map(agent => {
              const { updatedDriver } = processDriverYearlyAging(agent);
              return updatedDriver;
          }).filter(a => a.age < 40);

          const freshDrivers = Array.from({length: 3}, () => generateRandomDriver(newYear));
          return [...agedAgents, ...freshDrivers].slice(0, 12);
      });

  }, [addNotification]);

  // --- DEBUG ACTION ---
  const debugForceYear = useCallback(() => {
      const nextYear = year + 1;
      handleYearEnd(nextYear);
      setDate(prev => prev + 365);
  }, [year, handleYearEnd]);


  // --- Core Game Loop Logic (The "Tick") ---
  const tick = useCallback(() => {
    // 1. BANKRUPTCY CHECK (Defeat)
    if (money < GAME_LIMITS.BANKRUPTCY) {
        setEndGameState('defeat');
        setIsPaused(true);
        return; // Halt game logic
    }

    // 2. VICTORY CHECK
    if (!hasWon && money >= GAME_LIMITS.VICTORY_MONEY && brandPrestige >= GAME_LIMITS.VICTORY_PRESTIGE) {
        setEndGameState('victory');
        setHasWon(true);
        setIsPaused(true);
        return; // Halt game logic to show modal
    }

    const newDate = date + 7;
    const currentYear = startDate.getFullYear() + Math.floor(date / 365);
    const nextYear = startDate.getFullYear() + Math.floor(newDate / 365);
    
    setDate(newDate);

    // --- EVENT SYSTEM LOGIC ---
    if (activeEvent) {
        const endDate = activeEvent.dateStart + (activeEvent.durationWeeks * 7);
        if (newDate >= endDate) {
            addNotification("Market Report: Global situation stabilized.", "success");
            setActiveEvent(null);
        }
    } else {
        // Roll for new event (1% chance per week)
        if (Math.random() < 0.01) {
            const possibleEvents = WORLD_EVENTS; // From constants
            const randomTemplate = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            const newEvent: WorldEvent = {
                ...randomTemplate,
                dateStart: newDate
            };
            setActiveEvent(newEvent);
            // Notifications handled by Ticker mainly, but add to log too
            addNotification(`BREAKING NEWS: ${newEvent.title}`, 'alert');
        }
    }

    // --- DEBT INTEREST LOGIC (Monthly) ---
    // Every 4 weeks (28 days)
    let debtInterest = 0;
    if (newDate > 0 && newDate % 28 === 0 && activeLoans.length > 0) {
        // Calculate interest for each loan
        debtInterest = activeLoans.reduce((acc, loan) => {
            // Apply variable rate logic from events
            let effectiveRate = loan.interestRate;
            if (activeEvent?.modifiers.interestRateOffset) {
                effectiveRate += activeEvent.modifiers.interestRateOffset;
            }
            // Interest cannot be negative (bank pays you? nice try)
            effectiveRate = Math.max(0.001, effectiveRate); 
            
            return acc + Math.floor(loan.principal * effectiveRate);
        }, 0);
        
        if (debtInterest > 0) {
            setTotalInterestPaid(prev => prev + debtInterest);
            addNotification(`Bank Interest Payment: -${formatMoney(debtInterest)}`, 'alert');
        }
    }

    if (nextYear > currentYear) {
        handleYearEnd(nextYear);
    }

    // --- SALES LOGIC & PRODUCTION STEP ---
    const updatedCars = developedCars.map(car => {
        let updatedCar = { ...car };
        let tempRevenue = 0;

        // 1. Process Active Production (DRIP FEED)
        if (updatedCar.productionState && updatedCar.productionState.isActive) {
            const state = updatedCar.productionState;
            const remaining = state.totalBatchTarget - state.unitsProduced;
            const output = Math.min(state.weeklyRate, remaining);
            
            if (output > 0) {
                updatedCar.inventory += output;
                updatedCar.productionState = {
                    ...state,
                    unitsProduced: state.unitsProduced + output
                };
                // Auto-Release logic: If stock exists, it's released
                if (!updatedCar.isReleased && updatedCar.inventory > 0) {
                    const { reviews, finalScore } = calculateCarReviews(updatedCar);
                    updatedCar.isReleased = true;
                    updatedCar.reviews = reviews;
                    updatedCar.finalReviewScore = finalScore;
                    updatedCar.launchDay = newDate; // Set launch day to first unit arrival
                    addNotification(`LAUNCH: ${updatedCar.name} is now hitting showrooms!`, 'success');
                }
            } else {
                // Batch Complete
                updatedCar.productionState = { ...state, isActive: false };
                addNotification(`Production Complete: ${updatedCar.name} batch finished. Capacity released.`, 'success');
            }
        }

        // 2. Sales Logic
        if (updatedCar.isReleased && updatedCar.inventory > 0) {
             const salesResult = calculateWeeklySales(updatedCar, brandPrestige, year, activeEvent);
             updatedCar = {
                 ...updatedCar,
                 inventory: salesResult.stockRemaining,
                 totalUnitsSold: updatedCar.totalUnitsSold + salesResult.unitsSold
             };
             tempRevenue = salesResult.revenue;
        }

        return { ...updatedCar, tempWeeklyRevenue: tempRevenue };
    });

    let totalWeeklyRevenue = 0;
    let totalWeeklyUnitsSold = 0;
    
    const finalCars = updatedCars.map(c => {
        if ((c as any).tempWeeklyRevenue) {
            totalWeeklyRevenue += (c as any).tempWeeklyRevenue;
            totalWeeklyUnitsSold += (c.totalUnitsSold - developedCars.find(old => old.id === c.id)!.totalUnitsSold);
        }
        const { tempWeeklyRevenue, ...cleanCar } = c as any;
        return cleanCar as CarModel;
    });
    
    setDevelopedCars(finalCars);

    // --- B2B LOGIC ---
    let b2bRevenue = 0;
    let b2bCost = 0;
    let penaltyTotal = 0;
    let updatedActiveContracts: Contract[] = [];

    activeContracts.forEach(contract => {
        const deadline = contract.createdAt + (contract.durationWeeks * 7);
        const isExpired = newDate > deadline;
        
        const weeklyTarget = Math.ceil(contract.totalQuantity / contract.durationWeeks);
        const remaining = contract.totalQuantity - contract.deliveredQuantity;
        const unitsToDeliver = Math.min(weeklyTarget, remaining);

        if (!isExpired && unitsToDeliver > 0) {
            const engine = unlockedEngines.find(e => e.id === contract.engineId);
            const costPerUnit = engine ? engine.productionCost : 0;

            b2bRevenue += unitsToDeliver * contract.pricePerUnit;
            b2bCost += unitsToDeliver * costPerUnit;

            const updatedContract = {
                ...contract,
                deliveredQuantity: contract.deliveredQuantity + unitsToDeliver,
                status: (contract.deliveredQuantity + unitsToDeliver >= contract.totalQuantity) ? 'completed' as const : 'active' as const
            };

            if (updatedContract.status === 'active') {
                updatedActiveContracts.push(updatedContract);
            } else if (updatedContract.status === 'completed') {
                addNotification(`Contract with ${contract.clientName} completed!`, 'success');
            }
        } else if (isExpired) {
            // Expired logic
            if (contract.deliveredQuantity < contract.totalQuantity) {
                // Failure Penalty
                const undelivered = contract.totalQuantity - contract.deliveredQuantity;
                const penalty = Math.round(undelivered * contract.pricePerUnit * 1.5);
                penaltyTotal += penalty;
                addNotification(`Contract EXPIRED! ${contract.clientName} demanded ${formatMoney(penalty)} in damages for missing ${undelivered} units.`, 'alert');
            } else {
                addNotification(`Contract with ${contract.clientName} finished (Deadline Reached).`, 'info');
            }
            // Do not push to updatedActiveContracts (removes it)
        } else {
            // Case where it is finished but kept in array? No, handled by status check above.
            // If completed, it shouldn't be in the loop unless we just completed it.
            // Safe fallback to keep logic clean.
            updatedActiveContracts.push(contract);
        }
    });
    setActiveContracts(updatedActiveContracts);

    // Generate New Offers (Monthly)
    if (newDate % 28 === 0) {
        // Spam Control: If player has 3 or more pending offers, do not generate more.
        if (contractOffers.length < 3) {
            // Prestige-based Probability
            const baseChance = 0.05; // 5% base
            const prestigeBonus = brandPrestige / 5000; // 1000 prestige = +20%
            const spawnChance = baseChance + prestigeBonus;

            if (Math.random() < spawnChance) {
                const offer = generateContractOffer(unlockedEngines, newDate);
                if (offer) {
                    setContractOffers(prev => [offer, ...prev]); 
                    addNotification(`New B2B offer received from ${offer.clientName}`);
                }
            }
        }
    }

    // --- RACING SIMULATION ---
    let racingExpenses = 0;
    let racingPrize = 0;
    let prestigeChange = 0;

    if (racingTeam.activeCategoryId) {
        const category = RACING_CATEGORIES.find(c => c.id === racingTeam.activeCategoryId);
        if (category) {
            const numDrivers = racingTeam.drivers.length;
            
            if (numDrivers > 0) {
                racingExpenses += category.weeklyCost * numDrivers;
            } else {
                racingExpenses += category.weeklyCost * 0.5;
            }
            
            racingTeam.drivers.forEach(d => {
                racingExpenses += Math.round(d.salary / 4);
            });

            const weeklyDevSpend = Math.round(racingTeam.monthlyBudget / 4);
            racingExpenses += weeklyDevSpend;

            if (weeklyDevSpend > 0) {
                const improvement = (weeklyDevSpend / 1000000); 
                setRacingTeam(prev => ({
                    ...prev,
                    carPerformance: Math.min(100, prev.carPerformance + improvement)
                }));
            }

            // SIMULATE WITH SELECTED ENGINE
            const teamEngine = unlockedEngines.find(e => e.id === racingTeam.selectedEngineId);
            const raceResult = simulateRaceResult(racingTeam, category, teamEngine);
            
            racingPrize = raceResult.totalPrizeMoney;
            prestigeChange = raceResult.totalPrestigeChange;

            setRacingTeam(prev => {
                const updatedDrivers = prev.drivers.map(d => {
                    let stats = { ...d.stats };
                    stats.experience = Math.min(100, stats.experience + 0.1);
                    const myResult = raceResult.results.find(r => r.driverId === d.id);
                    if (myResult && myResult.position <= 3 && d.age <= 26) {
                        const growthFactor = (4 - myResult.position) * 0.5; 
                        const oldSkill = stats.skill;
                        stats.skill = Math.min(stats.talent, stats.skill + growthFactor);
                        if (stats.skill > oldSkill) {
                            addNotification(`${d.name} improved skill (+${growthFactor}) after a great P${myResult.position}!`, 'success');
                        }
                    }
                    return { ...d, stats };
                });
                const bestPos = raceResult.results.length > 0 ? Math.min(...raceResult.results.map(r => r.position)) : 20;
                return {
                    ...prev,
                    drivers: updatedDrivers,
                    lastResult: raceResult,
                    history: [bestPos, ...prev.history].slice(0, 10) 
                };
            });
        }
    }

    // --- FINANCIALS ---
    const totalWeeklyExpenses = WEEKLY_OPEX + racingExpenses + b2bCost;
    const netWeeklyProfit = (totalWeeklyRevenue + b2bRevenue + racingPrize) - totalWeeklyExpenses - penaltyTotal - debtInterest;
    
    const newMoney = money + netWeeklyProfit;
    setMoney(newMoney);
    setLastWeeklyProfit(netWeeklyProfit);

    // --- PRESTIGE ---
    let prestigeDelta = prestigeChange;
    if (totalWeeklyUnitsSold > 10 && brandPrestige < 1000 && Math.random() > 0.8) {
        prestigeDelta += 1;
    }
    const newPrestige = Math.max(0, brandPrestige + prestigeDelta);
    if (prestigeDelta !== 0) {
        setBrandPrestige(newPrestige);
    }

    // --- ANALYTICS ---
    if (newDate > 0 && newDate % 28 === 0) {
        const snapshot: HistoryEntry = {
            dateLabel: formatDate(newDate),
            money: newMoney,
            salesVolume: totalWeeklyUnitsSold * 4, 
            prestige: newPrestige
        };
        
        setHistoryLog(prev => {
            const newLog = [...prev, snapshot];
            if (newLog.length > 60) return newLog.slice(newLog.length - 60);
            return newLog;
        });
    }

  }, [money, date, developedCars, brandPrestige, racingTeam, activeContracts, unlockedEngines, year, handleYearEnd, addNotification, contractOffers.length, activeLoans, activeEvent, hasWon]);

  // --- Game Loop Timer ---
  useEffect(() => {
    if (isPaused) return;
    const intervalTime = gameSpeed === 2 ? 500 : MS_PER_TICK;
    const timerId = setInterval(tick, intervalTime);
    return () => clearInterval(timerId);
  }, [isPaused, gameSpeed, tick]);

  // --- Actions ---
  const togglePause = () => setIsPaused(prev => !prev);

  const continuePlaying = () => {
      setEndGameState('playing');
      setIsPaused(false);
  };

  // --- LOAN ACTIONS ---
  const takeLoan = (offerId: string) => {
      const offer = LOAN_OFFERS.find(o => o.id === offerId);
      if (!offer) return;

      // Count existing loans for this tier
      const currentCount = activeLoans.filter(l => l.tierId === offerId).length;
      if (currentCount >= 2) {
          alert("Loan limit reached for this tier (Max 2). Repay existing loans first.");
          return;
      }

      const newLoan: Loan = {
          id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tierId: offer.id,
          name: offer.name,
          principal: offer.amount,
          interestRate: offer.interestRate,
          dateTaken: date
      };

      setMoney(prev => prev + offer.amount);
      setActiveLoans(prev => [...prev, newLoan]);
      addNotification(`Loan approved: ${offer.name} (+${formatMoney(offer.amount)})`, 'success');
  };

  const repayLoan = (loanId: string) => {
      const loan = activeLoans.find(l => l.id === loanId);
      if (!loan) return;

      if (money < loan.principal) {
          alert(`Insufficient funds. You need ${formatMoney(loan.principal)} to repay this loan.`);
          return;
      }

      setMoney(prev => prev - loan.principal);
      setActiveLoans(prev => prev.filter(l => l.id !== loanId));
      addNotification(`Loan repaid: ${loan.name} (-${formatMoney(loan.principal)})`, 'success');
  };

  // --- FACTORY ACTIONS ---
  const upgradeFactory = () => {
      const nextLevel = factory.level + 1;
      const nextTier = FACTORY_TIERS.find(t => t.level === nextLevel);
      if (!nextTier) return;
      
      if (money < nextTier.upgradeCost) {
          alert(`Insufficient funds. Need ${formatMoney(nextTier.upgradeCost)}.`);
          return;
      }

      setMoney(prev => prev - nextTier.upgradeCost);
      setFactory({ level: nextLevel });
      addNotification(`Factory Upgraded to ${nextTier.name}! Capacity increased to ${nextTier.weeklyCapacityPU} PU/wk.`, 'success');
  };

  const startProduction = (car: CarModel, batchSize: number, productionWeeks: number) => {
      // 1. Calculate Available Throughput
      const load = calculateCurrentLoad();
      const freeCapacity = load.capacity - load.used;
      const effortPerUnit = calculateProductionEffort(car);
      
      // Max Units per week based on remaining capacity
      const maxRate = Math.floor(freeCapacity / effortPerUnit);

      if (maxRate < 1) {
          // Cannot produce even 1 car per week
          alert(`Factory Overloaded! Available capacity (${Math.round(freeCapacity)} PU) is less than required for 1 car (${effortPerUnit} PU). Upgrade factory or finish other jobs.`);
          return;
      }

      // Calculate Production Cost (Modified by Events)
      let totalCost = car.productionCost * batchSize;
      
      if (activeEvent?.modifiers.productionCostMultiplier) {
          const costIncrease = Math.round(totalCost * (activeEvent.modifiers.productionCostMultiplier - 1));
          totalCost += costIncrease;
          if (costIncrease > 0) {
              alert(`Warning: Production cost increased by ${formatMoney(costIncrease)} due to ${activeEvent.title}.`);
          }
      }

      if (money < totalCost) {
          alert("Insufficient funds to start production batch.");
          return;
      }

      setMoney(prev => prev - totalCost);
      
      const productionCar: CarModel = {
          ...car,
          batchSize: batchSize, // Kept for history
          inventory: 0, // Starts at 0
          launchDay: 0, // Will be set when first unit finishes
          isReleased: false,
          totalUnitsSold: 0,
          reviews: [],
          finalReviewScore: 0,
          productionState: {
              isActive: true,
              totalBatchTarget: batchSize,
              unitsProduced: 0,
              weeklyRate: maxRate,
              puPerUnit: effortPerUnit
          }
      };

      setDevelopedCars(prev => [...prev, productionCar]);
      const estimatedDuration = Math.ceil(batchSize / maxRate);
      addNotification(`Production Started: ${car.name}. Rate: ${maxRate} cars/wk. Est. Time: ${estimatedDuration} weeks.`, 'success');
  };

  const acceptContract = (contractId: string) => {
    const contract = contractOffers.find(c => c.id === contractId);
    if (!contract) return;
    const engine = unlockedEngines.find(e => e.id === contract.engineId);
    if (!engine) return;

    // Capacity Check
    const load = calculateCurrentLoad();
    const unitsPerWeek = Math.ceil(contract.totalQuantity / contract.durationWeeks);
    const effort = calculateProductionEffort(engine);
    const neededPU = unitsPerWeek * effort;
    
    const freeCapacity = load.capacity - load.used;

    if (neededPU > freeCapacity) {
        alert(`Capacity Insufficient! Need ${Math.round(neededPU)} PU/wk for this contract. Only ${Math.round(freeCapacity)} PU/wk available.`);
        return;
    }

    setContractOffers(prev => prev.filter(c => c.id !== contractId));
    setActiveContracts(prev => [...prev, { ...contract, status: 'active' }]);
    addNotification(`Contract accepted with ${contract.clientName}. Load: +${Math.round(neededPU)} PU/wk`, 'success');
  };

  const liquidateStock = (carId: string) => {
      setDevelopedCars(prev => prev.map(c => {
          if (c.id === carId && c.inventory > 0) {
              const liquidationValue = c.inventory * (c.productionCost * 0.5);
              setMoney(m => m + liquidationValue);
              return { ...c, inventory: 0 };
          }
          return c;
      }));
  };

  const developEngine = (newEngine: Engine, developmentCost: number) => {
    if (money < developmentCost) {
        alert("Not enough funds to develop this engine!");
        return;
    }
    setMoney(prev => prev - developmentCost);
    setUnlockedEngines(prev => [...prev, newEngine]);
    setBrandPrestige(prev => prev + 5); 
  };

  const joinRacingCategory = (categoryId: string) => {
    const category = RACING_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    if (money < category.entryFee) {
        alert("Insufficient funds to pay entry fee.");
        return;
    }
    if (brandPrestige < category.minPrestige) {
        alert(`Insufficient Prestige. You need ${category.minPrestige} prestige to enter this series.`);
        return;
    }

    let isSwitching = false;
    if (racingTeam.activeCategoryId) {
        isSwitching = true;
        const confirmSwitch = window.confirm(
            `WARNING: Switching to ${category.name} will require a completely new car regulation.\n\n` +
            `Your current 'Car Performance' progress will be RESET.\n` +
            `Your drivers and staff will remain.\n\n` +
            `Pay ${formatMoney(category.entryFee)} and continue?`
        );
        if (!confirmSwitch) return;
    }
    
    setMoney(prev => prev - category.entryFee);
    
    setRacingTeam(prev => ({
        ...prev,
        activeCategoryId: categoryId,
        selectedEngineId: null, // Reset engine when switching series
        history: isSwitching ? [] : prev.history,
        lastResult: null,
        monthlyBudget: isSwitching ? prev.monthlyBudget : 50000, 
        carPerformance: 10, // RESET CAR PERFORMANCE to baseline
        carReliability: 50
    }));
    addNotification(`Joined Racing Series: ${category.name}`, 'success');
  };

  const selectRaceEngine = (engineId: string) => {
      setRacingTeam(prev => ({ ...prev, selectedEngineId: engineId }));
  };

  const hireDriver = (driverId: string) => {
      const agent = freeAgents.find(d => d.id === driverId);
      if (!agent) return;
      if (money < agent.marketValue) {
          alert("Insufficient funds for signing bonus.");
          return;
      }
      if (racingTeam.drivers.length >= 2) {
          alert("Team is full! Fire a driver first.");
          return;
      }

      setMoney(prev => prev - agent.marketValue);
      setRacingTeam(prev => ({ 
          ...prev, 
          drivers: [...prev.drivers, agent] 
      }));
      setFreeAgents(prev => prev.filter(d => d.id !== driverId));
      addNotification(`Hired driver: ${agent.name}`, 'success');
  };

  const fireDriver = (driverId: string) => {
      console.log("Attempting to fire driver with ID:", driverId);
      const driver = racingTeam.drivers.find(d => d.id === driverId);
      if (!driver) return;

      const penalty = Math.max(driver.salary * 3, 500000);
      
      if (money < penalty) {
          addNotification(`Cannot fire ${driver.name}. Insufficient funds for severance (${formatMoney(penalty)}).`, 'alert');
          return;
      }

      setMoney(prev => prev - penalty);
      setRacingTeam(prev => ({ 
          ...prev, 
          drivers: prev.drivers.filter(d => d.id !== driverId) 
      }));
      addNotification(`Fired ${driver.name}. Paid severance fee of ${formatMoney(penalty)}.`, 'alert');
  };

  const setRacingBudget = (amount: number) => {
      setRacingTeam(prev => ({ ...prev, monthlyBudget: amount }));
  };

  const calculateTechCost = (tech: Technology) => {
      const currentEra = Math.floor(year / 10);
      const techEra = Math.floor(tech.unlockYear / 10);
      const eraGap = techEra - currentEra;

      let multiplier = 1;
      if (eraGap > 0) {
          multiplier = 1 + (eraGap * 0.5);
      }

      return {
          money: Math.round(tech.cost * multiplier),
          rp: Math.round(tech.baseRpCost * multiplier),
          multiplier
      };
  };

  const researchTech = (techId: string) => {
    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return;
    if (unlockedTechIds.includes(tech.id)) return;

    const costs = calculateTechCost(tech);

    if (money < costs.money) {
        alert("Insufficient funds for research.");
        return;
    }
    if (researchPoints < costs.rp) {
        alert("Insufficient Research Points (RP). Design more cars to gain knowledge!");
        return;
    }

    setMoney(prev => prev - costs.money);
    setResearchPoints(prev => prev - costs.rp);
    setUnlockedTechIds(prev => [...prev, techId]);
    setBrandPrestige(prev => prev + 2);
    addNotification(`Researched Technology: ${tech.name}`, 'success');
  };

  const gainResearchPoints = (amount: number) => {
      setResearchPoints(prev => prev + Math.floor(amount));
  };

  const rejectContract = (contractId: string) => {
    setContractOffers(prev => prev.filter(c => c.id !== contractId));
  };

  // --- Tutorial Actions ---
  const startTutorial = () => {
      setTutorial(prev => ({ ...prev, currentStep: 1 }));
  };

  const completeTutorial = () => {
      setTutorial(prev => ({ ...prev, isCompleted: true, isActive: false }));
      setBrandPrestige(prev => prev + 10);
      addNotification("Tutorial Completed! +10 Prestige awarded.", "success");
  };

  const value: GameContextType = {
    money,
    researchPoints,
    date,
    year,
    brandPrestige,
    isPaused,
    gameSpeed,
    lastWeeklyProfit,
    productionLineBusyUntil,
    factory,
    unlockedEngines,
    unlockedChassis,
    developedCars,
    racingTeam,
    freeAgents,
    unlockedTechIds,
    contractOffers,
    activeContracts,
    historyLog,
    notifications,
    tutorial,
    activeLoans,
    currentDebt,
    totalInterestPaid,
    activeEvent,
    endGameState,
    hasWon,
    tick,
    togglePause,
    setGameSpeed,
    startProduction,
    liquidateStock,
    developEngine,
    joinRacingCategory,
    setRacingBudget,
    hireDriver,
    fireDriver,
    selectRaceEngine, 
    researchTech,
    calculateTechCost,
    gainResearchPoints,
    acceptContract,
    rejectContract,
    debugForceYear,
    upgradeFactory,
    calculateCurrentLoad,
    getUnitEffort: calculateProductionEffort,
    saveGame,
    resetGame,
    exportSave,
    importSave,
    startTutorial,
    completeTutorial,
    takeLoan,
    repayLoan,
    continuePlaying
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
