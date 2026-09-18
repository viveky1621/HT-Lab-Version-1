
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { JacketedVesselModel, type JacketedVesselParams, PIDController } from './JacketedVesselModel';
import { JacketedVesselSVG } from './JacketedVesselSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Zap, Activity } from 'lucide-react';

const PARAMS: JacketedVesselParams = {
  volume: 0.5,
  jacketArea: 2.0,
  UA_base: 500,
  mass_vessel: 100,
};

export const JacketedVesselExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig } = useStore();

  const modelParams = { ...PARAMS, volume: equipmentConfig.volume || 0.5 };
  const modelRef = useRef(new JacketedVesselModel(modelParams, { T_vessel: 25, T_jacket: 25 }));
  const pidRef = useRef(new PIDController(0.5, 0.01, 0.05));
  const monitorRef = useRef(new SteadyStateMonitor(60, 0.002));

  useEffect(() => {
    if (!simulation.isRunning) {
      modelRef.current = new JacketedVesselModel(modelParams, { T_vessel: 25, T_jacket: 25 });
    }
  }, [equipmentConfig.volume]);

  const [mj_set, setMjSet] = useState(0.2);
  const [Tji_set, setTjiSet] = useState(80);
  const [agitation_set, setAgitationSet] = useState(0.5);
  const [setpoint, setSetpoint] = useState(50);
  const [autoMode, setAutoMode] = useState(false);

  const [sensors] = useState({
    Tv: new SensorModel(25, { noiseLevel: 0.1 }),
    Tj: new SensorModel(25, { noiseLevel: 0.1 }),
    Fj: new SensorModel(0.2, { noiseLevel: 0.005 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        let effectiveTji = Tji_set;
        if (autoMode) {
          const output = pidRef.current.update(setpoint, sensors.Tv.getReading(0.5), dt);
          effectiveTji = 25 + output * (Tji_set - 25);
        }
        modelRef.current.setControls(effectiveTji, mj_set, agitation_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        sensors.Tv.update(state.T_vessel, dt);
        sensors.Tj.update(state.T_jacket, dt);
        sensors.Fj.update(state.m_jacket, dt);
        const readings = {
          Tv: sensors.Tv.getReading(),
          Tj: sensors.Tj.getReading(),
          Fj: sensors.Fj.getReading(),
          SP: setpoint,
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Tv']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, mj_set, Tji_set, agitation_set, setpoint, autoMode, updateLiveReadings, advanceTime, simulation.elapsedTime]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <JacketedVesselSVG state={modelRef.current.getState()} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Set-Point Reached</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl overflow-y-auto custom-scrollbar">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Activity size={14} className="text-primary-500" /> Automation</h3>
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase">PID Control</span>
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all shadow-md ${autoMode ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                >
                  {autoMode ? 'Active' : 'Manual'}
                </button>
             </div>
             {autoMode && (
               <ControlSlider label="Target Temp" value={setpoint} min={25} max={80} step={1} unit="°C" onChange={setSetpoint} />
             )}
             <ControlSlider label="Agitator RPM" value={agitation_set} min={0} max={1.0} step={0.05} unit="-" onChange={setAgitationSet} />
             {!autoMode && (
               <ControlSlider label="Jacket Inlet" value={Tji_set} min={25} max={95} step={1} unit="°C" onChange={setTjiSet} />
             )}
             <ControlSlider label="Jacket Flow" value={mj_set} min={0} max={0.5} step={0.01} unit="kg/s" onChange={setMjSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="grid grid-cols-3 gap-4">
                 <Metric label="Vessel Volume" value={modelParams.volume.toFixed(2)} unit="m³" />
                 <Metric label="Approach dT" value={Math.abs(liveValues.Tv - liveValues.Tj || 0).toFixed(1)} unit="°C" />
                 <Metric label="Heat Flux" value={(mj_set * 4180 * (Tji_set - liveValues.Tj || 0)).toFixed(0)} unit="W" />
              </div>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">PID Tuning & Unsteady Heat Transfer Lab...</div>}
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
