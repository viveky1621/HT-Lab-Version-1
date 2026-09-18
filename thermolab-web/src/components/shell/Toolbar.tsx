
import React from 'react';
import { Play, Pause, RotateCcw, Info, BookOpen, BarChart2, LayoutDashboard, LineChart, ChevronDown, Cpu } from 'lucide-react';
import { useStore } from '../../core/state/useStore';
import { clsx } from 'clsx';

export const Toolbar: React.FC = () => {
  const {
    simulation,
    setRunning,
    setTimeScale,
    resetSimulation,
    toggleUnits,
    setView,
    currentView,
    experiments,
    activeExperiment,
    setActiveExperiment,
    safetyPermitSigned
  } = useStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between px-4 z-50 shadow-2xl">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 group cursor-default">
           <div className="p-1.5 bg-primary-600 rounded shadow-[0_0_10px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all">
              <Cpu size={20} className="text-white" />
           </div>
           <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter leading-none text-white uppercase italic">ThermoLab</h1>
              <span className="text-[9px] font-bold text-primary-400 tracking-widest uppercase leading-none mt-0.5">Control System v1.0</span>
           </div>
        </div>

        <div className="h-8 w-px bg-slate-800 mx-2" />

        {/* Experiment Selector */}
        <div className="relative group">
           <div className="flex items-center gap-4 bg-slate-900/50 hover:bg-slate-900 transition-all px-4 py-1.5 rounded border border-slate-800 hover:border-primary-500/50 min-w-[280px]">
              <div className="flex-1">
                 <span className="text-[9px] text-slate-500 block leading-none uppercase font-black mb-1 tracking-tighter">Selected Process Module</span>
                 <span className="text-xs font-bold text-slate-200 truncate block">
                    {activeExperiment?.name || 'INITIALIZE MODULE...'}
                 </span>
              </div>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
           </div>

           <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              value={activeExperiment?.id || ''}
              onChange={(e) => {
                 const exp = experiments.find(x => x.id === e.target.value);
                 if (exp) setActiveExperiment(exp);
              }}
           >
              <option value="" disabled>SELECT MODULE</option>
              {experiments.map(exp => (
                 <option key={exp.id} value={exp.id} className="bg-slate-900 text-white">{exp.name}</option>
              ))}
           </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 rounded p-1 border border-slate-800 shadow-inner">
          <button
            onClick={() => {
               if (!safetyPermitSigned && !simulation.isRunning) {
                  alert('OPERATIONAL ERROR: Safety Permit not authorized. Sign the work permit in the Equipment Build panel before initiating process.');
                  return;
               }
               setRunning(!simulation.isRunning);
            }}
            className={clsx(
              "p-1.5 rounded transition-all active:scale-95 shadow-md",
              !safetyPermitSigned && !simulation.isRunning ? "opacity-30 grayscale cursor-not-allowed" : "",
              simulation.isRunning ? "bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white" : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white"
            )}
            title={simulation.isRunning ? "System Standby" : "Initiate Process"}
          >
            {simulation.isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
            title="System Purge / Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 rounded p-1 text-[10px] font-black border border-slate-800 shadow-inner">
          {[1, 5, 20].map((scale) => (
            <button
              key={scale}
              onClick={() => setTimeScale(scale)}
              className={clsx(
                "px-2 py-1 rounded transition-all uppercase tracking-tighter",
                simulation.timeScale === scale ? "bg-primary-600 text-white shadow-lg" : "hover:bg-slate-800 text-slate-500 hover:text-slate-300"
              )}
            >
              {scale}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase text-slate-600 font-black tracking-widest leading-none mb-1">Runtime Telemetry</span>
          <span className="font-mono text-xl tabular-nums leading-none text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
            {formatTime(simulation.elapsedTime)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleUnits}
            className="h-8 w-12 rounded bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 hover:text-white hover:border-primary-500 transition-all flex items-center justify-center shadow-inner"
          >
            {simulation.unitSystem}
          </button>

          <div className="h-8 w-px bg-slate-800" />

          <nav className="flex items-center gap-1">
            <NavTab icon={<LayoutDashboard size={18} />} label="System Rig" active={currentView === 'experiment'} onClick={() => setView('experiment')} />
            <NavTab icon={<BookOpen size={18} />} label="Documentation" active={currentView === 'theory'} onClick={() => setView('theory')} />
            <NavTab icon={<LineChart size={18} />} label="Live Trends" active={currentView === 'trends'} onClick={() => setView('trends')} />
            <NavTab icon={<BarChart2 size={18} />} label="Control Log" active={currentView === 'datalog'} onClick={() => setView('datalog')} />
          </nav>
        </div>
      </div>
    </header>
  );
};

const NavTab: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-all group relative min-w-[70px]",
      active ? "text-primary-400" : "text-slate-500 hover:text-slate-200"
    )}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    {active && <div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary-500 shadow-[0_0_10px_#3b82f6]" />}
  </button>
);
