
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { ConductionModel, type ConductionParams } from './ConductionModel';
import { ConductionSVG } from './ConductionSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Zap } from 'lucide-react';

const LAYERS = [
  { name: 'Copper', k: 400, thickness: 0.05 },
  { name: 'Asbestos', k: 0.15, thickness: 0.02 },
  { name: 'Steel', k: 50, thickness: 0.05 },
];

const PARAMS: ConductionParams = {
  area: 0.1,
  layers: LAYERS,
};

export const ConductionExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings } = useStore();
  const modelRef = useRef(new ConductionModel(PARAMS, { heaterPower: 50, T_ambient: 25 }));
  const monitorRef = useRef(new SteadyStateMonitor(60, 0.005));
  const [power_set, setPowerSet] = useState(50);
  const [sensors] = useState({
    T0: new SensorModel(25, { noiseLevel: 0.1 }),
    T1: new SensorModel(25, { noiseLevel: 0.1 }),
    T2: new SensorModel(25, { noiseLevel: 0.1 }),
    T3: new SensorModel(25, { noiseLevel: 0.1 }),
    Ta: new SensorModel(25, { noiseLevel: 0.05 }),
  });
  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(power_set, 25);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        sensors.T0.update(state.T[0], dt);
        sensors.T1.update(state.T[1], dt);
        sensors.T2.update(state.T[2], dt);
        sensors.T3.update(state.T[3], dt);
        sensors.Ta.update(state.T_ambient, dt);
        const readings = {
          T0: sensors.T0.getReading(),
          T1: sensors.T1.getReading(),
          T2: sensors.T2.getReading(),
          T3: sensors.T3.getReading(),
          Ta: sensors.Ta.getReading(),
          Q: power_set,
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['T0', 'T3']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, power_set, updateLiveReadings, advanceTime, simulation.elapsedTime]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <ConductionSVG state={modelRef.current.getState()} layers={LAYERS} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Thermal Equilibrium</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Zap size={14} className="text-primary-500" /> Flux control</h3>
          <div className="space-y-6">
             <ControlSlider label="Heater Power" value={power_set} min={0} max={200} step={5} unit="W" onChange={setPowerSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-3 gap-4">
                 <Metric label="Total Resistance" value={(power_set > 0 ? (liveValues.T0 - liveValues.Ta) / power_set : 0).toFixed(3)} unit="K/W" />
                 <Metric label="Heat Flux" value={(power_set / 0.1).toFixed(0)} unit="W/m²" />
                 <Metric label="Interface dT" value={(liveValues.T1 - liveValues.T2 || 0).toFixed(1)} unit="°C" />
              </div>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">Conduction theory check active...</div>}
          />
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-900/40 rounded p-3 border border-slate-800 flex flex-col gap-1">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
     <span className="text-white font-mono font-bold text-sm">{value} <span className="text-[8px] text-slate-600 uppercase">{unit}</span></span>
  </div>
);

const ControlSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-baseline">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 transition-all" />
  </div>
);
