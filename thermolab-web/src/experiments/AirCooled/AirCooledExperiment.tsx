
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { AirCooledModel, type AirCooledParams } from './AirCooledModel';
import { AirCooledSVG } from './AirCooledSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Wind, Zap } from 'lucide-react';

const PARAMS: AirCooledParams = {
  tubeArea: 5.0,
  finEfficiency: 0.85,
  fanMaxFlow: 10.0,
  segments: 20,
};

export const AirCooledExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings } = useStore();
  const modelRef = useRef(new AirCooledModel(PARAMS, { T_inlet: 80, T_ambient: 25 }));
  const monitorRef = useRef(new SteadyStateMonitor(30, 0.005));
  const [mp_set, setMpSet] = useState(0.5);
  const [fan_set, setFanSet] = useState(0.5);
  const [Ti_set, setTiSet] = useState(80);
  const [Tamb_set, setTambSet] = useState(25);

  const [sensors] = useState({
    Tpi: new SensorModel(80, { noiseLevel: 0.1 }),
    Tpo: new SensorModel(60, { noiseLevel: 0.1 }),
    Tamb: new SensorModel(25, { noiseLevel: 0.05 }),
    Tao: new SensorModel(35, { noiseLevel: 0.1 }),
    Fp: new SensorModel(0.5, { noiseLevel: 0.01 }),
    Fan: new SensorModel(0.5, { noiseLevel: 0.005 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(Ti_set, Tamb_set, mp_set, fan_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        const n = state.T_process.length;
        sensors.Tpi.update(state.T_inlet, dt);
        sensors.Tpo.update(state.T_process[n-1], dt);
        sensors.Tamb.update(state.T_ambient, dt);
        sensors.Tao.update(state.T_air_out[n/2], dt);
        sensors.Fp.update(state.m_process, dt);
        sensors.Fan.update(state.fanSpeed, dt);
        const readings = {
          Tpi: sensors.Tpi.getReading(),
          Tpo: sensors.Tpo.getReading(),
          Tamb: sensors.Tamb.getReading(),
          Tao: sensors.Tao.getReading(),
          Fp: sensors.Fp.getReading(),
          Fan: sensors.Fan.getReading(),
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Tpi', 'Tpo', 'Tao']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, mp_set, fan_set, Ti_set, Tamb_set, updateLiveReadings, advanceTime, simulation.elapsedTime]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <AirCooledSVG state={modelRef.current.getState()} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Heat Load Stabilized</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Wind size={14} className="text-primary-500" /> Utility Console</h3>
          <div className="space-y-6">
             <ControlSlider label="Fan Speed" value={fan_set} min={0} max={1.0} step={0.05} unit="-" onChange={setFanSet} />
             <ControlSlider label="Process Flow" value={mp_set} min={0} max={2.0} step={0.01} unit="kg/s" onChange={setMpSet} />
             <ControlSlider label="Inlet Temp" value={Ti_set} min={40} max={95} step={1} unit="°C" onChange={setTiSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-2 gap-4">
                 <Metric label="Process Duty" value={(mp_set * 4.18 * (liveValues.Tpi - liveValues.Tpo || 0)).toFixed(1)} unit="kW" />
                 <Metric label="Air Flow" value={(PARAMS.fanMaxFlow * fan_set * 1.2).toFixed(2)} unit="kg/s" />
              </div>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">Air-side heat rejection audit...</div>}
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
