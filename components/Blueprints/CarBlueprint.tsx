import React, { useMemo } from 'react';

interface CarBlueprintProps {
  bodyType: string; // Mapped from BodyStyle enum or ID
  color: string;
  className?: string;
  wheelbase?: number; // Visual scaling factor
  rideHeight?: number; // Visual adjustment
  techLevel?: number; // Adds extra details
}

// Coordinate System: 400w x 200h. Ground Level approx y=160.
const GROUND_Y = 160;

interface ShapeDef {
  bodyPath: string;
  windowPath: string;
  wheelPos: { rear: [number, number], front: [number, number] };
  wheelRadius: { rear: number, front: number };
  chassisHeight: number; // For measurement lines
}

// --- SHAPE LIBRARY ---
const CAR_SHAPES: Record<string, ShapeDef> = {
  // 1. SEDAN (Classic 3-Box)
  sedan: {
    wheelPos: { rear: [85, 160], front: [315, 160] },
    wheelRadius: { rear: 24, front: 24 },
    chassisHeight: 60,
    bodyPath: `
      M 10,160 L 10,100 L 20,95
      L 70,85 L 120,60 L 260,60 L 320,90 
      L 385,100 L 390,160 
      L 350,160 Q 315,130 280,160 
      L 120,160 Q 85,130 50,160 
      Z
    `,
    windowPath: `M 125,65 L 255,65 L 310,90 L 75,85 Z`
  },
  
  // 2. HATCHBACK (Compact, 2-Box, Short Rear)
  hatch: {
    wheelPos: { rear: [80, 160], front: [290, 160] }, // Short wheelbase
    wheelRadius: { rear: 22, front: 22 },
    chassisHeight: 65,
    bodyPath: `
      M 25,160 L 25,70 
      Q 30,50 110,45 
      L 210,45 
      Q 270,50 330,90 
      L 350,100 L 350,160 
      L 320,160 Q 290,132 260,160
      L 110,160 Q 80,132 50,160
      Z
    `,
    windowPath: `M 115,50 L 205,50 L 260,55 L 320,90 L 40,75 Z`
  },

  // 3. SUV (Boxy, High, Long Roof)
  suv: {
    wheelPos: { rear: [80, 155], front: [310, 155] },
    wheelRadius: { rear: 28, front: 28 },
    chassisHeight: 75,
    bodyPath: `
      M 10,155 L 10,80 L 30,75
      L 80,45 L 280,45 L 320,80 
      L 380,90 L 380,155
      L 345,155 Q 310,120 275,155
      L 115,155 Q 80,120 45,155
      Z
    `,
    windowPath: `M 85,50 L 275,50 L 310,80 L 35,78 Z`
  },

  // 4. COUPE (Sleek, Fastback)
  coupe: {
    wheelPos: { rear: [85, 160], front: [315, 160] },
    wheelRadius: { rear: 25, front: 25 },
    chassisHeight: 50,
    bodyPath: `
      M 15,160 L 15,100 
      Q 40,80 120,70 
      Q 180,50 240,70
      Q 320,90 390,110
      L 390,160
      L 345,160 Q 315,128 285,160
      L 115,160 Q 85,128 55,160
      Z
    `,
    windowPath: `M 125,75 L 230,75 Q 300,90 320,100 L 50,90 Z`
  },

  // 5. MUSCLE (Long Hood, Boxy Cabin, Short Deck)
  muscle: {
    wheelPos: { rear: [90, 160], front: [330, 160] },
    wheelRadius: { rear: 26, front: 24 }, // Staggered
    chassisHeight: 55,
    bodyPath: `
      M 15,160 L 15,90 
      L 110,85 L 140,60 
      L 260,60 L 310,85 
      L 390,90 L 395,140 L 390,160
      L 360,160 Q 330,128 300,160
      L 125,160 Q 90,126 55,160
      Z
    `,
    windowPath: `M 145,65 L 255,65 L 300,85 L 115,88 Z`
  },

  // 6. SUPERCAR (Wedge, Mid-Engine, Very Low)
  supercar: {
    wheelPos: { rear: [90, 165], front: [320, 165] },
    wheelRadius: { rear: 28, front: 26 },
    chassisHeight: 40,
    bodyPath: `
      M 20,160 L 20,100 
      L 130,60 L 250,60 
      L 390,120 L 400,160 
      L 352,160 Q 320,125 288,160
      L 122,160 Q 90,125 58,160
      Z
    `,
    windowPath: `M 140,65 L 240,65 L 350,110 L 130,100 Z`
  },

  // 7. TRUCK/PICKUP (Separate Bed, High)
  truck: {
    wheelPos: { rear: [85, 155], front: [330, 155] }, // Long wheelbase
    wheelRadius: { rear: 28, front: 28 },
    chassisHeight: 70,
    bodyPath: `
      M 5,155 L 5,90 
      L 130,90 L 130,50 
      L 240,50 L 260,90 
      L 390,95 L 390,155
      L 365,155 Q 330,118 295,155
      L 120,155 Q 85,118 50,155
      Z
    `,
    windowPath: `M 135,55 L 235,55 L 255,90 L 135,90 Z`
  },

  // 8. VAN (One-Box / MPV)
  van: {
    wheelPos: { rear: [80, 160], front: [320, 160] },
    wheelRadius: { rear: 24, front: 24 },
    chassisHeight: 70,
    bodyPath: `
      M 15,160 L 15,70
      L 80,40 L 300,40
      L 380,100 L 390,160
      L 355,160 Q 320,128 285,160
      L 115,160 Q 80,128 45,160
      Z
    `,
    windowPath: `M 85,45 L 295,45 L 370,95 L 40,80 Z`
  }
};

