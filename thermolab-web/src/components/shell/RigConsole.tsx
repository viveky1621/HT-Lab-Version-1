
import React from 'react';
import { useStore } from '../../core/state/useStore';
import { Info, AlertTriangle, Settings } from 'lucide-react';

export const RigConsole: React.FC = () => {
  const { activeExperiment, equipmentConfig, faults } = useStore();

  if (!activeExperiment) return null;

  const activeFaultList = Object.entries(faults).filter(([_, v]) => v).map(([k]) => k);

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
       <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 shadow-2xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
             <Settings size={12} className="text-primary-500" />
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Build Configuration</span>
          </div>
          <div className="space-y-1">
             {Object.entries(equipmentConfig).map(([k, v]) => {
                if (typeof v === 'object') return null;
                return (
                  <div key={k} className="flex justify-between text-[9px] font-bold">
                     <span className="text-slate-500 uppercase">{k.replace(/([A-Z])/g, ' $1')}</span>
                     <span className="text-white">{v.toString()}</span>
                  </div>
                );
             })}
          </div>
       </div>

       {activeFaultList.length > 0 && (
         <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-lg p-3 shadow-2xl animate-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
               <AlertTriangle size={12} className="text-red-500" />
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Process Faults Active</span>
            </div>
            <div className="space-y-1">
               {activeFaultList.map(f => (
                 <div key={f} className="text-[9px] font-black text-red-400 uppercase tracking-tighter flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    {f} INJECTED
                 </div>
               ))}
            </div>
         </div>
       )}
    </div>
  );
};
