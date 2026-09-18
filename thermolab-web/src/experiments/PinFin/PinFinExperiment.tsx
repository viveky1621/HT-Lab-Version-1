
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { PinFinModel, type PinFinParams } from './PinFinModel';
import { PinFinSVG } from './PinFinSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Zap } from 'lucide-react';

const PARAMS: PinFinParams = {
  length: 0.4,
  diameter: 0.015,
  k: 200,
  segments: 20,
};

export const PinFinExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig, faults } = useStore();

  const modelParams = { ...PARAMS, k: equipmentConfig.k || 200 };
  const modelRef = useRef(new PinFinModel(modelParams, { T_base: 25, T_ambient: 25 }));
  const monitorRef = useRef(new SteadyStateMonitor(60, 0.005));

  const [power_set, setPowerSet] = useState(20);
  const [h_set, setHSet] = useState(15);

  const [sensors] = useState({
    Tb: new SensorModel(25, { noiseLevel: 0.1 }),
    T1: new SensorModel(25, { noiseLevel: 0.1 }),
    T3: new SensorModel(25, { noiseLevel: 0.1 }),
    T5: new SensorModel(25, { noiseLevel: 0.1 }),
    Ta: new SensorModel(25, { noiseLevel: 0.05 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>(equipmentConfig);
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    if (!simulation.isRunning) {
      modelRef.current = new PinFinModel(modelParams, { T_base: 25, T_ambient: 25 });
    }
  }, [equipmentConfig.material, simulation.isRunning]);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(power_set, h_set, 25);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        sensors.Tb.update(state.T_base, dt);
        sensors.T1.update(state.T[0], dt);
        sensors.T3.update(state.T[9], dt);
        sensors.T5.update(state.T[19], dt);
        sensors.Ta.update(state.T_ambient, dt);
        const readings = {
          Tb: sensors.Tb.getReading(),
          T1: sensors.T1.getReading(),
          T3: sensors.T3.getReading(),
          T5: sensors.T5.getReading(),
          Ta: sensors.Ta.getReading(),
          Q: power_set,
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Tb', 'T5']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, power_set, h_set, faults]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <PinFinSVG state={modelRef.current.getState()} material={equipmentConfig.material} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Analysis Ready</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Zap size={14} className="text-primary-500" /> Operational Input</h3>
          <div className="space-y-6">
             <ControlSlider label="Base Power" value={power_set} min={0} max={100} step={1} unit="W" onChange={setPowerSet} />
             <ControlSlider label="Air Stream h" value={h_set} min={5} max={100} step={1} unit="W/m²K" onChange={setHSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-3 gap-4">
                 <Metric label="Fin Constant (m)" value={Math.sqrt((h_set * Math.PI * 0.015) / ((equipmentConfig.k || 200) * Math.PI * Math.pow(0.015, 2) / 4)).toFixed(2)} unit="m⁻¹" />
                 <Metric label="Tip Temp" value={(liveValues.T5 || 25).toFixed(1)} unit="°C" />
                 <Metric label="Efficiency (η)" value={(Math.tanh(Math.sqrt((h_set * Math.PI * 0.015) / ((equipmentConfig.k || 200) * Math.PI * Math.pow(0.015, 2) / 4)) * 0.4) / (Math.sqrt((h_set * Math.PI * 0.015) / ((equipmentConfig.k || 200) * Math.PI * Math.pow(0.015, 2) / 4)) * 0.4) || 0).toFixed(2)} unit="-" />
              </div>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">Fin effectiveness review active...</div>}
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
      <span className="text-[11px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{value.toFixed(2)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 transition-all" />
  </div>
);
