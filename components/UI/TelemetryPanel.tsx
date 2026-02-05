import React from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface StatItem {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  description?: string;
  reversed?: boolean; // True if lower is better (e.g. Weight, 0-100 time)
}

interface TelemetryCategory {
  title: string;
  stats: StatItem[];
}

interface TelemetryPanelProps {
  categories: TelemetryCategory[];
  previousData?: Record<string, number | string>; // Flat map of id -> value
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ categories, previousData }) => {
  
  const renderDelta = (item: StatItem) => {
    if (!previousData || previousData[item.id] === undefined) return null;
    
    const prev = previousData[item.id];
    const current = item.value;

    if (typeof current !== 'number' || typeof prev !== 'number') return null;
    if (current === prev) return <span className="text-slate-600 ml-2"><Minus size={12}/></span>;

    const diff = current - prev;
    const isPositiveChange = diff > 0;
    
    // Determine if "Good" or "Bad"
    // Default: Higher is better.
    // Reversed: Lower is better.
    let isGood = isPositiveChange;
    if (item.reversed) isGood = !isPositiveChange;

    return (
      <span className={`ml-2 text-xs flex items-center font-mono ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositiveChange ? <TrendingUp size={12} className="mr-0.5"/> : <TrendingDown size={12} className="mr-0.5"/>}
        {Math.abs(diff).toFixed(1)}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
        <TrendingUp size={18} className="text-blue-400" />
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Live Telemetry</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 border-b border-slate-700/50 pb-1">
              {cat.title}
            </h4>
            <div className="space-y-2">
              {cat.stats.map(stat => (
                <div key={stat.id} className="group flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5 relative">
                    <span className="text-slate-300">{stat.label}</span>
                    {stat.description && (
                      <div className="relative">
                        <Info size={12} className="text-slate-600 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-600 p-2 rounded text-xs text-slate-200 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                          {stat.description}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-mono font-bold text-white">
                      {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                      {stat.unit && <span className="text-slate-500 text-xs ml-1">{stat.unit}</span>}
                    </span>
                    <div className="w-12 flex justify-end">
                      {renderDelta(stat)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
