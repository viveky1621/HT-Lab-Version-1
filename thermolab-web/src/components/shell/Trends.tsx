
import React, { useMemo } from 'react';
import { useStore } from '../../core/state/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

export const Trends: React.FC = () => {
  const { readings } = useStore();

  // Show the last 100 data points for a better history
  const chartData = useMemo(() => {
    return readings.slice(-100).map(r => ({
      time: r.simulatedTime,
      ...r.values
    }));
  }, [readings]);

  if (readings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950/20">
        <LineChartIcon size={48} className="opacity-20 mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Telemetry Feed...</p>
        <p className="text-[9px] uppercase tracking-tighter opacity-50 mt-1">Record a reading to initialize trend history</p>
      </div>
    );
  }

  // Industrial color mapping based on reference image
  const seriesConfig: Record<string, { color: string; label: string }> = {
    Thin: { color: '#ef4444', label: 'T_h,in' },
    Thout: { color: '#f97316', label: 'T_h,out' },
    Tcin: { color: '#3b82f6', label: 'T_c,in' },
    Tcout: { color: '#06b6d4', label: 'T_c,out' },
    Tsi: { color: '#ef4444', label: 'T_shell,in' },
    Tso: { color: '#f97316', label: 'T_shell,out' },
    Tti: { color: '#3b82f6', label: 'T_tube,in' },
    Tto: { color: '#06b6d4', label: 'T_tube,out' },
    Tv: { color: '#ef4444', label: 'T_vessel' },
    Tj: { color: '#3b82f6', label: 'T_jacket' },
    Ts: { color: '#ef4444', label: 'T_surface' },
    Ta: { color: '#3b82f6', label: 'T_ambient' },
    Tpi: { color: '#ef4444', label: 'T_proc,in' },
    Tpo: { color: '#f97316', label: 'T_proc,out' },
    Tamb: { color: '#3b82f6', label: 'T_ambient' },
    Tao: { color: '#06b6d4', label: 'T_air,out' },
    T0: { color: '#ef4444', label: 'T_0' },
    T1: { color: '#f97316', label: 'T_1' },
    T2: { color: '#3b82f6', label: 'T_2' },
    T3: { color: '#06b6d4', label: 'T_3' },
    Tb: { color: '#ef4444', label: 'T_base' },
    Tvapor: { color: '#e2e8f0', label: 'T_vapor' },
    Tcon: { color: '#3b82f6', label: 'T_cond' },
  };

  const activeKeys = Object.keys(readings[0].values).filter(k => seriesConfig[k]);

  return (
    <div className="h-full w-full p-4 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
           <LineChartIcon size={14} className="text-primary-500" /> System Telemetry
        </h3>
        <span className="text-[9px] font-bold text-slate-500 italic">
           Showing last 100 data packets
        </span>
      </div>

      <div className="h-[calc(100%-40px)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: '#64748b' }}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Process Time (s)', position: 'insideBottomRight', offset: -5, fontSize: 8, fill: '#475569', fontWeight: 'bold' }}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#64748b' }}
              axisLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
              label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#475569', fontWeight: 'bold' }}
            />
            <Tooltip
               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px', color: '#fff' }}
               itemStyle={{ padding: '0px' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '15px' }}
            />
            {activeKeys.map((key) => (
              <Line
                key={key}
                name={seriesConfig[key].label}
                type="monotone"
                dataKey={key}
                stroke={seriesConfig[key].color}
                strokeWidth={2}
                dot={false}
                animationDuration={0}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
