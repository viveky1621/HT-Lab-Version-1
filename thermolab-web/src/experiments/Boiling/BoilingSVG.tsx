
import React from 'react';
import { type BoilingState } from './BoilingModel';

interface BoilingSVGProps {
  state: BoilingState;
}

export const BoilingSVG: React.FC<BoilingSVGProps> = ({ state }) => {
  // Determine bubble count and size based on boiling regime
  const T_sat = 100 + (state.pressure - 1) * 20;
  const deltaTe = state.T_surface - T_sat;

  let bubbleCount = 0;
  let bubbleMaxRadius = 4;
  if (deltaTe > 0 && deltaTe < 5) bubbleCount = 5; // Start of nucleate
  else if (deltaTe >= 5 && deltaTe < 30) {
    bubbleCount = Math.floor(deltaTe * 1.5); // Fully nucleate
    bubbleMaxRadius = 6;
  }
  else if (deltaTe >= 30) {
    bubbleCount = 60; // Film/Transition
    bubbleMaxRadius = 10;
  }

  return (
    <svg viewBox="0 0 450 550" className="w-full h-full drop-shadow-xl">
      <defs>
        <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop offset="50%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="bubbleGrad">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Main Glass Vessel */}
      <rect x="100" y="50" width="250" height="420" fill="rgba(186, 230, 253, 0.2)" rx="15" />
      <rect x="100" y="50" width="250" height="420" fill="url(#glassReflect)" rx="15" pointerEvents="none" />
      <rect x="100" y="50" width="250" height="420" fill="none" stroke="#0369a1" strokeWidth="4" rx="15" />

      {/* Liquid Phase */}
      <rect x="105" y="160" width="240" height="305" fill="#bae6fd" opacity="0.6" rx="10" />

      {/* Wave at surface */}
      <path d="M 105,160 Q 135,150 165,160 T 225,160 T 285,160 T 345,160" fill="none" stroke="#0369a1" strokeWidth="2" opacity="0.5" />

      {/* Heating Surface Detail */}
      <g transform="translate(150, 420)">
         <rect x="0" y="0" width="150" height="40" fill={state.isTripped ? "#ef4444" : "#1e293b"} rx="5" />
         <rect x="10" y="5" width="130" height="5" fill="rgba(255,255,255,0.1)" rx="2" />
         <text x="75" y="25" textAnchor="middle" className="text-[9px] fill-slate-500 font-bold">PLATINUM WIRE</text>
      </g>

      {/* Bubbles Logic */}
      {!state.isTripped && [...Array(bubbleCount)].map((_, i) => {
         const x = 160 + (Math.sin(i * 1234.5) + 1) * 65;
         const y = 420 - (Date.now() / 15 % 300 + i * 15) % 300;
         const r = 2 + (Math.sin(i * 99.9) + 1) * (bubbleMaxRadius/2);
         if (y < 160) return null; // stop at surface
         return (
            <circle key={i} cx={x} cy={y} r={r} fill="url(#bubbleGrad)" />
         );
      })}

      {/* Safety Detailing */}
      <rect x="80" y="40" width="290" height="20" fill="#475569" rx="5" /> {/* Top Plate */}
      <rect x="215" y="10" width="20" height="30" fill="#334155" /> {/* Relief Valve */}

      {state.isTripped && (
        <g transform="translate(225, 250)">
           <rect x="-120" y="-30" width="240" height="60" fill="rgba(239, 68, 68, 0.9)" rx="10" />
           <text textAnchor="middle" className="text-sm font-black fill-white animate-pulse uppercase tracking-widest">CHF TRIP: OVERHEAT</text>
        </g>
      )}

      {/* Instruments */}
      <g transform="translate(360, 100)">
         <circle cx="0" cy="0" r="25" fill="white" stroke="#334155" strokeWidth="2" />
         <line x1="0" y1="0" x2={18 * Math.cos(state.pressure * 0.4)} y2={18 * Math.sin(state.pressure * 0.4)} stroke="#ef4444" strokeWidth="3" />
         <text y="40" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">P (bar)</text>
      </g>

      <text x="225" y="510" textAnchor="middle" className="text-[14px] font-black fill-slate-800 uppercase tracking-widest">Pool Boiling Research Cell</text>
    </svg>
  );
};
