
import React from 'react';
import { useStore } from '../../core/state/useStore';
import { Activity, Thermometer, Droplets, Zap, CheckCircle2, ChevronRight, Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { UnitConverter } from '../../core/simulation/UnitConverter';

export const InstrumentRack: React.FC = () => {
  const { liveReadings, isSteady, addReading, activeExperiment, simulation } = useStore();

  const handleRecord = () => {
    addReading({
      simulatedTime: useStore.getState().simulation.elapsedTime,
      values: liveReadings,
      stability: isSteady ? 1 : 0.5,
      isSteady,
    });
  };

  const getInstruments = () => {
    const id = activeExperiment?.id;
    if (id === 'double-pipe' || id === 'plate-hx') {
      return [
        { key: 'Thin', label: 'T-Hot-In', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Thout', label: 'T-Hot-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tcin', label: 'T-Cold-In', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tcout', label: 'T-Cold-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Fh', label: 'Flow-Hot', unit: 'kg/s', icon: <Droplets size={14} /> },
        { key: 'Fc', label: 'Flow-Cold', unit: 'kg/s', icon: <Droplets size={14} /> },
      ];
    }
    if (id === 'shell-tube') {
      return [
        { key: 'Tsi', label: 'T-Shell-In', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tso', label: 'T-Shell-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tti', label: 'T-Tube-In', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tto', label: 'T-Tube-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Fs', label: 'Flow-Shell', unit: 'kg/s', icon: <Droplets size={14} /> },
        { key: 'Ft', label: 'Flow-Tube', unit: 'kg/s', icon: <Droplets size={14} /> },
      ];
    }
    if (id === 'jacket-vessel') {
      return [
        { key: 'Tv', label: 'T-Vessel', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tj', label: 'T-Jacket', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'SP', label: 'Set-Point', unit: '°C', icon: <Activity size={14} /> },
        { key: 'Fj', label: 'Flow-Jacket', unit: 'kg/s', icon: <Droplets size={14} /> },
      ];
    }
    if (id === 'forced-conv' || id === 'nat-conv') {
      return [
        { key: 'Ts', label: 'T-Surface', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Ta', label: 'T-Ambient', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Vel', label: 'Air-Vel', unit: 'm/s', icon: <Gauge size={14} /> },
        { key: 'Q', label: 'Power-In', unit: 'W', icon: <Zap size={14} /> },
      ];
    }
    if (id === 'air-cooled') {
      return [
        { key: 'Tpi', label: 'T-Proc-In', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tpo', label: 'T-Proc-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tamb', label: 'T-Ambient', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tao', label: 'T-Air-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Fp', label: 'Flow-Proc', unit: 'kg/s', icon: <Droplets size={14} /> },
        { key: 'Fan', label: 'Fan-Spd', unit: '-', icon: <Activity size={14} /> },
      ];
    }
    if (id === 'pin-fin') {
      return [
        { key: 'Tb', label: 'T-Base', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'T1', label: 'T-Pos1', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'T3', label: 'T-Pos3', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'T5', label: 'T-Pos5', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Ta', label: 'T-Ambient', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Q', label: 'Heat-In', unit: 'W', icon: <Zap size={14} /> },
      ];
    }
    if (id === 'conduction') {
      return [
        { key: 'T0', label: 'T-Heater', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'T1', label: 'T-Int1', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'T2', label: 'T-Int2', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'T3', label: 'T-Int3', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Ta', label: 'T-Ambient', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Q', label: 'Power-In', unit: 'W', icon: <Zap size={14} /> },
      ];
    }
    if (id === 'radiation') {
      return [
        { key: 'Ts', label: 'T-Source', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Qdet', label: 'Det-Power', unit: 'W', icon: <Zap size={14} /> },
        { key: 'Dist', label: 'Distance', unit: 'm', icon: <Gauge size={14} /> },
        { key: 'Eps', label: 'Emissivity', unit: '-', icon: <Activity size={14} /> },
      ];
    }
    if (id === 'boiling') {
      return [
        { key: 'Ts', label: 'T-Surface', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tb', label: 'T-Bulk', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'P', label: 'Pressure', unit: 'bar', icon: <Gauge size={14} /> },
        { key: 'Q', label: 'Power-In', unit: 'W', icon: <Zap size={14} /> },
      ];
    }
    if (id === 'condenser') {
      return [
        { key: 'Tci', label: 'T-Cool-In', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tco', label: 'T-Cool-Out', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tv', label: 'T-Vapor', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Tcon', label: 'T-Liquid', unit: '°C', icon: <Thermometer size={14} /> },
        { key: 'Fc', label: 'Flow-Cool', unit: 'kg/s', icon: <Droplets size={14} /> },
        { key: 'Fv', label: 'Flow-Vapor', unit: 'kg/s', icon: <Droplets size={14} /> },
      ];
    }
    return [];
  };

  const formatValue = (val: number | undefined, key: string) => {
    if (val === undefined) return '--.--';
    let type: any = 'temp';
    if (key.startsWith('F') || key === 'Vel' || key === 'Fan') type = 'flow';
    if (key === 'Q' || key === 'Qdet' || key === 'Flux' || key === 'SP') type = 'power';
    if (key === 'Dist' || key === 'P' || key === 'Eps') return val.toFixed(2);
    return UnitConverter.convert(val, type, simulation.unitSystem).split(' ')[0];
  };

  const getUnit = (key: string) => {
    let type: any = 'temp';
    if (key.startsWith('F') || key === 'Vel' || key === 'Fan') type = 'flow';
    if (key === 'Q' || key === 'Qdet' || key === 'Flux' || key === 'SP') type = 'power';
    if (key === 'Dist') return 'm';
    if (key === 'P') return 'bar';
    if (key === 'Eps') return '-';
    return UnitConverter.convert(0, type, simulation.unitSystem).split(' ')[1];
  };

  return (
    <aside className="w-64 bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden shadow-2xl relative z-40">
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={16} className="text-primary-500" /> Digital I/O
        </h2>
        {isSteady && (
          <div className="flex items-center gap-1 text-[8px] font-black text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-500/10 uppercase animate-pulse">
            Locked
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-950">
        {getInstruments().map((inst) => (
          <Instrument
            key={inst.key}
            label={inst.label}
            value={formatValue(liveReadings[inst.key], inst.key)}
            unit={getUnit(inst.key)}
            icon={inst.icon}
            trend="stable"
          />
        ))}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <button
          onClick={handleRecord}
          disabled={Object.keys(liveReadings).length === 0}
          className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-black py-3 rounded shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
        >
           Capture Reading <ChevronRight size={14} />
        </button>
      </div>
    </aside>
  );
};

const Instrument: React.FC<{
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
  unstable?: boolean;
}> = ({ label, value, unit, icon, trend, unstable }) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded p-2.5 relative group hover:border-primary-500/30 transition-all duration-300 shadow-inner">
    <div className="flex items-center justify-between mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
      <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 tracking-tighter">
        {icon} {label}
      </span>
      <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
    </div>
    <div className="flex items-baseline justify-between">
      <span className="text-xl font-mono text-white tabular-nums tracking-tighter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] group-hover:text-primary-100 transition-colors">
        {value}
      </span>
      <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);
