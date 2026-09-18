
import React from 'react';
import { type ConductionState } from './ConductionModel';

interface ConductionSVGProps {
  state: ConductionState;
  layers: { name: string; thickness: number; k: number }[];
}

export const ConductionSVG: React.FC<ConductionSVGProps> = ({ state, layers }) => {
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
        <pattern id="grain" width="10" height="10" patternUnits="userSpaceOnUse">
           <path d="M 0,0 L 5,5 M 10,0 L 5,10" stroke="white" strokeWidth="0.5" opacity="0.1" />
        </pattern>
      </defs>

      {/* Mounting Rig */}
      <rect x="50" y="300" width="600" height="15" fill="#334155" rx="2" />
      <rect x="100" y="250" width="20" height="50" fill="#1e293b" />
      <rect x="580" y="250" width="20" height="50" fill="#1e293b" />

      {/* Heater Housing */}
      <g className="cursor-help">
         <title>Heater Element (Electrical Resistance)</title>
         <rect x="50" y="80" width="40" height="180" fill="#1e293b" rx="2" />
         <rect x="60" y="90" width="20" height="160" fill="#ef4444" opacity={0.3 + (state.heaterPower / 200)} />
      </g>

      {/* Test Section Layers */}
      <g transform="translate(90, 70)">
        {layers.map((l, i) => {
          const x = i * 140;
          const color1 = getTemperatureColor(state.T[i]);
          const color2 = getTemperatureColor(state.T[i+1]);
          return (
            <g key={i} className="cursor-help transition-all hover:brightness-110">
              <title>{l.name} Interface Section (k = {l.k} W/mK)</title>
              <defs>
                <linearGradient id={`layer-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color1} />
                  <stop offset="100%" stopColor={color2} />
                </linearGradient>
              </defs>
              <rect x={x} y="0" width="140" height="200" fill={`url(#layer-grad-${i})`} stroke="#0f172a" strokeWidth="1" />
              <rect x={x} y="0" width="140" height="200" fill="url(#grain)" pointerEvents="none" />
              <text x={x + 70} y="230" textAnchor="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-widest">{l.name}</text>

              {/* Interface Thermocouple */}
              <g transform={`translate(${x}, 100)`}>
                 <line x1="0" y1="-30" x2="0" y2="30" stroke="#0f172a" strokeWidth="1.5" />
                 <circle r="4" fill="#ef4444" stroke="white" strokeWidth="1" className="animate-pulse" />
                 <text y="-45" textAnchor="middle" className="text-[8px] font-black fill-slate-900 uppercase">T{i}: {state.T[i].toFixed(1)}°C</text>
              </g>
            </g>
          );
        })}
        {/* Final Outgoing Interface */}
        <g transform={`translate(${layers.length * 140}, 100)`}>
            <circle r="4" fill="#ef4444" stroke="white" strokeWidth="1" />
            <text y="-45" textAnchor="middle" className="text-[8px] font-black fill-slate-900 uppercase">T{layers.length}: {state.T[layers.length].toFixed(1)}°C</text>
        </g>
      </g>

      {/* Cooling Jacket at the end (Visual) */}
      <rect x={90 + layers.length * 140} y="70" width="30" height="200" fill="#3b82f6" opacity="0.3" rx="2">
         <title>Heat Sink (Cooling Plate)</title>
      </rect>

      <text x="350" y="40" textAnchor="middle" className="text-[12px] font-black fill-slate-700 uppercase tracking-widest italic">Composite Wall steady-state conduction rig</text>
    </svg>
  );
};
