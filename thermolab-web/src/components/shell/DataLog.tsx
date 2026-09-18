import React from 'react';
import { useStore } from '../../core/state/useStore';
import { Download, Trash2, Table, FileText } from 'lucide-react';
import { ReportGenerator } from '../../core/reporting/ReportGenerator';
import { clsx } from 'clsx';

export const DataLog: React.FC = () => {
  const { readings, clearReadings, activeExperiment } = useStore();

  const generateReport = () => {
    if (!activeExperiment) return;
    const html = ReportGenerator.generateHTML(activeExperiment, readings);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.focus();
  };

  const exportCSV = () => {
    if (readings.length === 0) return;

    const headers = ['Timestamp', 'Simulated Time', 'Run ID', 'Steady State', ...Object.keys(readings[0].values)];
    const rows = readings.map(r => [
      new Date(r.timestamp).toISOString(),
      r.simulatedTime.toFixed(1),
      r.runId,
      r.isSteady ? 'Yes' : 'No',
      ...Object.values(r.values).map(v => v.toFixed(3))
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thermolab_${activeExperiment?.id || 'data'}_log.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
           <Table size={16} /> Recorded Observations
        </h3>
        <div className="flex gap-2">
          <button
            onClick={generateReport}
            disabled={readings.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded hover:bg-primary-700 disabled:opacity-50 transition-all"
          >
            <FileText size={14} /> Generate Report
          </button>
          <button
            onClick={exportCSV}
            disabled={readings.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700 disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={clearReadings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 text-xs font-bold rounded hover:bg-red-50"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {readings.length > 0 ? (
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="sticky top-0 bg-white border-b border-slate-200 shadow-sm">
              <tr>
                <th className="p-2 text-slate-400 font-bold uppercase">Time</th>
                <th className="p-2 text-slate-400 font-bold uppercase text-center">Run</th>
                {Object.keys(readings[0].values).map(key => (
                  <th key={key} className="p-2 text-slate-400 font-bold uppercase">{key}</th>
                ))}
                <th className="p-2 text-slate-400 font-bold uppercase text-center">Steady?</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2 font-mono text-slate-500">{r.simulatedTime.toFixed(1)}s</td>
                  <td className="p-2 text-center text-slate-600 font-bold">{r.runId}</td>
                  {Object.values(r.values).map((v, j) => (
                    <td key={j} className="p-2 font-mono font-bold text-slate-800">{v.toFixed(3)}</td>
                  ))}
                  <td className="p-2 text-center">
                    <span className={clsx(
                      "px-1.5 py-0.5 rounded-full font-bold",
                      r.isSteady ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {r.isSteady ? '✓' : '!'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
            No readings recorded yet. Click "RECORD READING" in the instrument rack.
          </div>
        )}
      </div>
    </div>
  );
};
