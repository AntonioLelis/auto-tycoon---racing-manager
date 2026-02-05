import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { DynoPoint } from '../../types';

interface DynoChartProps {
  data: DynoPoint[];
}

export const DynoChart: React.FC<DynoChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-slate-900/50 rounded border border-slate-700 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="rpm" 
            stroke="#94a3b8" 
            tick={{ fontSize: 10 }} 
            tickFormatter={(val) => `${val/1000}k`}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#f59e0b" 
            tick={{ fontSize: 10 }} 
            label={{ value: 'Torque (Nm)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 10 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#ef4444" 
            tick={{ fontSize: 10 }} 
            label={{ value: 'Power (HP)', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }}
            itemStyle={{ padding: 0 }}
          />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px' }}/>
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="torque" 
            name="Torque (Nm)" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 4 }} 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="hp" 
            name="Power (HP)" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 4 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
