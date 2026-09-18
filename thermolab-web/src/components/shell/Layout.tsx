
import React from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { InstrumentRack } from './InstrumentRack';
import { DataLog } from './DataLog';
import { Trends } from './Trends';
import { RigConsole } from './RigConsole';
import { useStore } from '../../core/state/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeExperiment, currentView } = useStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-white border-x border-slate-200 shadow-inner relative">
          {activeExperiment ? (
            <>
              {currentView === 'experiment' && (
                <div className="flex-1 relative flex flex-col min-h-0">
                  <RigConsole />
                  {children}
                </div>
              )}
              {currentView === 'datalog' && <DataLog />}
              {currentView === 'trends' && <Trends />}
              {currentView === 'theory' && (
                <div className="p-8 prose prose-slate max-w-none overflow-y-auto h-full bg-white">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">{activeExperiment.name} - Theory</h2>
                    <div className="space-y-6 text-slate-600 leading-relaxed">
                      <section>
                         <h3 className="text-xl font-bold text-slate-700 mb-2">Objective</h3>
                         <ul className="list-disc pl-5 space-y-1">
                            {activeExperiment.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                         </ul>
                      </section>
                      <section>
                         <h3 className="text-xl font-bold text-slate-700 mb-2">Background</h3>
                         <p>{activeExperiment.theory}</p>
                      </section>
                      <section>
                         <h3 className="text-xl font-bold text-slate-700 mb-2">Experimental Procedure</h3>
                         <ol className="list-decimal pl-5 space-y-1">
                            {activeExperiment.procedure.map((p, i) => <li key={i}>{p}</li>)}
                         </ol>
                      </section>
                      <section className="bg-red-50 p-4 rounded-lg border border-red-100">
                         <h3 className="text-lg font-bold text-red-700 mb-2">Safety Requirements</h3>
                         <ul className="list-disc pl-5 text-red-600 text-sm">
                            {activeExperiment.safety.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 text-slate-600">Welcome to ThermoLab</h2>
                <p>Select an experiment from the menu to begin your simulation.</p>
              </div>
            </div>
          )}
        </main>
        <InstrumentRack />
      </div>
    </div>
  );
};
