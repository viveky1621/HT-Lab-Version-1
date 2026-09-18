
import React from 'react';
import { useStore } from '../../core/state/useStore';
import { Shield, Construction, GitBranch, Settings2, Info } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const { activeExperiment, equipmentConfig, updateEquipmentConfig, simulation, faults, toggleFault, signSafetyPermit, safetyPermitSigned } = useStore();

  const renderBuildControls = () => {
    if (!activeExperiment) return null;
    const isRunning = simulation.isRunning;

    return (
      <div className="space-y-6">
        {/* Universal Build Controls: Flow Arrangement */}
        {(activeExperiment.id === 'double-pipe' || activeExperiment.id === 'plate-hx') && (
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <GitBranch size={12} className="text-primary-500" /> Arrangement
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900/50 p-1 rounded-md border border-slate-800 shadow-inner">
                 <button
                   onClick={() => updateEquipmentConfig({ isCounterCurrent: true })}
                   disabled={isRunning}
                   className={clsx(
                     "text-[9px] font-black py-1.5 rounded transition-all uppercase tracking-tighter",
                     equipmentConfig.isCounterCurrent ? "bg-primary-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
                   )}
                 >
                   Counter
                 </button>
                 <button
                   onClick={() => updateEquipmentConfig({ isCounterCurrent: false })}
                   disabled={isRunning}
                   className={clsx(
                     "text-[9px] font-black py-1.5 rounded transition-all uppercase tracking-tighter",
                     !equipmentConfig.isCounterCurrent ? "bg-primary-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
                   )}
                 >
                   Parallel
                 </button>
              </div>
           </div>
        )}

        <div className="h-px bg-slate-800" />

        {activeExperiment.id === 'shell-tube' && (
          <div className="space-y-4">
            <ConfigNumeric label="Tube Bundle Count" value={equipmentConfig.tubeCount || 40} min={10} max={200} step={10}
              onChange={(v) => updateEquipmentConfig({ tubeCount: v })} disabled={isRunning} />
            <ConfigSelect label="Channel Passes" value={equipmentConfig.tubePasses || 2} options={[1, 2, 4]}
              onChange={(v) => updateEquipmentConfig({ tubePasses: parseInt(v) })} disabled={isRunning} />
            <ConfigNumeric label="Baffle Spacing" value={equipmentConfig.baffleSpacing || 0.2} min={0.1} max={0.5} step={0.05} unit="m"
              onChange={(v) => updateEquipmentConfig({ baffleSpacing: v })} disabled={isRunning} />
          </div>
        )}

        {activeExperiment.id === 'plate-hx' && (
          <ConfigNumeric label="Active Plates" value={equipmentConfig.plateCount || 16} min={4} max={50} step={2}
            onChange={(v) => updateEquipmentConfig({ plateCount: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'double-pipe' && (
          <ConfigNumeric label="Physical Tube Length" value={equipmentConfig.length || 2.0} min={1.0} max={10.0} step={0.5} unit="m"
            onChange={(v) => updateEquipmentConfig({ length: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'jacket-vessel' && (
          <ConfigNumeric label="Vessel Capacity" value={equipmentConfig.volume || 0.5} min={0.1} max={5.0} step={0.1} unit="m³"
            onChange={(v) => updateEquipmentConfig({ volume: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'pin-fin' && (
          <ConfigSelect label="Base Material" value={equipmentConfig.material || 'Aluminum'} options={['Aluminum', 'Steel', 'Copper', 'Brass']}
            onChange={(v) => {
               let k = 200;
               if (v === 'Steel') k = 50;
               if (v === 'Copper') k = 390;
               if (v === 'Brass') k = 110;
               updateEquipmentConfig({ material: v, k });
            }} disabled={isRunning} />
        )}

        {activeExperiment.id === 'forced-conv' && (
           <ConfigSelect label="Specimen Geometry" value={equipmentConfig.geometry || 'Cylinder'} options={['Cylinder', 'Flat Plate', 'Sphere']}
             onChange={(v) => updateEquipmentConfig({ geometry: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'nat-conv' && (
           <ConfigSelect label="Surface Finish" value={equipmentConfig.finish || 'Polished'} options={['Polished', 'Oxidized', 'Black Paint']}
             onChange={(v) => {
                let eps = 0.05;
                if (v === 'Oxidized') eps = 0.6;
                if (v === 'Black Paint') eps = 0.95;
                updateEquipmentConfig({ finish: v, eps });
             }} disabled={isRunning} />
        )}

        {activeExperiment.id === 'conduction' && (
           <ConfigNumeric label="Insulation Thickness" value={equipmentConfig.insulationThickness || 0.02} min={0.01} max={0.1} step={0.01} unit="m"
             onChange={(v) => updateEquipmentConfig({ insulationThickness: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'radiation' && (
           <ConfigSelect label="Target Plate" value={equipmentConfig.targetPlate || 'Black'} options={['Black', 'Polished Metal', 'Gray']}
             onChange={(v) => {
                let eps = 0.95;
                if (v === 'Polished Metal') eps = 0.1;
                if (v === 'Gray') eps = 0.5;
                updateEquipmentConfig({ targetPlate: v, eps });
             }} disabled={isRunning} />
        )}

        {activeExperiment.id === 'boiling' && (
           <ConfigNumeric label="Heater Surface Area" value={equipmentConfig.surfaceArea || 0.005} min={0.001} max={0.02} step={0.001} unit="m²"
             onChange={(v) => updateEquipmentConfig({ surfaceArea: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'condenser' && (
           <ConfigNumeric label="Condensation Area" value={equipmentConfig.area || 1.0} min={0.5} max={5.0} step={0.5} unit="m²"
             onChange={(v) => updateEquipmentConfig({ area: v })} disabled={isRunning} />
        )}

        {activeExperiment.id === 'air-cooled' && (
           <ConfigNumeric label="Fan Diameter" value={equipmentConfig.fanDiameter || 0.8} min={0.5} max={2.0} step={0.1} unit="m"
             onChange={(v) => updateEquipmentConfig({ fanDiameter: v })} disabled={isRunning} />
        )}

        {isRunning && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-in fade-in zoom-in duration-300">
             <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
             <p className="text-[10px] text-amber-500 font-bold leading-relaxed uppercase tracking-tighter">
                System Active: Hardware reconfiguration locked. Pause process to modify build.
             </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl relative z-40">
      <div className="p-4 border-b border-slate-800 bg-slate-900/20">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Construction size={16} className="text-primary-500" /> Equipment Build
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {activeExperiment ? (
          <>
            {renderBuildControls()}

            <div className="h-px bg-slate-800" />

            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={12} className="text-red-500" /> Fault Injection
               </label>
               <div className="grid grid-cols-1 gap-2">
                  <FaultToggle label="Surface Fouling" active={faults.fouling} onClick={() => toggleFault('fouling')} />
                  <FaultToggle label="Sensor Drift (T)" active={faults.drift} onClick={() => toggleFault('drift')} />
                  <FaultToggle label="Tube Blockage" active={faults.blockage} onClick={() => toggleFault('blockage')} />
               </div>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} className="text-emerald-500" /> Operations Permit
               </label>
               <button
                 onClick={signSafetyPermit}
                 disabled={safetyPermitSigned}
                 className={clsx(
                   "w-full py-3 rounded-lg border font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                   safetyPermitSigned ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 cursor-default" : "bg-primary-600 border-primary-500 text-white hover:bg-primary-500 shadow-lg active:scale-95"
                 )}
               >
                  {safetyPermitSigned ? 'Permit Authorized' : 'Authorize Safe Work'}
               </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 flex flex-col items-center gap-4">
            <Settings2 size={32} className="text-slate-800 animate-pulse" />
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Awaiting Module Selection</p>
          </div>
        )}
      </div>

      <div className="p-5 bg-slate-900/50 border-t border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-500" /> Telemetry Status
          </span>
          <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">Nominal</span>
        </div>
        <div className="space-y-2">
           <SafetyIndicator label="Thermal Barrier" ok={true} />
           <SafetyIndicator label="Integrity Limit" ok={true} />
           <SafetyIndicator label="Process Safeguard" ok={true} />
        </div>
      </div>
    </aside>
  );
};

const FaultToggle: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-black uppercase transition-all shadow-sm",
      active ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
    )}
  >
    <span>{label}</span>
    <div className={clsx("w-1.5 h-1.5 rounded-full", active ? "bg-red-500 animate-pulse" : "bg-slate-700")} />
  </button>
);

const ConfigNumeric: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; disabled?: boolean }> = ({ label, value, min, max, step, unit, onChange, disabled }) => (
  <div className={clsx("space-y-2", disabled && "opacity-40 grayscale")}>
    <div className="flex justify-between items-baseline">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] font-mono font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">{value} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
    />
  </div>
);

const ConfigSelect: React.FC<{ label: string; value: any; options: any[]; onChange: (v: string) => void; disabled?: boolean }> = ({ label, value, options, onChange, disabled }) => (
  <div className={clsx("space-y-2", disabled && "opacity-40 grayscale")}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block">{label}</label>
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-[11px] font-black bg-slate-900 border border-slate-800 text-slate-300 p-2 rounded outline-none focus:border-primary-500 transition-colors shadow-inner appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const SafetyIndicator: React.FC<{ label: string; ok: boolean }> = ({ label, ok }) => (
  <div className="flex items-center justify-between text-[10px] font-bold">
    <span className="text-slate-400 uppercase tracking-tighter">{label}</span>
    <div className="flex items-center gap-1.5">
       <div className={clsx(
         "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
         ok ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50 animate-pulse"
       )} />
       <span className={ok ? "text-slate-600" : "text-red-500"}>{ok ? 'OK' : 'ERR'}</span>
    </div>
  </div>
);
