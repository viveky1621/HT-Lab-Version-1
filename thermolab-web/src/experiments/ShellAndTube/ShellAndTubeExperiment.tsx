
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { ShellAndTubeModel, type ShellAndTubeParams } from './ShellAndTubeModel';
import { ShellAndTubeSVG } from './ShellAndTubeSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Settings2, Info } from 'lucide-react';

const PARAMS: ShellAndTubeParams = {
  shellDiameter: 0.3,
  tubeOD: 0.019,
  tubeID: 0.016,
  tubeLength: 2.0,
  tubeCount: 40,
  tubePasses: 2,
  baffleSpacing: 0.2,
  baffleCut: 0.25,
  segments: 20,
};

export const ShellAndTubeExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig, faults } = useStore();

  const modelParams = { ...PARAMS, ...equipmentConfig };
  const modelRef = useRef(new ShellAndTubeModel(modelParams, { T_shell_in: 75, T_tube_in: 20 }));

  useEffect(() => {
    if (!simulation.isRunning) {
      modelRef.current = new ShellAndTubeModel(modelParams, {
        T_shell_in: 75,
        T_tube_in: 20,
        m_shell: 0.2,
        m_tube: 0.5
      });
    }
  }, [equipmentConfig.tubeCount, equipmentConfig.tubePasses, equipmentConfig.baffleSpacing, simulation.isRunning]);

  const monitorRef = useRef(new SteadyStateMonitor(30, 0.005));

  const [ms_set, setMsSet] = useState(0.2);
  const [mt_set, setMtSet] = useState(0.5);
  const [Tsi_set, setTsiSet] = useState(75);

  const [sensors] = useState({
    Tsi: new SensorModel(75, { noiseLevel: 0.05 }),
    Tso: new SensorModel(65, { noiseLevel: 0.05 }),
    Tti: new SensorModel(20, { noiseLevel: 0.05 }),
    Tto: new SensorModel(30, { noiseLevel: 0.05 }),
    Fs: new SensorModel(0.2, { noiseLevel: 0.005 }),
    Ft: new SensorModel(0.5, { noiseLevel: 0.01 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>(equipmentConfig);
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setInlets(Tsi_set, 20, ms_set, mt_set);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        const n = state.T_shell.length;
        const p = state.T_tube.length;
        sensors.Tsi.update(state.T_shell_in, dt);
        sensors.Tso.update(state.T_shell[n-1], dt);
        sensors.Tti.update(state.T_tube_in, dt);
        sensors.Tto.update(state.T_tube[p-1][0], dt);
        sensors.Fs.update(state.m_shell, dt);
        sensors.Ft.update(state.m_tube, dt);
        const readings = {
          Tsi: sensors.Tsi.getReading(),
          Tso: sensors.Tso.getReading(),
          Tti: sensors.Tti.getReading(),
          Tto: sensors.Tto.getReading(),
          Fs: sensors.Fs.getReading(),
          Ft: sensors.Ft.getReading(),
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Tsi', 'Tso', 'Tti', 'Tto']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, ms_set, mt_set, Tsi_set, faults]);

  const Q_s = (ms_set * 4180 * (liveValues.Tsi - liveValues.Tso || 0));
  const Q_t = (mt_set * 4180 * (liveValues.Tto - liveValues.Tti || 0));

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <ShellAndTubeSVG state={modelRef.current.getState()} tubeCount={modelParams.tubeCount} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">Process Optimal</div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2"><Settings2 size={14} className="text-primary-500" /> Operational Loop</h3>
          <div className="space-y-6">
             <ControlSlider label="Shell Flow" value={ms_set} min={0} max={1.0} step={0.01} unit="kg/s" onChange={setMsSet} />
             <ControlSlider label="Tube Flow" value={mt_set} min={0} max={2.0} step={0.01} unit="kg/s" onChange={setMtSet} />
             <ControlSlider label="Shell Inlet" value={Tsi_set} min={40} max={95} step={1} unit="°C" onChange={setTsiSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Metric label="Shell-side Duty" value={Q_s.toFixed(1)} unit="W" />
                  <Metric label="Tube-side Duty" value={Q_t.toFixed(1)} unit="W" />
                </div>

                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800 shadow-inner">
                  <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={12} className="text-primary-500" /> TEMA R Design
                  </h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    Simulation assumes ASME BPVC VIII compliance. Rear floating head allows for thermal expansion of the tube bundle without stressing the shell.
                  </p>
                </div>
              </>
            }
            questions={<div className="text-xs text-slate-500 uppercase font-black">Thermal performance metrics active...</div>}
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
