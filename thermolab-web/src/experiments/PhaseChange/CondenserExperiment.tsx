
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { CondenserModel, type CondenserParams } from './PhaseChangeModel';
import { CondenserSVG } from './CondenserSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Wind } from 'lucide-react';

const PARAMS: CondenserParams = {
  area: 1.0,
  U_base: 1000,
};

export const CondenserExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig } = useStore();

  const modelRef = useRef(new CondenserModel(PARAMS, { T_coolant_in: 20, T_vapor: 100 }));
  const monitorRef = useRef(new SteadyStateMonitor(30, 0.005));

  const [mc_set, setMcSet] = useState(0.5);
  const [mv_set, setMvSet] = useState(0.01);
  const [Tv_set, setTvSet] = useState(100);

  const [sensors] = useState({
    Tci: new SensorModel(20, { noiseLevel: 0.05 }),
    Tco: new SensorModel(25, { noiseLevel: 0.1 }),
    Tv: new SensorModel(100, { noiseLevel: 0.05 }),
    Tcon: new SensorModel(95, { noiseLevel: 0.1 }),
    Fc: new SensorModel(0.5, { noiseLevel: 0.01 }),
    Fv: new SensorModel(0.01, { noiseLevel: 0.001 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>(equipmentConfig);
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(20, mc_set, mv_set, Tv_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        sensors.Tci.update(state.T_coolant_in, dt);
        sensors.Tco.update(state.T_coolant_out, dt);
        sensors.Tv.update(state.T_vapor, dt);
        sensors.Tcon.update(state.T_condensate, dt);
        sensors.Fc.update(state.m_coolant, dt);
        sensors.Fv.update(state.m_vapor, dt);
        const readings = {
          Tci: sensors.Tci.getReading(),
          Tco: sensors.Tco.getReading(),
          Tv: sensors.Tv.getReading(),
          Tcon: sensors.Tcon.getReading(),
          Fc: sensors.Fc.getReading(),
          Fv: sensors.Fv.getReading(),
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Tco', 'Tcon']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, mc_set, mv_set, Tv_set]);

  const Q_condense = (liveValues.Fv || 0) * 2257;
  const Q_coolant = (liveValues.Fc || 0) * 4.18 * ((liveValues.Tco || 0) - (liveValues.Tci || 0));

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <CondenserSVG state={modelRef.current.getState()} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Efficiency Nominal</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Wind size={14} className="text-primary-500" /> Plant Console</h3>
          <div className="space-y-6">
             <ControlSlider label="Vapor Flow" value={mv_set} min={0} max={0.05} step={0.001} unit="kg/s" onChange={setMvSet} />
             <ControlSlider label="Coolant Flow" value={mc_set} min={0} max={2.0} step={0.05} unit="kg/s" onChange={setMcSet} />
             <ControlSlider label="Vapor Temp" value={Tv_set} min={80} max={150} step={1} unit="°C" onChange={setTvSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-2 gap-4">
                 <Metric label="Condensation Q" value={Q_condense.toFixed(1)} unit="kW" />
                 <Metric label="Coolant Q" value={Q_coolant.toFixed(1)} unit="kW" />
              </div>
            }
            questions={<div className="text-xs text-slate-600 uppercase font-black text-center py-8">Latent Heat Auditor Active</div>}
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
      <span className="text-[11px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{value.toFixed(3)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 transition-all" />
  </div>
);
