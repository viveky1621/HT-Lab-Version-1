
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { ForcedConvectionModel, type ForcedConvectionParams } from './ForcedConvectionModel';
import { ForcedConvectionSVG } from './ForcedConvectionSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Wind, Zap } from 'lucide-react';

const PARAMS: ForcedConvectionParams = {
  cylinderDiameter: 0.02,
  cylinderLength: 0.15,
  heaterMaxPower: 100,
};

export const ForcedConvectionExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig } = useStore();

  const modelRef = useRef(new ForcedConvectionModel(PARAMS, { T_surface: 25, T_ambient: 25 }));
  const monitorRef = useRef(new SteadyStateMonitor(60, 0.005));

  const [velocity_set, setVelocitySet] = useState(2.0);
  const [power_set, setPowerSet] = useState(20);

  const [sensors] = useState({
    Ts: new SensorModel(25, { noiseLevel: 0.1 }),
    Ta: new SensorModel(25, { noiseLevel: 0.05 }),
    Vel: new SensorModel(2.0, { noiseLevel: 0.05, timeConstant: 1.0 }),
    Q: new SensorModel(20, { noiseLevel: 0.1 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setControls(velocity_set, power_set, 25);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        sensors.Ts.update(state.T_surface, dt);
        sensors.Ta.update(state.T_ambient, dt);
        sensors.Vel.update(state.airVelocity, dt);
        sensors.Q.update(state.heaterPower, dt);
        const readings = {
          Ts: sensors.Ts.getReading(),
          Ta: sensors.Ta.getReading(),
          Vel: sensors.Vel.getReading(),
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
  }, [simulation.isRunning, simulation.timeScale, velocity_set, power_set, updateLiveReadings, advanceTime, simulation.elapsedTime]);

  // Calculations
  const Area = Math.PI * PARAMS.cylinderDiameter * PARAMS.cylinderLength;
  const h_exp = liveValues.Q / (Area * (liveValues.Ts - liveValues.Ta) || 1);
  const Nu_exp = (h_exp * PARAMS.cylinderDiameter) / 0.026;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <ForcedConvectionSVG state={modelRef.current.getState()} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">System Stabilized</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Wind size={14} className="text-primary-500" /> Wind Tunnel Control</h3>
          <div className="space-y-6">
             <ControlSlider label="Air Velocity" value={velocity_set} min={0} max={10} step={0.1} unit="m/s" onChange={setVelocitySet} />
             <ControlSlider label="Heater Power" value={power_set} min={0} max={100} step={1} unit="W" onChange={setPowerSet} />

             <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[9px] uppercase font-bold text-slate-500">
                <span className="block mb-1 text-slate-400">Specimen: {equipmentConfig.geometry || 'Cylinder'}</span>
                <span>Dim: 20mm x 150mm</span>
             </div>
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                   <MetricBox label="Reynolds (Re)" value={(1.2 * liveValues.Vel * 0.02 / 1.8e-5 || 0).toFixed(0)} />
                   <MetricBox label="Nusselt (Nu)" value={Nu_exp.toFixed(1)} />
                   <MetricBox label="h-coeff (W/m²K)" value={h_exp.toFixed(1)} />
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed italic">
                   The experimental Nusselt number is derived from the steady-state energy balance. Compare this value with the Hilpert correlation for cross-flow over a cylinder to verify accuracy.
                </div>
              </div>
            }
            questions={<div className="text-xs text-slate-600 uppercase font-black text-center py-10 opacity-30 tracking-widest italic font-mono">Telemetry analyzing flow patterns...</div>}
          />
        </div>
      </div>
    </div>
  );
};

const MetricBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-900/40 rounded p-3 border border-slate-800 flex flex-col gap-1 shadow-inner">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
     <span className="text-white font-mono font-bold text-sm">{value}</span>
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
