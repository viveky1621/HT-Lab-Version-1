
import React from 'react';
import { type NaturalConvectionState } from './NaturalConvectionModel';

interface NaturalConvectionSVGProps {
  state: NaturalConvectionState;
}

export const NaturalConvectionSVG: React.FC<NaturalConvectionSVGProps> = ({ state }) => {
  const getTemperatureColor = (temp: number) => {
    const t = Math.min(Math.max((temp - 25) / 100, 0), 1);
    const r = Math.round(59 + t * (239 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (68 - 246));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-2xl">
      <defs>
        <filter id="heatGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Laboratory Enclosure */}
      <g className="cursor-help">
         <title>Environmental Enclosure (Shielded from Drafts)</title>
         <rect x="100" y="50" width="400" height="400" fill="rgba(30, 41, 59, 0.1)" stroke="#334155" strokeWidth="1" strokeDasharray="10 5" rx="10" />
         {/* Internal Grid */}
         <line x1="100" y1="150" x2="500" y2="150" stroke="#334155" strokeWidth="0.5" opacity="0.2" />
         <line x1="100" y1="250" x2="500" y2="250" stroke="#334155" strokeWidth="0.5" opacity="0.2" />
         <line x1="100" y1="350" x2="500" y2="350" stroke="#334155" strokeWidth="0.5" opacity="0.2" />
      </g>

      {/* Plume Animation */}
      {state.T_surface > 30 && (
        <g className="animate-pulse">
           {[220, 300, 380].map(x => (
             <path
               key={x}
               d={`M ${x},120 Q ${x+10},80 ${x},40`}
               fill="none"
               stroke="rgba(248, 113, 113, 0.3)"
               strokeWidth="8"
               strokeLinecap="round"
             />
           ))}
        </g>
      )}

      {/* Heated Plate Assembly */}
      <g className="cursor-help">
        <title>Heated Test Plate (Polished Surface)</title>
        {/* Heat Glow */}
        {state.T_surface > 50 && (
           <rect
             x="285" y="115" width="30" height="210"
             fill={getTemperatureColor(state.T_surface)}
             opacity="0.2"
             filter="url(#heatGlow)"
           />
        )}
        <rect
          x="290" y="120" width="20" height="200"
          fill={getTemperatureColor(state.T_surface)}
          stroke="#0f172a"
          strokeWidth="1.5"
          rx="2"
        />
        {/* Surface detail - polished finish lines */}
        <line x1="300" y1="120" x2="300" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </g>

      {/* Base / Mounting Stand */}
      <g transform="translate(250, 320)">
         <rect x="0" y="0" width="100" height="15" fill="#1e293b" rx="2" />
         <rect x="25" y="15" width="50" height="40" fill="#334155" />
         <rect x="10" y="55" width="80" height="10" fill="#0f172a" rx="2" />
      </g>

      {/* Sensor Cables */}
      <path d="M 310,220 Q 350,220 400,450" fill="none" stroke="#475569" strokeWidth="1" />
      <circle cx="310" cy="220" r="3" fill="#ef4444" stroke="white" strokeWidth="1">
         <title>Thermocouple Type-K (Surface Temperature)</title>
      </circle>

      {/* Ambient Sensor */}
      <g transform="translate(150, 400)">
         <circle r="4" fill="#3b82f6" stroke="white" strokeWidth="1">
            <title>Reference Ambient Sensor</title>
         </circle>
         <text x="10" y="4" className="text-[8px] font-black fill-slate-500 uppercase tracking-widest">Ambient Ref</text>
      </g>

      <text x="300" y="480" textAnchor="middle" className="text-[12px] font-black fill-slate-600 uppercase tracking-widest italic">Natural Convection Boundary Layer Rig</text>
    </svg>
  );
};
