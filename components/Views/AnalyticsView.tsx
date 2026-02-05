import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Card } from '../UI/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, Bar, BarChart, Legend, Cell
} from 'recharts';
import { formatMoney } from '../../utils/formatters';
import { TrendingUp, Activity, Flag } from 'lucide-react';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-2">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}:</span>
            <span className="font-mono font-bold">
              {p.name === 'Balance' ? formatMoney(p.value) : p.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsView: React.FC = () => {
  const { historyLog, racingTeam } = useGame();

  // Prepare Racing Data: Reverse the "value" so 1st place looks "high" on bar chart
  // We take the last 20 races from history
  const racingData = racingTeam.history.slice(0, 20).reverse().map((pos, idx) => ({
     raceIndex: idx + 1,
     position: pos,
     score: 21 - pos // 1st place = 20 score, 20th place = 1 score
  }));

  if (historyLog.length < 2) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <Activity size={48} className="opacity-20" />
              <p>Insufficient data for analytics.</p>
              <p className="text-sm">Play for at least a few months to generate historical trends.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
      
      {/* Chart 1: Financial History */}
      <Card title="Financial Performance" className="col-span-1 lg:col-span-2">
        <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyLog} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMoney" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" tick={{fontSize: 12}} minTickGap={30} />
                    <YAxis 
                        stroke="#94a3b8" 
                        tick={{fontSize: 12}} 
                        tickFormatter={(value) => `$${value / 1000000}M`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="money" 
                        name="Balance"
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorMoney)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: Market Correlation */}
      <Card title="Sales vs Prestige Correlation">
         <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historyLog}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="dateLabel" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={30} />
                    <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 10}} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="salesVolume" name="Sales (Units)" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="prestige" name="Prestige" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
         </div>
      </Card>

      {/* Chart 3: Racing History */}
      <Card title="Motorsport Form (Recent Races)">
         <div className="h-64 w-full mt-4">
             {racingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={racingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(idx) => `#${idx + 1}`} />
                        <YAxis hide domain={[0, 21]} /> {/* Hide Y axis as it's an abstract score */}
                        <Tooltip 
                            cursor={{fill: '#1e293b'}}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-800 border border-slate-700 p-2 rounded text-xs">
                                            <p className="font-bold text-white">Finished: P{payload[0].payload.position}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="score" name="Position" fill="#6366f1" radius={[4, 4, 0, 0]}>
                            {
                                racingData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.position === 1 ? '#fbbf24' : entry.position <= 3 ? '#e2e8f0' : '#6366f1'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             ) : (
                 <div className="flex items-center justify-center h-full text-slate-500">
                     <Flag size={32} className="mr-2 opacity-50" />
                     No races participated yet.
                 </div>
             )}
         </div>
      </Card>

    </div>
  );
};