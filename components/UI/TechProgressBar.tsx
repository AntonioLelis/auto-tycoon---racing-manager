import React from 'react';

interface TechProgressBarProps {
  value: number;
  max: number;
  label?: string;
  subLabel?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red';
  showValue?: boolean;
  striped?: boolean;
}

export const TechProgressBar: React.FC<TechProgressBarProps> = ({ 
  value, 
  max, 
  label, 
  subLabel, 
  color = 'blue', 
  showValue = true,
  striped = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    red: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
  };

  const bgColors = {
    blue: "bg-blue-900/20",
    emerald: "bg-emerald-900/20",
    amber: "bg-amber-900/20",
    red: "bg-red-900/20",
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-end mb-1">
          {label && <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-tech">{label}</span>}
          {showValue && (
            <span className={`text-xs font-mono font-bold ${color === 'red' ? 'text-red-400' : 'text-slate-200'}`}>
              {Math.round(value).toLocaleString()} / {Math.round(max).toLocaleString()} {subLabel}
            </span>
          )}
        </div>
      )}
      <div className={`w-full h-3 rounded-sm overflow-hidden ${bgColors[color]} border border-slate-700/50 relative`}>
        {/* Background Grid Pattern for empty space */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '4px 100%' }}></div>
        
        <div 
          className={`h-full transition-all duration-500 ease-out ${colors[color]} ${striped ? 'animate-stripe' : ''}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};