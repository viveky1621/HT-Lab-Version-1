
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { RadiationModel, type RadiationParams } from './RadiationModel';
import { RadiationSVG } from './RadiationSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Zap } from 'lucide-react';

const PARAMS: RadiationParams = {
  sourceArea: 0.05,
  detectorArea: 0.001,
};

export const RadiationExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings } = useStore();
  const modelRef = useRef(new RadiationModel(PARAMS, { T_source: 25, T_ambient: 25 }));
  const monitorRef = useRef(new SteadyStateMonitor(60, 0.005));
  const [power_set, setPowerSet] = useState(50);
  const [dist_set, setDistSet] = useState(0.5);
  const [eps_set, setEpsSet] = useState(0.95);
  const [sensors] = useState({
    Ts: new SensorModel(25, { noiseLevel: 0.1 }),
    Qdet: new SensorModel(0, { noiseLevel: 0.01, timeConstant: 1.0 }),
  });
  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(power_set, dist_set, eps_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        const detReading = modelRef.current.getDetectorReading();
        sensors.Ts.update(state.T_source, dt);
        sensors.Qdet.update(detReading, dt);
        const readings = {
          Ts: sensors.Ts.getReading(),
          Qdet: sensors.Qdet.getReading(),
          Dist: dist_set,
          Eps: eps_set,
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Ts', 'Qdet']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, power_set, dist_set, eps_set, updateLiveReadings, advanceTime, simulation.elapsedTime]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <RadiationSVG state={modelRef.current.getState()} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Detector Ready</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Zap size={14} className="text-primary-500" /> Emission Power</h3>
          <div className="space-y-6">
             <ControlSlider label="Heater Power" value={power_set} min={0} max={200} step={5} unit="W" onChange={setPowerSet} />
             <ControlSlider label="Distance" value={dist_set} min={0.1} max={1.0} step={0.01} unit="m" onChange={setDistSet} />
             <ControlSlider label="Emissivity" value={eps_set} min={0.05} max={1.0} step={0.05} unit="-" onChange={setEpsSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-2 gap-4">
                 <Metric label="Detected Flux" value={(liveValues.Qdet || 0).toFixed(3)} unit="W" />
                 <Metric label="T_source⁴" value={Math.pow(liveValues.Ts + 273, 4).toExponential(2)} unit="K⁴" />
              </div>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">Radiation laws validation module...</div>}
          />
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-900/40 rounded p-3 border border-slate-800 flex justify-between items-center">
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
