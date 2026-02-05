import { FeatureCategory } from '../types';

export const CAR_FEATURES: Record<string, FeatureCategory> = {
  transmission: {
    id: 'transmission',
    name: 'Transmission',
    features: [
      { 
        id: 'trans_manual_4', name: '4-Speed Manual', description: 'Standard manual gearbox. Reliable and cheap.',
        unlockYear: 1950, cost: 300, weight: 40, safetyMod: 0, comfortMod: 0, handlingMod: 0, reliabilityMod: 5 
      },
      { 
        id: 'trans_manual_5', name: '5-Speed Manual', description: 'Better highway cruising and efficiency.',
        unlockYear: 1975, cost: 500, weight: 45, safetyMod: 0, comfortMod: 5, handlingMod: 5, reliabilityMod: 2 
      },
      { 
        id: 'trans_auto_3', name: '3-Speed Auto', description: 'Early automatic. Comfortable but heavy and inefficient.',
        unlockYear: 1960, cost: 800, weight: 70, safetyMod: 0, comfortMod: 15, handlingMod: -5, reliabilityMod: -5 
      },
      { 
        id: 'trans_auto_4', name: '4-Speed Auto', description: 'Improved automatic with overdrive.',
        unlockYear: 1982, cost: 1200, weight: 75, safetyMod: 0, comfortMod: 20, handlingMod: -2, reliabilityMod: 0 
      },
    ]
  },
  steering: {
    id: 'steering',
    name: 'Steering',
    features: [
      { 
        id: 'str_rack', name: 'Rack & Pinion (Mech)', description: 'Direct mechanical connection. Heavy at low speeds.',
        unlockYear: 1940, cost: 100, weight: 15, safetyMod: 0, comfortMod: 0, handlingMod: 5, reliabilityMod: 10 
      },
      { 
        id: 'str_hydro', name: 'Hydraulic Power Steering', description: 'Uses engine power to assist steering. Great comfort.',
        unlockYear: 1951, techIdRequirement: 'tech_power_steering', cost: 400, weight: 25, safetyMod: 2, comfortMod: 20, handlingMod: 15, reliabilityMod: -5 
      },
      { 
        id: 'str_electric', name: 'Electric Power Steering', description: 'Efficient and tunable. Saves fuel.',
        unlockYear: 1995, techIdRequirement: 'tech_eps', cost: 600, weight: 20, safetyMod: 5, comfortMod: 25, handlingMod: 10, reliabilityMod: 0 
      },
    ]
  },
  seatbelts: {
    id: 'seatbelts',
    name: 'Seatbelts',
    features: [
      { 
        id: 'sb_2point', name: '2-Point Lap Belts', description: 'Better than nothing.',
        unlockYear: 1940, cost: 50, weight: 5, safetyMod: 10, comfortMod: -2, handlingMod: 0, reliabilityMod: 0 
      },
      { 
        id: 'sb_3point', name: '3-Point Belts', description: 'Standard safety requirement.',
        unlockYear: 1959, cost: 150, weight: 8, safetyMod: 30, comfortMod: -5, handlingMod: 0, reliabilityMod: 0 
      },
      { 
        id: 'sb_pretension', name: 'Pretensioner Belts', description: 'Tightens on impact. High safety.',
        unlockYear: 1980, techIdRequirement: 'tech_adv_safety', cost: 400, weight: 12, safetyMod: 45, comfortMod: -5, handlingMod: 0, reliabilityMod: -2 
      },
    ]
  },
  airbags: {
    id: 'airbags',
    name: 'Airbags',
    features: [
      { 
        id: 'ab_none', name: 'No Airbags', description: 'Standard for older cars.',
        unlockYear: 1900, cost: 0, weight: 0, safetyMod: 0, comfortMod: 0, handlingMod: 0, reliabilityMod: 0 
      },
      { 
        id: 'ab_driver', name: 'Driver Airbag', description: 'Basic protection for the driver.',
        unlockYear: 1980, techIdRequirement: 'tech_airbags', cost: 500, weight: 10, safetyMod: 20, comfortMod: 0, handlingMod: 0, reliabilityMod: -2 
      },
      { 
        id: 'ab_dual', name: 'Dual Front Airbags', description: 'Driver and Passenger protection.',
        unlockYear: 1988, techIdRequirement: 'tech_airbags', cost: 900, weight: 18, safetyMod: 35, comfortMod: 0, handlingMod: 0, reliabilityMod: -4 
      },
      { 
        id: 'ab_full', name: 'Curtain & Side Airbags', description: 'Maximum protection for all occupants.',
        unlockYear: 1998, techIdRequirement: 'tech_adv_safety', cost: 1800, weight: 35, safetyMod: 60, comfortMod: 0, handlingMod: 0, reliabilityMod: -8 
      },
    ]
  },
  interior: {
    id: 'interior',
    name: 'Interior Trim',
    features: [
      { 
        id: 'int_basic', name: 'Basic Cloth/Vinyl', description: 'Durable and cheap. Not very comfortable.',
        unlockYear: 1900, cost: 200, weight: 30, safetyMod: 0, comfortMod: 10, handlingMod: 0, reliabilityMod: 10 
      },
      { 
        id: 'int_prem_cloth', name: 'Premium Velour', description: 'Soft and cozy. Popular in the 80s/90s.',
        unlockYear: 1970, cost: 800, weight: 40, safetyMod: 2, comfortMod: 30, handlingMod: 0, reliabilityMod: 5 
      },
      { 
        id: 'int_sport', name: 'Sport Alcantara', description: 'Grippy and light. Focused on driving.',
        unlockYear: 1985, cost: 1200, weight: 25, safetyMod: 5, comfortMod: 20, handlingMod: 10, reliabilityMod: 5 
      },
      { 
        id: 'int_leather', name: 'Luxury Leather', description: 'The smell of success. Heavy and expensive.',
        unlockYear: 1950, cost: 2500, weight: 60, safetyMod: 5, comfortMod: 50, handlingMod: -5, reliabilityMod: 5 
      },
    ]
  },
  infotainment: {
    id: 'infotainment',
    name: 'Infotainment',
    features: [
      { 
        id: 'info_none', name: 'None', description: 'Weight saving or just cheap.',
        unlockYear: 1900, cost: 0, weight: 0, safetyMod: 0, comfortMod: 0, handlingMod: 0, reliabilityMod: 0 
      },
      { 
        id: 'info_radio', name: 'AM/FM Radio', description: 'Basic entertainment.',
        unlockYear: 1950, cost: 150, weight: 5, safetyMod: 0, comfortMod: 10, handlingMod: 0, reliabilityMod: 0 
      },
      { 
        id: 'info_tape', name: 'Cassette Player', description: 'Play your own mixtapes.',
        unlockYear: 1970, cost: 300, weight: 6, safetyMod: 0, comfortMod: 20, handlingMod: 0, reliabilityMod: -2 
      },
      { 
        id: 'info_cd', name: 'CD Player', description: 'Digital audio quality.',
        unlockYear: 1985, cost: 500, weight: 8, safetyMod: 0, comfortMod: 30, handlingMod: 0, reliabilityMod: -5 
      },
      { 
        id: 'info_nav', name: 'SatNav System', description: 'Never get lost again.',
        unlockYear: 1995, techIdRequirement: 'tech_electronics', cost: 1500, weight: 12, safetyMod: 0, comfortMod: 45, handlingMod: 0, reliabilityMod: -10 
      },
    ]
  },
  assists: {
    id: 'assists',
    name: 'Driver Assists',
    features: [
      { 
        id: 'assist_none', name: 'None', description: 'Pure mechanical driving.',
        unlockYear: 1900, cost: 0, weight: 0, safetyMod: 0, comfortMod: 0, handlingMod: 0, reliabilityMod: 0 
      },
      { 
        id: 'assist_abs', name: 'ABS (Anti-Lock Brakes)', description: 'Prevents skidding during braking.',
        unlockYear: 1978, techIdRequirement: 'tech_abs', cost: 600, weight: 15, safetyMod: 25, comfortMod: 5, handlingMod: 10, reliabilityMod: -5 
      },
      { 
        id: 'assist_tc', name: 'Traction Control', description: 'Prevents wheelspin. Good for powerful cars.',
        unlockYear: 1987, techIdRequirement: 'tech_abs', cost: 800, weight: 10, safetyMod: 20, comfortMod: 5, handlingMod: 15, reliabilityMod: -8 
      },
      { 
        id: 'assist_esc', name: 'ESC (Stability Control)', description: 'Computer controlled stability.',
        unlockYear: 1995, techIdRequirement: 'tech_adv_safety', cost: 1200, weight: 12, safetyMod: 40, comfortMod: 10, handlingMod: 20, reliabilityMod: -10 
      },
    ]
  }
};
