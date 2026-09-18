
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { DoublePipeModel, type DoublePipeParams } from './DoublePipeModel';
import { DoublePipeSVG } from './DoublePipeSVG';
import { SensorModel } from '../../core/simulation/SensorModel';
import { SteadyStateMonitor } from '../../core/simulation/SteadyStateMonitor';
import { BottomPanel } from '../../components/shell/BottomPanel';
import { Equation } from '../../components/shared/Equation';
import { clsx } from 'clsx';
import { Settings2 } from 'lucide-react';

const PARAMS: DoublePipeParams = {
  length: 2.0,
  di_inner: 0.012,
  do_inner: 0.016,
  di_outer: 0.025,
  k_wall: 45,
  segments: 20,
};

export const DoublePipeExperiment: React.FC = () => {
  const { simulation, advanceTime, updateLiveReadings, equipmentConfig, faults } = useStore();

  const isCounter = equipmentConfig.isCounterCurrent ?? true;
  const modelParams = { ...PARAMS, ...equipmentConfig };
  const modelRef = useRef(new DoublePipeModel(modelParams, { Thi: 75, Tci: 20, mh: 0.1, mc: 0.2, isCounterCurrent: isCounter }));
  const monitorRef = useRef(new SteadyStateMonitor(30, 0.005));

  const [mh_set, setMhSet] = useState(0.1);
  const [mc_set, setMcSet] = useState(0.2);
  const [Thi_set, setThiSet] = useState(75);

  const [sensors] = useState({
    Thin: new SensorModel(75, { noiseLevel: 0.05 }),
    Thout: new SensorModel(70, { noiseLevel: 0.05 }),
    Tcin: new SensorModel(20, { noiseLevel: 0.05 }),
    Tcout: new SensorModel(25, { noiseLevel: 0.05 }),
    Fh: new SensorModel(0.1, { noiseLevel: 0.002, timeConstant: 0.5 }),
    Fc: new SensorModel(0.2, { noiseLevel: 0.002, timeConstant: 0.5 }),
  });

  const [liveValues, setLiveValues] = useState<Record<string, number>>(equipmentConfig);
  const [isSteady, setIsSteady] = useState(false);

  useEffect(() => {
    if (!simulation.isRunning) {
      modelRef.current = new DoublePipeModel(modelParams, {
        Thi: Thi_set,
        Tci: 20,
        mh: mh_set,
        mc: mc_set,
        isCounterCurrent: isCounter
      });
    }
  }, [equipmentConfig.length, isCounter, simulation.isRunning]);

  useEffect(() => {
    let interval: any;
    if (simulation.isRunning) {
      interval = setInterval(() => {
        const dt = 0.1 * simulation.timeScale;
        modelRef.current.setInlets(Thi_set, 20, mh_set, mc_set, isCounter);
        modelRef.current.step(dt, faults);
        const state = modelRef.current.getState();
        const n = state.Th.length;

        const drift = faults.drift ? 2.5 : 0;

        sensors.Thin.update(state.Thi + drift, dt);
        sensors.Thout.update(state.Th[n-1], dt);
        sensors.Tcin.update(state.Tci, dt);
        sensors.Tcout.update(isCounter ? state.Tc[0] : state.Tc[n-1], dt);
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
  }, [simulation.isRunning, simulation.timeScale, mh_set, mc_set, Thi_set, isCounter, faults]);

  // Calculation Guards
  const thin = liveValues.Thin ?? 75;
  const thout = liveValues.Thout ?? 70;
  const tcin = liveValues.Tcin ?? 20;
  const tcout = liveValues.Tcout ?? 25;
  const fh = liveValues.Fh ?? 0.1;
  const fc = liveValues.Fc ?? 0.2;

  const Q_h = fh * 4180 * (thin - thout);
  const Q_c = fc * 4180 * (tcout - tcin);
  const dTl = isCounter ? (thin - tcout) : (thin - tcin);
  const dTr = isCounter ? (thout - tcin) : (thout - tcout);

  let LMTD = 0;
  if (Math.abs(dTl - dTr) < 0.1) {
    LMTD = (dTl + dTr) / 2;
  } else if (dTl > 0 && dTr > 0) {
    LMTD = Math.abs(dTl - dTr) / Math.log(Math.abs(dTl / dTr));
  }

  const U_exp = (LMTD > 0.1) ? ((Q_h + Q_c) / 2 / (0.1 * LMTD)) : 0;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden rig-container">
      <div className="flex-[3] bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden">
        <DoublePipeSVG state={modelRef.current.getState()} mh={mh_set} mc={mc_set} />
        {isSteady && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse uppercase tracking-widest">
            Stability Reached
          </div>
        )}
      </div>

      <div className="flex-2 mt-4 grid grid-cols-4 gap-4 min-h-[300px]">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
             <Settings2 size={14} className="text-primary-500" /> Manipulated Vars
          </h3>
          <div className="space-y-6">
             <ControlSlider label="Hot Flow" value={mh_set} min={0} max={0.5} step={0.01} unit="kg/s" onChange={setMhSet} />
             <ControlSlider label="Cold Flow" value={mc_set} min={0} max={0.5} step={0.01} unit="kg/s" onChange={setMcSet} />
             <ControlSlider label="Inlet Setpoint" value={Thi_set} min={40} max={90} step={1} unit="°C" onChange={setThiSet} />
          </div>
        </div>

        <div className="col-span-3">
          <BottomPanel
            calculations={
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase">Energy Balance</h5>
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                         <div className="flex items-center justify-between text-slate-300">
                            <Equation tex="Q_h = \dot{m}_h C_{p,h} (T_{h,in} - T_{h,out})" />
                            <span className="font-mono text-xs font-black text-white">{Q_h.toFixed(1)} W</span>
                         </div>
                         <div className="flex items-center justify-between text-slate-300">
                            <Equation tex="Q_c = \dot{m}_c C_{p,c} (T_{c,out} - T_{c,in})" />
                            <span className="font-mono text-xs font-black text-white">{Q_c.toFixed(1)} W</span>
                         </div>
                         <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-black text-[10px] uppercase">
                            <span className="text-slate-500">Balance Discrepancy</span>
                            <span className={clsx(Math.abs(Q_h - Q_c) < 500 ? "text-emerald-500" : "text-amber-500")}>
                               {Math.abs(Q_h - Q_c).toFixed(1)} W ({fh > 0 ? ((Math.abs(Q_h - Q_c) / Q_h) * 100).toFixed(1) : 0}%)
                            </span>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase">Heat Transfer Coefficient</h5>
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3 shadow-inner">
                         <div className="flex items-center justify-between text-slate-300">
                            <Equation tex="\Delta T_{lm} = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1 / \Delta T_2)}" />
                            <span className="font-mono text-xs font-black text-white">{LMTD > 0 ? LMTD.toFixed(2) : '--'} K</span>
                         </div>
                         <div className="flex items-center justify-between text-slate-300">
                            <Equation tex="U = \frac{Q_{avg}}{A \cdot \Delta T_{lm}}" />
                            <span className="font-mono text-sm font-black text-primary-400">
                               {U_exp > 0 ? U_exp.toFixed(1) : '--'} W/m²K
                            </span>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="p-3 bg-primary-500/5 rounded border border-primary-500/20 text-[10px] text-slate-400 italic leading-relaxed">
                   Note: Q_avg is used for U-calculation to minimize sensor bias. Effective area A is based on inner tube OD.
                </div>
              </div>
            }
            questions={
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-slate-200">Self-Assessment</h4>
                 <Question
                    text="How does the overall heat transfer coefficient change when the hot-side flow rate is doubled?"
                    hint="Consider the Reynolds number and the internal convection coefficient correlation."
                 />
                 <Question
                    text="Why is the LMTD for counter-current flow generally higher than parallel flow for the same terminal temperatures?"
                    hint="Look at the temperature profiles and the average driving force."
                 />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

const Question: React.FC<{ text: string; hint: string }> = ({ text, hint }) => {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="p-3 border border-slate-800 rounded-lg bg-slate-900/50">
       <p className="text-[11px] font-medium text-slate-300 mb-2">{text}</p>
       <button
         onClick={() => setShowHint(!showHint)}
         className="text-[9px] font-black text-primary-500 uppercase hover:text-primary-400 transition-colors"
       >
          {showHint ? 'Hide System Hint' : 'Request Logic Hint'}
       </button>
       {showHint && <p className="mt-2 text-[10px] text-slate-500 italic border-t border-slate-800 pt-2">{hint}</p>}
    </div>
  );
};

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
      <span className="text-[11px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{value.toFixed(2)} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-500 transition-all"
    />
  </div>
);
