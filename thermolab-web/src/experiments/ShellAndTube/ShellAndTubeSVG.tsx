
import React from 'react';
import { AnimatedPipe } from '../../components/shared/AnimatedPipe';
import { type ShellAndTubeState } from './ShellAndTubeModel';

interface ShellAndTubeSVGProps {
  state: ShellAndTubeState;
  tubeCount?: number;
}

export const ShellAndTubeSVG: React.FC<ShellAndTubeSVGProps> = ({ state, tubeCount = 40 }) => {
  const n = state.T_shell.length;
  const p = state.T_tube.length;
  const visibleTubes = Math.min(8, Math.max(3, Math.floor(tubeCount / 10)));

  return (
    <svg viewBox="0 0 800 450" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="shellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="headerGrad">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
      </defs>

      {/* Supporting Saddles */}
      <rect x="250" y="320" width="30" height="50" fill="#334155" rx="2" />
      <rect x="520" y="320" width="30" height="50" fill="#334155" rx="2" />

      {/* Shell Body */}
      <rect x="150" y="100" width="500" height="230" fill="url(#shellGrad)" stroke="#1e293b" strokeWidth="1.5" rx="15" />

      {/* Shell-side fluid effect (The "Background" flow) */}
      <rect x="160" y="110" width="480" height="210" fill="rgba(239, 68, 68, 0.05)" rx="10" />

      {/* Shell Nozzles */}
      <AnimatedPipe points="220,30 220,100" flowRate={state.m_shell > 0 ? 0.5 : 0} temperature={state.T_shell_in} fluidType="hot" label="Shell Inlet" />
      <AnimatedPipe points="580,330 580,400" flowRate={state.m_shell > 0 ? 0.5 : 0} temperature={state.T_shell[n-1]} fluidType="hot" label="Shell Outlet" />

      {/* Tube Bundle with Moving Fluids */}
      {[...Array(visibleTubes)].map((_, i) => {
        const yBase = 135 + (i * (160 / (visibleTubes - 1)));
        return (
          <g key={i}>
            {state.T_tube.map((pass, j) => {
               const yPos = yBase + (j * 8);
               const isForward = j % 2 === 0;
               return (
                  <AnimatedPipe
                    key={`${i}-${j}`}
                    points={`150,${yPos} 650,${yPos}`}
                    flowRate={state.m_tube > 0 ? 0.3 : 0}
                    temperature={pass[n/2]}
                    fluidType="cold"
                    diameter={5}
                    reverse={!isForward}
                    label={`Tube Pass ${j+1}`}
                  />
               );
            })}
          </g>
        );
      })}

      {/* Tube Sheets */}
      <rect x="140" y="90" width="10" height="250" fill="#1e293b" rx="2" />
      <rect x="650" y="90" width="10" height="250" fill="#1e293b" rx="2" />

      {/* Heads */}
      <path d="M 140,90 Q 70,90 70,215 Q 70,340 140,340 Z" fill="url(#headerGrad)" stroke="#1e293b" strokeWidth="1" />
      <path d="M 660,90 Q 730,90 720,215 Q 730,340 660,340 Z" fill="url(#headerGrad)" stroke="#1e293b" strokeWidth="1" />

      {/* Front Header nozzles */}
      <AnimatedPipe points="15,150 75,150" flowRate={state.m_tube > 0 ? 0.5 : 0} temperature={state.T_tube_in} fluidType="cold" label="Tube Inlet" />
      <AnimatedPipe points="75,290 15,290" flowRate={state.m_tube > 0 ? 0.5 : 0} temperature={state.T_tube[p-1][0]} fluidType="cold" label="Tube Outlet" />

      <text x="400" y="440" textAnchor="middle" className="text-[12px] font-black fill-slate-500 uppercase tracking-widest italic pointer-events-none">AES Type Shell-and-Tube System</text>
    </svg>
  );
};
