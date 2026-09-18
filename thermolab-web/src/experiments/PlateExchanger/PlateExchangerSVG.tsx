
import React from 'react';
import { AnimatedPipe } from '../../components/shared/AnimatedPipe';
import { type PlateExchangerState } from './PlateExchangerModel';

interface PlateExchangerSVGProps {
  state: PlateExchangerState;
  plateCount?: number;
}

export const PlateExchangerSVG: React.FC<PlateExchangerSVGProps> = ({ state, plateCount = 16 }) => {
  const visiblePlates = Math.min(25, plateCount);
  const isCounter = state.isCounterCurrent;

  // Fluid direction points based on arrangement
  // Hot Fluid: Fixed Top -> Bottom
  // Cold Fluid: Reversible

  return (
    <svg viewBox="0 0 800 450" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="frameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Frame Components */}
      <rect x="100" y="380" width="600" height="15" fill="#334155" rx="2" />
      <rect x="100" y="30" width="600" height="15" fill="#334155" rx="2" />
      <rect x="120" y="20" width="40" height="380" fill="url(#frameGrad)" rx="4" stroke="#000" strokeWidth="1" />
      <rect x={160 + visiblePlates * 15} y="20" width="30" height="380" fill="url(#frameGrad)" rx="4" stroke="#000" strokeWidth="1" />

      {/* Plate Stack Visual */}
      <g>
        {[...Array(visiblePlates)].map((_, i) => (
          <g key={i} transform={`translate(${160 + i * 15}, 40)`}>
             <rect
               width="12"
               height="340"
               fill={i % 2 === 0 ? "#cbd5e1" : "#94a3b8"}
               stroke="#1e293b"
               strokeWidth="0.5"
               rx="1"
             />
             {/* Micro-flow representation within plates (visual only) */}
             <rect x="4" y="20" width="4" height="300" fill={i % 2 === 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)"} />
          </g>
        ))}
      </g>

      {/* Connections with Dynamic Flow Direction */}
      {/* Hot Stream: Always In (Top) -> Out (Bottom) */}
      <g transform="translate(50, 100)">
         <title>Process Hot Inlet</title>
         <AnimatedPipe points="0,0 80,0" flowRate={state.mh > 0 ? 0.5 : 0} temperature={state.Thi} fluidType="hot" label="Hot In" />
      </g>
      <g transform="translate(50, 320)">
         <title>Process Hot Outlet</title>
         <AnimatedPipe points="80,0 0,0" flowRate={state.mh > 0 ? 0.5 : 0} temperature={state.Th[state.Th.length-1]} fluidType="hot" label="Hot Out" />
      </g>

      {/* Cold Stream: Reversible */}
      <g transform="translate(750, 120)">
         <title>{isCounter ? 'Cold Process Out' : 'Cold Process In'}</title>
         <AnimatedPipe
           points={isCounter ? "0,0 80,0" : "80,0 0,0"}
           flowRate={state.mc > 0 ? 0.5 : 0}
           temperature={isCounter ? state.Tc[0] : state.Tci}
           fluidType="cold"
           label={isCounter ? "Cold Out" : "Cold In"}
         />
      </g>
      <g transform="translate(750, 300)">
         <title>{isCounter ? 'Cold Process In' : 'Cold Process Out'}</title>
         <AnimatedPipe
           points={isCounter ? "80,0 0,0" : "0,0 80,0"}
           flowRate={state.mc > 0 ? 0.5 : 0}
           temperature={isCounter ? state.Tci : state.Tc[state.Tc.length-1]}
           fluidType="cold"
           label={isCounter ? "Cold In" : "Cold Out"}
         />
      </g>

      {/* Flow Path Logic Visualizer (Behind plates) */}
      <text x="400" y="425" textAnchor="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-widest pointer-events-none">
         {isCounter ? 'Mode: Counter-Current Flow' : 'Mode: Parallel Flow'}
      </text>
    </svg>
  );
};
