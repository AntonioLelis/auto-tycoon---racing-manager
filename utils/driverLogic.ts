import { Driver } from '../types';

const FIRST_NAMES = [
  'Ayrton', 'Alain', 'Niki', 'James', 'Michael', 'Lewis', 'Max', 'Sebastian', 'Fernando', 'Kimi', 
  'Mario', 'Emerson', 'Nelson', 'Graham', 'Jim', 'Jackie', 'Jochen', 'Stirling', 'Juan', 'Carlos',
  'Yuki', 'Daniel', 'Lando', 'George', 'Charles', 'Pierre', 'Esteban', 'Valtteri', 'Kevin', 'Nico'
];

const LAST_NAMES = [
  'Senna', 'Prost', 'Lauda', 'Hunt', 'Schumacher', 'Hamilton', 'Verstappen', 'Vettel', 'Alonso', 'Raikkonen',
  'Andretti', 'Fittipaldi', 'Piquet', 'Hill', 'Clark', 'Stewart', 'Rindt', 'Moss', 'Fangio', 'Sainz',
  'Tsunoda', 'Ricciardo', 'Norris', 'Russell', 'Leclerc', 'Gasly', 'Ocon', 'Bottas', 'Magnussen', 'Rosberg'
];

const getRandomName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

export const generateRandomDriver = (currentYear: number): Driver => {
  const age = Math.floor(Math.random() * 12) + 18; // 18 to 30 starting age
  
  // Talent is hard capped potential. 
  // Most drivers are average (40-70), some are legends (90+).
  const talentRoll = Math.random();
  let talent = 0;
  if (talentRoll > 0.95) talent = 95 + Math.floor(Math.random() * 5); // Legend
  else if (talentRoll > 0.8) talent = 80 + Math.floor(Math.random() * 15); // Star
  else talent = 40 + Math.floor(Math.random() * 40); // Average/Good

  // Starting Skill based on Age and Talent
  // Older starters are closer to their potential
  const potentialDeveloped = Math.min(1.0, (age - 16) / 10); // 10 years to reach peak
  const skill = Math.floor(talent * potentialDeveloped * (0.8 + Math.random() * 0.4));
  const finalSkill = Math.min(talent, Math.max(10, skill));

  const aggression = Math.floor(Math.random() * 100);
  const experience = Math.max(0, (age - 18) * 5 + Math.floor(Math.random() * 10));

  // Salary Calculation
  // Base $5k + ($1k per skill point) + ($500 per aggression point because fans love crashes/overtakes)
  const salary = 5000 + (finalSkill * 1000) + (aggression * 200) + (talent * 500);

  return {
    id: `driver_${Date.now()}_${Math.random()}`,
    name: getRandomName(),
    age,
    salary: Math.round(salary),
    contractEndYear: currentYear + Math.floor(Math.random() * 3) + 1, // 1-3 year contracts
    stats: {
      skill: finalSkill,
      talent,
      experience: Math.min(100, experience),
      aggression
    },
    marketValue: salary * 12 // Hiring fee approx 1 year salary
  };
};

/**
 * Handles the "Aging Curve" logic.
 * Young drivers gain skill. Veterans lose skill but have high exp.
 */
export const processDriverYearlyAging = (driver: Driver): { updatedDriver: Driver, message: string } => {
  const newAge = driver.age + 1;
  let newSkill = driver.stats.skill;
  let newExp = Math.min(100, driver.stats.experience + 5); // Exp always grows until cap
  let message = "";

  // 1. Young Growth (< 25)
  if (newAge < 25) {
      const growth = Math.floor(Math.random() * 5) + 1;
      const potentialGain = Math.min(driver.stats.talent, newSkill + growth);
      const actualGain = potentialGain - newSkill;
      newSkill = potentialGain;
      if (actualGain > 0) message = "is developing rapidly!";
  }
  // 2. Prime (25 - 32)
  else if (newAge <= 32) {
      // Small chance to inch towards talent cap
      if (newSkill < driver.stats.talent && Math.random() > 0.7) {
          newSkill++;
          message = "is at their peak performance.";
      }
  }
  // 3. Decline (> 33)
  else {
      const decayChance = (newAge - 32) * 0.1; // 10% at 33, 50% at 37
      if (Math.random() < decayChance) {
          const loss = Math.floor(Math.random() * 3) + 1;
          newSkill = Math.max(10, newSkill - loss);
          message = "is showing signs of aging (Reflexes down).";
      }
  }

  // Contract Expired?
  // Logic handled in GameContext to force renewal

  return {
      updatedDriver: {
          ...driver,
          age: newAge,
          stats: {
              ...driver.stats,
              skill: newSkill,
              experience: newExp
          }
      },
      message
  };
};
