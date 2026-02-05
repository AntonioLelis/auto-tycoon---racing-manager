import React from 'react';
import { CylinderLayout, InductionType } from '../../types';

interface EngineBlueprintProps {
  layout: CylinderLayout;
  induction: InductionType;
  color?: string; // Accent color
  className?: string;
}

export const EngineBlueprint: React.FC<EngineBlueprintProps> = ({ 
  layout, 
  induction, 
  color = '#3b82f6', 
  className = '' 
}) => {
  
  // Helper to parse layout (e.g., "V8", "Inline-4")
  const parseLayout = (): { config: 'inline' | 'v', cylinders: number } => {
    if (layout.startsWith('V')) {
      return { config: 'v', cylinders: parseInt(layout.substring(1)) };
    }
    if (layout.startsWith('Inline-')) {
      return { config: 'inline', cylinders: parseInt(layout.split('-')[1]) };
    }
    // Fallback
    return { config: 'inline', cylinders: 4 };
  };

  const { config, cylinders } = parseLayout();
  
  // SVG Config
  const width = 300;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  
  const pistonRadius = 25;
  const pistonGap = 60;
  
  const renderPistons = () => {
    const pistons = [];
    
    if (config === 'inline') {
      const startY = cy - ((cylinders - 1) * pistonGap) / 2;
      
      for (let i = 0; i < cylinders; i++) {
        pistons.push(
          <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            {/* Cylinder Wall */}
            <circle cx={cx} cy={startY + i * pistonGap} r={pistonRadius + 4} stroke="#475569" strokeWidth="2" fill="#1e293b" />
            {/* Piston Head */}
            <circle cx={cx} cy={startY + i * pistonGap} r={pistonRadius} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
            {/* Spark Plug / Center */}
            <circle cx={cx} cy={startY + i * pistonGap} r={4} fill="white" />
          </g>
        );
      }
      
      // Crankshaft Line
      pistons.unshift(
          <line key="crank" x1={cx} y1={startY - pistonGap} x2={cx} y2={startY + cylinders * pistonGap} stroke="#334155" strokeWidth="4" />
      );

    } else if (config === 'v') {
      const rows = cylinders / 2;
      const startY = cy - ((rows - 1) * pistonGap) / 2;
      const bankOffset = 40; // Horizontal spread
      
      // V Angle Lines
      pistons.push(
          <path key="block_v" d={`M ${cx},${startY-50} L ${cx-bankOffset-20},${startY} L ${cx-bankOffset-20},${startY + rows*pistonGap} L ${cx},${startY + rows*pistonGap + 50} L ${cx+bankOffset+20},${startY + rows*pistonGap} L ${cx+bankOffset+20},${startY} Z`} fill="#0f172a" stroke="#334155" />
      );

      for (let i = 0; i < rows; i++) {
         // Left Bank
         pistons.push(
          <g key={`l_${i}`} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            <circle cx={cx - bankOffset} cy={startY + i * pistonGap} r={pistonRadius} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
            <circle cx={cx - bankOffset} cy={startY + i * pistonGap} r={3} fill="white" />
          </g>
         );
         // Right Bank
         pistons.push(
          <g key={`r_${i}`} className="animate-pulse" style={{ animationDelay: `${(i * 0.1) + 0.05}s` }}>
            <circle cx={cx + bankOffset} cy={startY + i * pistonGap} r={pistonRadius} stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
            <circle cx={cx + bankOffset} cy={startY + i * pistonGap} r={3} fill="white" />
          </g>
         );
      }
    }
    
    return pistons;
  };

  const renderTurbo = () => {
    if (induction !== InductionType.TURBO) return null;
    
    // Draw a "Snail" shape on the side
    const turboX = config === 'inline' ? cx + 60 : cx + 90;
    const turboY = cy;
    
    return (
        <g transform={`translate(${turboX}, ${turboY}) scale(0.8)`}>
            {/* Manifold Pipe */}
            <path d="M -30,0 Q -15,0 0,0" stroke="#cbd5e1" strokeWidth="8" fill="none" />
            
            {/* Turbo Snail Shell */}
            <path 
                d="M 0,0 
                   C 20,-20 40,0 20,20 
                   C 0,40 -20,20 0,0" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="3"
                className="drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
            />
            {/* Impeller */}
            <circle cx="10" cy="5" r="8" fill="#ef4444" opacity="0.5" className="animate-spin" style={{ animationDuration: '0.5s' }} />
            
            <text x="25" y="-15" fill="#ef4444" fontSize="12" fontFamily="monospace" fontWeight="bold">TURBO</text>
        </g>
    );
  };

  return (
    <div className={`relative ${className}`}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-xl">
             <defs>
                <pattern id="grid_sm" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.1)" />
                </pattern>
             </defs>
             
             {/* Tech Background */}
             <rect width="100%" height="100%" fill="url(#grid_sm)" />
             <circle cx={cx} cy={cy} r={Math.min(width, height) * 0.4} stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" strokeDasharray="5 5" />

             {/* Engine Block Render */}
             {renderPistons()}

             {/* Induction Render */}
             {renderTurbo()}

             {/* Overlay Text */}
             <text x="10" y="20" fill="#64748b" fontSize="10" fontFamily="monospace">CONFIG: {layout.toUpperCase()}</text>
             <text x="10" y="35" fill="#64748b" fontSize="10" fontFamily="monospace">INDUCTION: {induction.toUpperCase()}</text>
        </svg>
    </div>
  );
};