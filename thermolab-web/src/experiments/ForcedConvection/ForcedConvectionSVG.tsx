
import React from 'react';
import { type ForcedConvectionState } from './ForcedConvectionModel';

interface ForcedConvectionSVGProps {
  state: ForcedConvectionState;
}

export const ForcedConvectionSVG: React.FC<ForcedConvectionSVGProps> = ({ state }) => {
  const getTemperatureColor = (temp: number) => {
    const t = Math.min(Math.max((temp - 25) / 100, 0), 1);
    const r = Math.round(59 + t * (239 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (68 - 246));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const dashOffset = (Date.now() / 100) * state.airVelocity * 15;

  return (
    <svg viewBox="0 0 700 400" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="ductGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Main Air Duct */}
      <g className="cursor-help">
         <title>Wind Tunnel Section (Transparent Inspection Wall)</title>
         <rect x="50" y="100" width="600" height="200" fill="rgba(241, 245, 249, 0.05)" stroke="#475569" strokeWidth="2" rx="10" />
         <rect x="50" y="100" width="600" height="15" fill="url(#ductGrad)" />
         <rect x="50" y="285" width="600" height="15" fill="url(#ductGrad)" />
         {/* Internal Honeycomb flow straightener */}
         <line x1="100" y1="115" x2="100" y2="285" stroke="#334155" strokeWidth="8" strokeDasharray="2 2" opacity="0.3" />
      </g>

      {/* Dynamic Air Velocity indicators */}
      {state.airVelocity > 0.1 && (
        <g opacity="0.4">
          {[130, 160, 190, 210, 240, 270].map(y => (
            <line
              key={y}
              x1="60" y1={y} x2="640" y2={y}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="20 10"
              style={{ strokeDashoffset: -dashOffset }}
            />
          ))}
        </g>
      )}

      {/* The Heated Specimen (Transverse Cylinder) */}
      <g className="cursor-help transition-all hover:scale-105" style={{ transformOrigin: '350px 200px' }}>
        <title>Copper Test Cylinder (D=20mm, L=150mm)</title>
        {/* Glow */}
        <circle cx="350" cy="200" r="35" fill={getTemperatureColor(state.T_surface)} opacity="0.2" />
        <circle cx="350" cy="200" r="30" fill={getTemperatureColor(state.T_surface)} stroke="#0f172a" strokeWidth="2" />
        {/* Detail: Polished metallic look */}
        <circle cx="340" cy="190" r="10" fill="white" opacity="0.2" />
        <text x="350" y="180" textAnchor="middle" className="text-[8px] font-black fill-white/80 uppercase">Heater Core</text>
      </g>

      {/* Sensor Cables & Blower housing */}
      <g transform="translate(650, 150)">
         <title>Induced Draft Centrifugal Blower</title>
         <circle cx="20" cy="50" r="40" fill="#334155" stroke="#0f172a" strokeWidth="2" />
         <circle cx="20" cy="50" r="10" fill="#1e293b" className={state.airVelocity > 0 ? "animate-spin" : ""} />
      </g>

      <path d="M 350,230 Q 350,350 450,380" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="5 2" />
      <circle cx="350" cy="210" r="3" fill="#ef4444" stroke="white" strokeWidth="1" />

      {/* Pitot Tube detail */}
      <g transform="translate(150, 200)">
         <title>Pitot-Static Probe (Air Velocity)</title>
         <path d="M 0,0 L 40,0 M 40,0 L 40,-20" stroke="#94a3b8" strokeWidth="2" fill="none" />
         <circle cx="0" cy="0" r="2" fill="#000" />
      </g>

      <text x="350" y="340" textAnchor="middle" className="text-[12px] font-black fill-slate-700 uppercase tracking-widest italic">External Forced Convection Analyzer (Hilpert Correlation)</text>
    </svg>
  );
};
