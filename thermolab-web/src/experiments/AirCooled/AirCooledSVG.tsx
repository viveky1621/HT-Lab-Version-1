
import React from 'react';
import { AnimatedPipe } from '../../components/shared/AnimatedPipe';
import { type AirCooledState } from './AirCooledModel';

interface AirCooledSVGProps {
  state: AirCooledState;
}

export const AirCooledSVG: React.FC<AirCooledSVGProps> = ({ state }) => {
  const n = state.T_process.length;
  const fanRotation = (Date.now() / 100) * state.fanSpeed * 40;

  return (
    <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="galvSteel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="20%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      <rect x="50" y="450" width="700" height="20" fill="#94a3b8" rx="2" />
      <rect x="150" y="300" width="20" height="150" fill="#475569" />
      <rect x="630" y="300" width="20" height="150" fill="#475569" />

      <rect x="100" y="200" width="600" height="120" fill="url(#galvSteel)" stroke="#1e293b" strokeWidth="1" rx="5" />

      <g opacity="0.8">
        {[210, 220, 230, 240, 250, 260, 270, 280, 290, 300].map(y => (
          <line key={y} x1="110" y1={y} x2="690" y2={y} stroke="#1e293b" strokeWidth="1.5" />
        ))}
        {[...Array(20)].map((_, i) => (
           <line key={i} x1={150 + i * 25} y1="210" x2={150 + i * 25} y2="300" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        ))}
      </g>

      <g transform={`translate(400, 380)`} className="cursor-help">
        <title>Induced Draft Fan (Efficiency: 85%)</title>
        <circle r="60" fill="#cbd5e1" stroke="#334155" strokeWidth="3" />
        <g transform={`rotate(${fanRotation})`}>
          {[0, 90, 180, 270].map(angle => (
             <g key={angle} transform={`rotate(${angle})`}>
                <path d="M -5,-50 L 5,-50 L 15,0 L -15,0 Z" fill="#0f172a" />
             </g>
          ))}
          <circle r="15" fill="#1e293b" />
        </g>
      </g>

      {/* Upward Air Flow Visualization */}
      {state.fanSpeed > 0.1 && (
        <g opacity={state.fanSpeed * 0.4}>
          {[200, 400, 600].map(x => (
            <path
              key={x}
              d={`M ${x},450 L ${x},150`}
              stroke="#38bdf8"
              strokeWidth="4"
              fill="none"
              strokeDasharray="15 15"
              style={{ animation: 'fluid-flow 1s linear infinite' }}
              className="pointer-events-none"
            />
          ))}
        </g>
      )}

      {/* Process Stream Animation */}
      <AnimatedPipe points="20,220 100,220" flowRate={state.m_process > 0 ? 0.5 : 0} temperature={state.T_inlet} fluidType="hot" label="Process In" />
      <AnimatedPipe points="100,250 700,250" flowRate={state.m_process > 0 ? 0.5 : 0} temperature={(state.T_inlet + state.T_process[n-1]) / 2} fluidType="hot" label="Bundle Flow" diameter={60} />
      <AnimatedPipe points="700,280 780,280" flowRate={state.m_process > 0 ? 0.5 : 0} temperature={state.T_process[n-1]} fluidType="hot" label="Process Out" />

      <text x="400" y="480" textAnchor="middle" className="text-[12px] font-black fill-slate-700 uppercase tracking-widest italic pointer-events-none">Air-Side Heat Rejection Unit (API 661)</text>
    </svg>
  );
};
