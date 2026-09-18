
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { NaturalConvectionModel, type NaturalConvectionParams } from './NaturalConvectionModel';
import { NaturalConvectionSVG } from './NaturalConvectionSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Zap } from 'lucide-react';

const PARAMS: NaturalConvectionParams = {
  plateHeight: 0.2,
  plateWidth: 0.1,
  heaterMaxPower: 50,
};

export const NaturalConvectionExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings } = useStore();
  const modelRef = useRef(new NaturalConvectionModel(PARAMS, { T_surface: 25, T_ambient: 25 }));
  const monitorRef = useRef(new SteadyStateMonitor(60, 0.005));
  const [power_set, setPowerSet] = useState(10);
  const [eps_set, setEpsSet] = useState(0.85);
  const [sensors] = useState({
    Ts: new SensorModel(25, { noiseLevel: 0.1 }),
    Ta: new SensorModel(25, { noiseLevel: 0.05 }),
    Q: new SensorModel(10, { noiseLevel: 0.05 }),
  });
  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(power_set, 25, eps_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        sensors.Ts.update(state.T_surface, dt);
        sensors.Ta.update(state.T_ambient, dt);
        sensors.Q.update(state.heaterPower, dt);
        const readings = {
          Ts: sensors.Ts.getReading(),
          Ta: sensors.Ta.getReading(),
          Q: sensors.Q.getReading(),
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Ts']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, power_set, eps_set, updateLiveReadings, advanceTime, simulation.elapsedTime]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <NaturalConvectionSVG state={modelRef.current.getState()} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Quasi-Steady</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Zap size={14} className="text-primary-500" /> Source Controls</h3>
          <div className="space-y-6">
             <ControlSlider label="Heater Power" value={power_set} min={0} max={50} step={1} unit="W" onChange={setPowerSet} />
             <ControlSlider label="Emissivity" value={eps_set} min={0.05} max={0.95} step={0.05} unit="-" onChange={setEpsSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-3 gap-4">
                 <Metric label="Rayleigh (Ra)" value={(9.81 * (1/300) * (liveValues.Ts - liveValues.Ta) * Math.pow(0.2, 3) / Math.pow(1.5e-5, 2) * 0.7 || 0).toExponential(2)} unit="-" />
                 <Metric label="Q_rad" value={(eps_set * 5.67e-8 * (0.2 * 0.1 * 2) * (Math.pow(liveValues.Ts + 273, 4) - Math.pow(liveValues.Ta + 273, 4)) || 0).toFixed(1)} unit="W" />
                 <Metric label="h_natural" value={(((liveValues.Q * 0.8) / (0.2 * 0.1 * 2 * (liveValues.Ts - liveValues.Ta))) || 0).toFixed(1)} unit="W/m²K" />
              </div>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">Free convection regime assessment...</div>}
          />
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-900/40 rounded p-3 border border-slate-800 flex flex-col gap-1">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
     <span className="text-white font-mono font-bold text-sm truncate">{value} <span className="text-[8px] text-slate-600 uppercase">{unit}</span></span>
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
      <span className="text-[11px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 transition-all" />
  </div>
);
