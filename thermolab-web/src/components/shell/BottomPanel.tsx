
import React, { useState } from 'react';
import { useStore } from '../../core/state/useStore';
import { clsx } from 'clsx';
import { FileText, Calculator, HelpCircle, Table as TableIcon, Info } from 'lucide-react';

interface BottomPanelProps {
  calculations: React.ReactNode;
  questions: React.ReactNode;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ calculations, questions }) => {
  const [activeTab, setActiveTab] = useState<'calcs' | 'questions' | 'equipment' | 'data'>('calcs');
  const { readings, activeExperiment } = useStore();

  const tabs = [
    { id: 'calcs', label: 'Calculations', icon: <Calculator size={14} /> },
    { id: 'questions', label: 'Questions', icon: <HelpCircle size={14} /> },
    { id: 'equipment', label: 'Equipment Info', icon: <Info size={14} /> },
    { id: 'data', label: 'Recent Data', icon: <TableIcon size={14} /> },
  ];

  return (
    <div className="h-64 mt-4 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 flex gap-2">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={clsx(
               "text-[10px] font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1.5",
               activeTab === tab.id ? "bg-white text-primary-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"
             )}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
         {activeTab === 'calcs' && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             {calculations}
           </div>
         )}

         {activeTab === 'questions' && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             {questions}
           </div>
         )}

         {activeTab === 'equipment' && (
           <div className="space-y-4">
             <h4 className="text-sm font-bold text-slate-700">Apparatus Description</h4>
             <p className="text-[11px] text-slate-600 leading-relaxed">
               {activeExperiment?.description}
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Technical Standards</h5>
                   <ul className="text-[10px] text-slate-600 list-disc pl-4 space-y-1">
                      <li>TEMA Class R/C/B</li>
                      <li>ASME Section VIII Div 1</li>
                      <li>API 660 / ISO 16812</li>
                   </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sensor Calibration</h5>
                   <p className="text-[10px] text-slate-500 italic">All thermocouples are Type-K with a factory calibration bias of ±0.1°C. Flow meters are magnetic-inductive units.</p>
                </div>
             </div>
           </div>
         )}

         {activeTab === 'data' && (
           <div className="space-y-4">
             <h4 className="text-sm font-bold text-slate-700">Last 5 Readings</h4>
             {readings.length > 0 ? (
                <table className="w-full text-[10px] text-left border-collapse">
                   <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                         <th className="p-1">Time</th>
                         {Object.keys(readings[0].values).map(k => <th key={k} className="p-1">{k}</th>)}
                      </tr>
                   </thead>
                   <tbody>
                      {readings.slice(-5).map((r, i) => (
                         <tr key={i} className="border-b border-slate-50">
                            <td className="p-1 font-mono">{r.simulatedTime.toFixed(1)}s</td>
                            {Object.values(r.values).map((v, j) => <td key={j} className="p-1 font-mono">{v.toFixed(3)}</td>)}
                         </tr>
                      ))}
                   </tbody>
                </table>
             ) : (
                <p className="text-xs text-slate-400 italic">No data recorded.</p>
             )}
           </div>
         )}
      </div>
    </div>
  );
};
