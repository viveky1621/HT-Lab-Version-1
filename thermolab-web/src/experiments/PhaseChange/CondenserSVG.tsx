
import React from 'react';
import { AnimatedPipe } from '../../components/shared/AnimatedPipe';
import { type CondenserState } from './PhaseChangeModel';

interface CondenserSVGProps {
  state: CondenserState;
}

export const CondenserSVG: React.FC<CondenserSVGProps> = ({ state }) => {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="condenserShell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="20%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <filter id="mist">
           <feGaussianBlur stdDeviation="3" result="blur" />
        </filter>
      </defs>

      {/* Main Structural Frame */}
      <g>
         <rect x="150" y="380" width="500" height="20" fill="#1e293b" rx="2" />
         <rect x="200" y="250" width="12" height="130" fill="#334155" />
         <rect x="590" y="250" width="12" height="130" fill="#334155" />
      </g>

      {/* Condenser Shell */}
      <g className="cursor-help">
         <title>Shell-and-Tube Condenser (Horizontal TEMA E-Type)</title>
         <rect x="180" y="100" width="440" height="200" fill="url(#condenserShell)" stroke="#0f172a" strokeWidth="1.5" rx="10" />
         {/* Detail: Expansion Bellows / Reinforcement */}
         <rect x="280" y="100" width="20" height="200" fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
         <rect x="480" y="100" width="20" height="200" fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      </g>

      {/* Vapor Inlet */}
      <g className="cursor-help">
         <title>Vapor Inlet (Process Stream: {state.T_vapor.toFixed(1)}°C)</title>
         <AnimatedPipe points="400,20 400,100" flowRate={0.5} temperature={state.T_vapor} fluidType="steam" label="Process Vapor In" />
         <rect x="370" y="70" width="60" height="15" fill="#334155" rx="2" /> {/* Flange */}
      </g>

      {/* Internal Coolant Bundle - Visual Representation */}
      <g opacity="0.3" pointerEvents="none">
         {[130, 150, 170, 190, 210, 230, 250, 270].map(y => (
            <line key={y} x1="190" y1={y} x2="610" y2={y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />
         ))}
      </g>

      {/* Coolant Piping System */}
      <g className="cursor-help">
         <title>Coolant Side (CW Circulation)</title>
         <AnimatedPipe points="100,150 180,150" flowRate={0.5} temperature={state.T_coolant_in} fluidType="cold" label="Cooling Water Supply" />
         <AnimatedPipe points="620,200 700,200" flowRate={0.5} temperature={state.T_coolant_out} fluidType="cold" label="Cooling Water Return" />
      </g>

      {/* Condensate Accumulator Section (Liquid buildup) */}
      <g className="cursor-help" transform="translate(350, 300)">
         <title>Condensate Accumulator (Liquid Product Storage)</title>
         <rect x="0" y="0" width="100" height="80" fill="rgba(186, 230, 253, 0.4)" stroke="#0369a1" strokeWidth="2" rx="5" />
         <rect x="0" y="20" width="100" height="60" fill="#7dd3fc" opacity="0.8" rx="2" /> {/* Liquid level */}
         {/* Ripples */}
         <ellipse cx="50" cy="20" rx="45" ry="3" fill="none" stroke="white" opacity="0.4" />
      </g>

      {/* Condensate Product Outlet */}
      <AnimatedPipe points="400,380 400,450" flowRate={0.2} temperature={state.T_condensate} fluidType="cold" label="Condensate Product Line" />

      {/* Vapor Mist (Visual Effect) */}
      {state.m_vapor > 0 && (
         <rect x="190" y="110" width="420" height="80" fill="white" opacity="0.1" filter="url(#mist)" pointerEvents="none" />
      )}

      {/* Labels */}
      <g className="text-[9px] font-black fill-slate-900 uppercase tracking-tighter pointer-events-none">
        <text x="350" y="45">Vapor Overhead</text>
        <text x="70" y="140">CW Supply</text>
        <text x="680" y="190">CW Return</text>
        <text x="415" y="430">Liquid Outlet</text>
      </g>

      <text x="400" y="480" textAnchor="middle" className="text-[12px] font-black fill-slate-700 uppercase tracking-widest italic">Phase Change / Total Condensation Module</text>
    </svg>
  );
};
