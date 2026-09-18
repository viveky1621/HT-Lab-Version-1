
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { PlateExchangerModel, type PlateExchangerParams } from './PlateExchangerModel';
import { PlateExchangerSVG } from './PlateExchangerSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Equation } from '../../components/shared/Equation';

const PARAMS: PlateExchangerParams = {
  plateArea: 0.25,
  plateCount: 16,
  chevronAngle: 45,
  segments: 20,
};

export const PlateExchangerExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig, faults } = useStore();

  const modelParams = { ...PARAMS, ...equipmentConfig };
  const modelRef = useRef(new PlateExchangerModel(modelParams, { Thi: 75, Tci: 20 }));
  const monitorRef = useRef(new SteadyStateMonitor(30, 0.005));

  useEffect(() => {
    if (!simulation.isRunning) {
      modelRef.current = new PlateExchangerModel(modelParams, {
        Thi: 75,
        Tci: 20,
        isCounterCurrent: equipmentConfig.isCounterCurrent ?? true
      });
    }
  }, [equipmentConfig.plateCount, equipmentConfig.isCounterCurrent, simulation.isRunning]);

  const [mh_set, setMhSet] = useState(0.15);
  const [mc_set, setMcSet] = useState(0.2);
  const [Thi_set, setThiSet] = useState(75);

  const [sensors] = useState({
    Thin: new SensorModel(75, { noiseLevel: 0.05 }),
    Thout: new SensorModel(65, { noiseLevel: 0.05 }),
    Tcin: new SensorModel(20, { noiseLevel: 0.05 }),
    Tcout: new SensorModel(30, { noiseLevel: 0.05 }),
    Fh: new SensorModel(0.15, { noiseLevel: 0.005 }),
    Fc: new SensorModel(0.2, { noiseLevel: 0.005 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>(equipmentConfig);
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setInlets(Thi_set, 20, mh_set, mc_set, equipmentConfig.isCounterCurrent ?? true);
        modelRef.current.step(dt);
        const state = modelRef.current.getState();
        const n = state.Th.length;
        sensors.Thin.update(state.Thi, dt);
        sensors.Thout.update(state.Th[n-1], dt);
        sensors.Tcin.update(state.Tci, dt);
        sensors.Tcout.update(state.isCounterCurrent ? state.Tc[0] : state.Tc[n-1], dt);
        sensors.Fh.update(state.mh, dt);
        sensors.Fc.update(state.mc, dt);
        const readings = {
          Thin: sensors.Thin.getReading(),
          Thout: sensors.Thout.getReading(),
          Tcin: sensors.Tcin.getReading(),
          Tcout: sensors.Tcout.getReading(),
          Fh: sensors.Fh.getReading(),
          Fc: sensors.Fc.getReading(),
        };
        setLiveValues(readings);
        monitorRef.current.addDataPoint(simulation.elapsedTime, readings);
        const steady = monitorRef.current.isSteady(['Thin', 'Thout', 'Tcin', 'Tcout']);
        setIsSteady(steady);
        updateLiveReadings(readings, steady);
        advanceTime(dt);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.timeScale, mh_set, mc_set, Thi_set, faults, equipmentConfig.isCounterCurrent]);

  const thin = liveValues.Thin ?? 75;
  const thout = liveValues.Thout ?? 65;
  const tcin = liveValues.Tcin ?? 20;
  const tcout = liveValues.Tcout ?? 30;
  const fh = liveValues.Fh ?? 0.15;
  const fc = liveValues.Fc ?? 0.2;

  const Q_h = fh * 4180 * (thin - thout);
  const Q_c = fc * 4180 * (tcout - tcin);
  const Area = modelParams.plateArea * (modelParams.plateCount - 1);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <PlateExchangerSVG state={modelRef.current.getState()} plateCount={modelParams.plateCount} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest animate-pulse">
            Optimal State
          </div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">Console</h3>
          <div className="space-y-6">
             <ControlSlider label="Hot Flow" value={mh_set} min={0} max={0.5} step={0.01} unit="kg/s" onChange={setMhSet} />
             <ControlSlider label="Cold Flow" value={mc_set} min={0} max={0.5} step={0.01} unit="kg/s" onChange={setMcSet} />
             <ControlSlider label="Inlet Temp" value={Thi_set} min={40} max={95} step={1} unit="°C" onChange={setThiSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <MetricGroup label="Process Duty">
                       <Metric label="Q_hot" value={Q_h.toFixed(0)} unit="W" />
                       <Metric label="Q_cold" value={Q_c.toFixed(0)} unit="W" />
                    </MetricGroup>
                    <MetricGroup label="Efficiency">
                       <Metric label="Area" value={Area.toFixed(2)} unit="m²" />
                       <Metric label="U (Est)" value={(Area > 0 ? (Q_h+Q_c)/2 / (Area * 20) : 0).toFixed(0)} unit="W/m²K" />
                    </MetricGroup>
                 </div>
              </div>
            }
            questions={<div className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-30 text-center py-10">Logic Engine Idle</div>}
          />
        </div>
      </div>
    </div>
  );
};

const MetricGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</h5>
    <div className="bg-slate-900/40 rounded border border-slate-800 p-3 space-y-2 shadow-inner">{children}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-center text-[11px] font-bold">
     <span className="text-slate-500 uppercase tracking-tighter">{label}</span>
     <span className="text-white font-mono">{value} <span className="text-[9px] text-slate-600 font-black">{unit}</span></span>
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
