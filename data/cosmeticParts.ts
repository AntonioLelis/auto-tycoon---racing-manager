import { BodyTypeData, CosmeticCategory } from '../types';

export const BODY_TYPES: BodyTypeData[] = [
  { 
    id: "sedan_box", 
    name: "Boxy Sedan", 
    baseDrag: 0.45, 
    baseWeight: 1200, 
    baseCost: 800,
    type: "Passenger", 
    unlockYear: 1960 
  },
  { 
    id: "hatch_compact", 
    name: "Compact Hatch", 
    baseDrag: 0.42, 
    baseWeight: 900, 
    baseCost: 600,
    type: "Passenger", 
    unlockYear: 1970 
  },
  {
    id: "coupe_standard",
    name: "Standard Coupe",
    baseDrag: 0.40,
    baseWeight: 1300,
    baseCost: 1000,
    type: "Sport",
    unlockYear: 1960
  },
  { 
    id: "muscle_fastback", 
    name: "Muscle Fastback", 
    baseDrag: 0.38, 
    baseWeight: 1500, 
    baseCost: 1200,
    type: "Sport", 
    unlockYear: 1965 
  },
  { 
    id: "pickup_util", 
    name: "Utility Pickup", 
    baseDrag: 0.55, 
    baseWeight: 1800, 
    baseCost: 900,
    type: "Utility", 
    unlockYear: 1950 
  },
  { 
    id: "wedge_sport", 
    name: "Wedge Supercar", 
    baseDrag: 0.32, 
    baseWeight: 1100, 
    baseCost: 4000,
    type: "Sport", 
    unlockYear: 1975 
  },
  { 
    id: "minivan_family", 
    name: "Family MPV", 
    baseDrag: 0.40, 
    baseWeight: 1600, 
    baseCost: 1100,
    type: "Passenger", 
    unlockYear: 1984 
  },
  { 
    id: "suv_luxury", 
    name: "Luxury SUV", 
    baseDrag: 0.48, 
    baseWeight: 2200, 
    baseCost: 2500,
    type: "Luxury", 
    unlockYear: 1995 
  }
];

export const COSMETIC_CATEGORIES: Record<string, CosmeticCategory> = {
  headlights: {
    id: "headlights",
    name: "Headlights",
    parts: [
      { id: "hl_round_sealed", name: "Sealed Beams (Round)", costMod: 50, dragMod: 0, handlingMod: 0, weightMod: 0, prestigeMod: 0, unlockYear: 1940 },
      { id: "hl_square_sealed", name: "Sealed Beams (Square)", costMod: 60, dragMod: 0, handlingMod: 0, weightMod: 0, prestigeMod: 2, unlockYear: 1975 },
      { id: "hl_popup", name: "Pop-up Headlights", costMod: 350, dragMod: 0.02, handlingMod: 0, weightMod: 15, prestigeMod: 15, unlockYear: 1968 },
      { id: "hl_composite", name: "Composite Halogen", costMod: 200, dragMod: -0.01, handlingMod: 0, weightMod: 5, prestigeMod: 5, unlockYear: 1985 },
      { id: "hl_xenon", name: "Xenon HID", costMod: 600, dragMod: -0.01, handlingMod: 0, weightMod: 8, prestigeMod: 20, unlockYear: 1995 },
    ]
  },
  spoilers: {
    id: "spoilers",
    name: "Aerodynamics",
    parts: [
      { id: "sp_none", name: "No Spoiler", costMod: 0, dragMod: 0, handlingMod: 0, weightMod: 0, prestigeMod: 0, unlockYear: 1900 },
      { id: "sp_lip", name: "Trunk Lip", costMod: 100, dragMod: -0.01, handlingMod: 2, weightMod: 2, prestigeMod: 5, unlockYear: 1970 },
      { id: "sp_ducktail", name: "Ducktail", costMod: 250, dragMod: 0.01, handlingMod: 5, weightMod: 5, prestigeMod: 10, unlockYear: 1972 },
      { id: "sp_whale", name: "Whale Tail", costMod: 600, dragMod: 0.03, handlingMod: 10, weightMod: 15, prestigeMod: 20, unlockYear: 1978 },
      { id: "sp_gt_wing", name: "GT Wing", costMod: 1200, dragMod: 0.06, handlingMod: 25, weightMod: 10, prestigeMod: 30, unlockYear: 1990 },
    ]
  },
  wheels: {
    id: "wheels",
    name: "Wheels & Rims",
    parts: [
      { id: "wh_steel", name: "Steelies + Hubcaps", costMod: 0, dragMod: 0, handlingMod: 0, weightMod: 0, prestigeMod: 0, unlockYear: 1900 },
      { id: "wh_wire", name: "Wire Spokes", costMod: 300, dragMod: 0.01, handlingMod: -2, weightMod: 5, prestigeMod: 25, unlockYear: 1950 },
      { id: "wh_mag", name: "Magnesium Alloys", costMod: 500, dragMod: 0, handlingMod: 5, weightMod: -15, prestigeMod: 15, unlockYear: 1965 },
      { id: "wh_alloy_basic", name: "Cast Alloy", costMod: 250, dragMod: 0, handlingMod: 2, weightMod: -5, prestigeMod: 5, unlockYear: 1980 },
      { id: "wh_forged", name: "Forged Performance", costMod: 1000, dragMod: 0, handlingMod: 10, weightMod: -10, prestigeMod: 20, unlockYear: 1990 },
    ]
  },
  roof: {
    id: "roof",
    name: "Roof Options",
    parts: [
      { id: "rf_solid", name: "Solid Roof", costMod: 0, dragMod: 0, handlingMod: 2, weightMod: 0, prestigeMod: 0, unlockYear: 1900 },
      { id: "rf_vinyl", name: "Vinyl Top", costMod: 200, dragMod: 0.01, handlingMod: 0, weightMod: 5, prestigeMod: 10, unlockYear: 1965 },
      { id: "rf_sunroof", name: "Sunroof (Manual)", costMod: 400, dragMod: 0.01, handlingMod: -2, weightMod: 15, prestigeMod: 15, unlockYear: 1975 },
      { id: "rf_targa", name: "T-Top / Targa", costMod: 800, dragMod: 0.02, handlingMod: -10, weightMod: 40, prestigeMod: 35, unlockYear: 1970 },
      { id: "rf_convertible", name: "Convertible Soft-top", costMod: 1500, dragMod: 0.05, handlingMod: -20, weightMod: 80, prestigeMod: 50, unlockYear: 1950 },
    ]
  }
};