export const CarBlueprint: React.FC<CarBlueprintProps> = ({ 
  bodyType, 
  color, 
  className = '',
  wheelbase = 260,
  rideHeight = 50,
  techLevel = 1
}) => {
  
  // 1. Resolve Body Shape
  const normalizedType = bodyType.toLowerCase();
  let shapeKey = 'sedan'; // default

  if (normalizedType.includes('hatch') || normalizedType.includes('compact')) shapeKey = 'hatch';
  else if (normalizedType.includes('suv') || normalizedType.includes('utility') || normalizedType.includes('jeep')) shapeKey = 'suv';
  else if (normalizedType.includes('pickup') || normalizedType.includes('truck')) shapeKey = 'truck';
  else if (normalizedType.includes('van') || normalizedType.includes('mpv')) shapeKey = 'van';
  else if (normalizedType.includes('muscle') || normalizedType.includes('fastback')) shapeKey = 'muscle';
  else if (normalizedType.includes('super') || normalizedType.includes('hyper') || normalizedType.includes('wedge')) shapeKey = 'supercar';
  else if (normalizedType.includes('coupe') || normalizedType.includes('sport')) shapeKey = 'coupe';

  const shape = CAR_SHAPES[shapeKey];

  // 2. Adjust for props (Ride Height)
  // Higher ride height = Move body UP (lower Y value) relative to wheels
  // Max adjustment +/- 10px
  const rideHeightOffset = (rideHeight - 50) * 0.2; 
  
  // Wheel Component (Rotation Fix: Rotate at 0,0, then translate)
  const Wheel = ({ cx, cy, r }: { cx: number, cy: number, r: number }) => (
    <g transform={`translate(${cx}, ${cy})`}>
        <g className="animate-[spin_3s_linear_infinite]" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            {/* Tyre */}
            <circle cx="0" cy="0" r={r} stroke="#1e293b" strokeWidth="4" fill="#0f172a" />
            <circle cx="0" cy="0" r={r-2} stroke="#334155" strokeWidth="1" fill="transparent" strokeDasharray="3 3"/>
            
            {/* Rim */}
            <circle cx="0" cy="0" r={r * 0.6} stroke="#cbd5e1" strokeWidth="1.5" fill="transparent" />
            
            {/* Spokes */}
            <line x1={-r*0.6} y1="0" x2={r*0.6} y2="0" stroke="#475569" strokeWidth="1.5" />
            <line x1="0" y1={-r*0.6} x2="0" y2={r*0.6} stroke="#475569" strokeWidth="1.5" />
        </g>
        {/* Static Caliper Overlay (Optional) */}
        <path d={`M ${r*0.4},-5 L ${r*0.7},-5 L ${r*0.7},5 L ${r*0.4},5 Z`} fill={color} opacity="0.8" />
    </g>
  );

  return (
    <div className={`relative ${className} overflow-hidden`}>
      <svg viewBox="0 0 400 200" className="w-full h-auto drop-shadow-2xl">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="#475569" />
          </marker>
        </defs>

        {/* Blueprint Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Floor */}
        <line x1="0" y1={GROUND_Y + 14} x2="400" y2={GROUND_Y + 14} stroke="#1e293b" strokeWidth="2" />

        {/* Technical Measurements (Back layer) */}
        <g stroke="#334155" strokeWidth="1" strokeDasharray="2 2">
            <line x1={shape.wheelPos.rear[0]} y1={GROUND_Y + 14} x2={shape.wheelPos.rear[0]} y2={GROUND_Y + 40} />
            <line x1={shape.wheelPos.front[0]} y1={GROUND_Y + 14} x2={shape.wheelPos.front[0]} y2={GROUND_Y + 40} />
        </g>
        <g stroke="#475569" strokeWidth="1">
            <line x1={shape.wheelPos.rear[0]} y1={GROUND_Y + 30} x2={shape.wheelPos.front[0]} y2={GROUND_Y + 30} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        </g>
        <text x={(shape.wheelPos.rear[0] + shape.wheelPos.front[0])/2} y={GROUND_Y + 42} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
            {wheelbase}mm
        </text>

        {/* CAR GROUP (Can be animated/translated entirely) */}
        <g transform={`translate(0, ${-rideHeightOffset})`}>
            
            {/* Wheels */}
            <Wheel cx={shape.wheelPos.rear[0]} cy={shape.wheelPos.rear[1]} r={shape.wheelRadius.rear} />
            <Wheel cx={shape.wheelPos.front[0]} cy={shape.wheelPos.front[1]} r={shape.wheelRadius.front} />

            {/* Body */}
            <path 
                d={shape.bodyPath} 
                fill="url(#bodyGradient)" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            />

            {/* Windows */}
            <path 
                d={shape.windowPath} 
                fill="rgba(0,0,0,0.3)" 
                stroke="rgba(255,255,255,0.3)" 
                strokeWidth="1" 
            />

            {/* Interior/Mechanical Hints (Generic) */}
            <path d={`M ${shape.wheelPos.front[0] - 20},${shape.wheelPos.front[1] - 20} L ${shape.wheelPos.front[0] + 20},${shape.wheelPos.front[1] - 20}`} stroke={color} strokeWidth="2" strokeOpacity="0.5" />
            
        </g>

        {/* Overlay Info */}
        <text x="10" y="20" fill={color} fontSize="12" fontFamily="monospace" fontWeight="bold" letterSpacing="1px">
            CHASSIS: {shapeKey.toUpperCase()}
        </text>
        <text x="10" y="35" fill="#64748b" fontSize="10" fontFamily="monospace">
            AERO CONFIG: {rideHeight < 30 ? 'LOW DRAG' : rideHeight > 70 ? 'HIGH CLEARANCE' : 'STANDARD'}
        </text>

      </svg>
    </div>
  );
};