
import React from 'react';
import { type PinFinState } from './PinFinModel';

interface PinFinSVGProps {
  state: PinFinState;
  material?: string;
}

export const PinFinSVG: React.FC<PinFinSVGProps> = ({ state, material = 'Aluminum' }) => {
  const getTemperatureColor = (temp: number) => {
    const t = Math.min(Math.max((temp - 25) / 100, 0), 1);
    const r = Math.round(59 + t * (239 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (68 - 246));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <svg viewBox="0 0 700 400" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Main Heated Base Block */}
      <g className="cursor-help">
         <title>Heated Base Block (Ceramic Encapsulated Heater)</title>
         <rect x="50" y="100" width="120" height="150" fill="url(#baseGrad)" stroke="#0f172a" strokeWidth="1.5" rx="5" />
         {/* Cooling fins on base */}
         {[110, 130, 150, 170, 190, 210, 230].map(y => (
            <line key={y} x1="50" y1={y} x2="170" y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
         ))}
         <rect x="55" y="105" width="110" height="140" fill={getTemperatureColor(state.T_base)} opacity="0.1" />
      </g>

      {/* The Pin Fin Specimen */}
      <g className="cursor-help">
        <title>{material} Pin Fin (Experimental Specimen)</title>
        {state.T.map((t, i) => (
          <rect
            key={i}
            x={170 + i * (450 / state.T.length)}
            y="160"
            width={450 / state.T.length + 1}
            height="30"
            fill={getTemperatureColor(t)}
            stroke="none"
          />
        ))}
        {/* Metal Grain Detail */}
        <rect x="170" y="160" width="450" height="30" fill="none" stroke="#0f172a" strokeWidth="1.5" rx="2" />
        <rect x="170" y="160" width="450" height="10" fill="rgba(255,255,255,0.1)" />
      </g>

      {/* Thermocouple Probes - Industrial Detail */}
      {[0, 4, 9, 14, 19].map((idx, i) => {
         const x = 170 + idx * (450 / state.T.length) + 10;
         const temp = state.T[idx];
         return (
            <g key={idx} className="cursor-help transition-all hover:brightness-125">
               <title>Digital Thermocouple T{i+1}: {temp.toFixed(1)}°C</title>
               <line x1={x} y1="160" x2={x} y2="130" stroke="#475569" strokeWidth="1" />
               <rect x={x-4} y="125" width="8" height="8" fill="#1e293b" rx="1" />
               <circle cx={x} cy="120" r="3" fill="#ef4444" stroke="white" strokeWidth="0.5" />
            </g>
         );
      })}

      {/* Duct / Air Flow Housing */}
      <rect x="170" y="80" width="450" height="190" fill="rgba(148, 163, 184, 0.05)" stroke="#334155" strokeWidth="1" strokeDasharray="5 5" rx="5" />

      {/* Air Flow Animation */}
      {state.h > 10 && (
         <g opacity="0.3">
            {[100, 140, 210, 250].map(y => (
               <line
                  key={y}
                  x1="180" y1={y} x2="600" y2={y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  className="animate-fluid-forward"
                  style={{ '--flow-speed': '1.5s' } as React.CSSProperties}
               />
            ))}
         </g>
      )}

      {/* Labels */}
      <g className="text-[9px] font-black fill-slate-500 uppercase tracking-widest pointer-events-none">
         <text x="70" y="90">Source Head</text>
         <text x="350" y="290" textAnchor="middle">Extended Surface Profile Section</text>
      </g>

      <text x="350" y="340" textAnchor="middle" className="text-[12px] font-black fill-slate-700 uppercase tracking-widest italic">1D Heat Conduction extended surface analyzer</text>
    </svg>
  );
};
