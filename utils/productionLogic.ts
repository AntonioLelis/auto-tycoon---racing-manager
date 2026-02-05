import { CarModel, Engine, CylinderLayout, InductionType, BodyTypeData } from '../types';
import { PRODUCTION_CONSTANTS } from '../constants';
import { BODY_TYPES } from '../data/cosmeticParts';

/**
 * Calculates the Production Units (PU) required to build one unit of an Item.
 */
export const calculateProductionEffort = (item: Engine | CarModel): number => {
    let pu = 0;

    // Check if item is Engine or Car
    if ('horsepower' in item) {
        // --- ENGINE LOGIC ---
        pu = PRODUCTION_CONSTANTS.PU_BASE_ENGINE;
        
        // Modifiers
        if (item.layout === CylinderLayout.V10 || item.layout === CylinderLayout.V12) {
            pu += PRODUCTION_CONSTANTS.PU_MOD_V12;
        }
        if (item.induction === InductionType.TURBO) {
            pu += PRODUCTION_CONSTANTS.PU_MOD_TURBO;
        }

    } else {
        // --- CAR LOGIC ---
        pu = PRODUCTION_CONSTANTS.PU_BASE_CAR;
        
        // --- OUTSOURCING LOGIC ---
        // If the car uses a supplier engine, we DO NOT add the engine manufacturing effort.
        // We assume the Base Car PU covers chassis + assembly. 
        // If it was our own engine, we'd normally add the engine effort (simplified model) or
        // in this game model, cars consume a flat rate + modifiers. 
        // To represent the benefit of outsourcing, we will REDUCE the PU required significantly.
        // Or rather, we should define: 
        // Normal Car PU = Chassis Work (10) + Engine Work (2) = 12.
        // Oursourced Car PU = Chassis Work (10).
        
        // The current constant PU_BASE_CAR is 10.
        // Let's say building your own engine adds +2 PU load to the factory per car implicitly.
        
        if (!item.isOutsourcedEngine) {
             pu += 2; // Implicit cost of manufacturing the engine in-house for this car
        }
        
        // Find Body Type Data
        const bodyData = BODY_TYPES.find(b => b.id === item.specs.bodyTypeId);
        
        if (bodyData) {
            if (bodyData.type === 'Luxury' || bodyData.type === 'Utility') {
                pu += PRODUCTION_CONSTANTS.PU_MOD_SUV_LUXURY;
            }
            if (bodyData.name.toLowerCase().includes('compact') || bodyData.name.toLowerCase().includes('hatch')) {
                pu += PRODUCTION_CONSTANTS.PU_MOD_COMPACT;
            }
        }

        // Quality Multiplier
        // item.specs.sliderInterior (0-100)
        // Max Quality adds 50% effort
        const qualityFactor = 1 + (item.specs.sliderInterior / 100) * 0.5;
        pu *= qualityFactor;
    }

    return parseFloat(pu.toFixed(1));
};