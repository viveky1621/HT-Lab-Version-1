
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { BoilingModel, type BoilingParams } from './BoilingModel';
import { BoilingSVG } from './BoilingSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { AlertCircle, Zap } from 'lucide-react';

const PARAMS: BoilingParams = {
  surfaceArea: 0.005,
  volume: 0.002,
};

export const BoilingExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, resetSimulation, equipmentConfig } = useStore();

  const modelRef = useRef(new BoilingModel(PARAMS, { T_surface: 100, T_bulk: 100 }));
  const monitorRef = useRef(new SteadyStateMonitor(30, 0.005));

  const [power_set, setPowerSet] = useState(200);
  const [press_set, setPressSet] = useState(1.0);

  const [sensors] = useState({
    Ts: new SensorModel(100, { noiseLevel: 0.2 }),
    Tb: new SensorModel(100, { noiseLevel: 0.1 }),
    P: new SensorModel(1.0, { noiseLevel: 0.01 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>(equipmentConfig);
  const [isSteady, setIsSteady] = useState(false);
  const [tripped, setTripped] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning && !tripped) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(power_set, press_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        if (state.isTripped) setTripped(true);
        sensors.Ts.update(state.T_surface, dt);
        sensors.Tb.update(state.T_bulk, dt);
        sensors.P.update(state.pressure, dt);
        const readings = {
          Ts: sensors.Ts.getReading(),
          Tb: sensors.Tb.getReading(),
          P: sensors.P.getReading(),
          Q: power_set,
          Flux: power_set / (equipmentConfig.surfaceArea || 0.005),
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Ts', 'Tb']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, power_set, press_set, tripped]);

  const handleResetLocal = () => {
    setTripped(false);
    modelRef.current = new BoilingModel(PARAMS, { T_surface: 100, T_bulk: 100 });
    resetSimulation();
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <BoilingSVG state={modelRef.current.getState()} />
        {tripped && (
           <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border-2 border-red-500 text-center max-w-sm animate-in zoom-in duration-300">
                 <AlertCircle className="mx-auto text-red-500 mb-4" size={56} />
                 <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Safety Interlock</h2>
                 <p className="text-slate-400 text-xs mb-8 uppercase font-bold leading-relaxed">Critical Heat Flux Limit Exceeded.</p>
                 <button onClick={handleResetLocal} className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-black hover:bg-red-500 transition-all uppercase tracking-widest text-xs">Purge & Reset</button>
              </div>
           </div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Core Controls</h3>
          <div className="space-y-6">
             <ControlSlider label="Heater Power" value={power_set} min={0} max={1000} step={10} unit="W" onChange={setPowerSet} />
             <ControlSlider label="Cell Pressure" value={press_set} min={0.5} max={5.0} step={0.1} unit="bar" onChange={setPressSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Metric label="Heat Flux" value={(liveValues.Flux || 0).toLocaleString()} unit="W/m²" />
                    <Metric label="Wall Superheat" value={((liveValues.Ts || 0) - (100 + (press_set-1)*20)).toFixed(1)} unit="°C" />
                 </div>
              </div>
            }
            questions={<div className="text-xs text-slate-600 uppercase font-black text-center py-8">Regime Analyzer Online</div>}
          />
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-900/40 rounded p-3 border border-slate-800 flex justify-between items-center shadow-inner">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
     <span className="text-white font-mono font-bold">{value} <span className="text-[9px] text-slate-600 uppercase">{unit}</span></span>
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
