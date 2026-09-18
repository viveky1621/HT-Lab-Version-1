
import React from 'react';
import { type RadiationState } from './RadiationModel';

interface RadiationSVGProps {
  state: RadiationState;
}

export const RadiationSVG: React.FC<RadiationSVGProps> = ({ state }) => {
  const getTemperatureColor = (temp: number) => {
    const t = Math.min(Math.max((temp - 25) / 200, 0), 1);
    const r = Math.round(59 + t * (255 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (0 - 246));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const detectorX = 150 + state.detectorDistance * 500;

  return (
    <svg viewBox="0 0 800 450" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="sourceGlow">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Optical Bench / Rail */}
      <g>
         <rect x="100" y="240" width="600" height="20" fill="#1e293b" rx="2" />
         <line x1="100" y1="235" x2="700" y2="235" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10 5" />
         {[...Array(11)].map((_, i) => (
            <g key={i}>
               <line x1={150 + i * 50} y1="240" x2={150 + i * 50} y2="250" stroke="#475569" strokeWidth="1" />
               <text x={150 + i * 50} y="265" textAnchor="middle" className="text-[8px] fill-slate-500">{i / 10}m</text>
            </g>
         ))}
      </g>

      {/* Radiation Source */}
      <g transform="translate(100, 100)" className="cursor-help transition-all hover:brightness-110">
        <title>Blackbody Source (Ceramic Cavity)</title>
        <rect x="0" y="0" width="50" height="140" fill="#0f172a" rx="5" stroke="#334155" />
        {/* Glowing Aperture */}
        <rect x="40" y="20" width="10" height="100" fill={getTemperatureColor(state.T_source)} rx="2" />
        {state.T_source > 100 && (
           <circle cx="50" cy="70" r="100" fill="url(#sourceGlow)" pointerEvents="none" />
        )}
        {/* Heat dissipation detail */}
        <rect x="-10" y="30" width="10" height="80" fill="#334155" />
        <text x="25" y="-15" textAnchor="middle" className="text-[9px] font-black fill-slate-400 uppercase tracking-tighter">Radiant Source</text>
      </g>

      {/* Radiation Wavefronts (Visual Representation) */}
      {state.T_source > 50 && (
        <g opacity={Math.min(1, (state.T_source - 50) / 200)}>
           {[0.3, 0.6, 0.9].map(o => (
              <path
                key={o}
                d={`M 160,120 Q ${160 + o * 100},170 160,220`}
                stroke="#f97316"
                strokeWidth="2"
                fill="none"
                opacity={1 - o}
                className="animate-pulse"
              />
           ))}
        </g>
      )}

      {/* Radiation Detector Carriage */}
      <g transform={`translate(${detectorX}, 130)`} className="cursor-help transition-all hover:brightness-110">
        <title>Infrared Radiopile Detector</title>
        <rect x="0" y="0" width="30" height="80" fill="#475569" rx="2" stroke="#1e293b" />
        <circle cx="0" cy="40" r="10" fill="#0f172a" stroke="#1e293b" />
        <circle cx="0" cy="40" r="4" fill="#ef4444" className="animate-pulse" />
        <text x="15" y="-15" textAnchor="middle" className="text-[9px] font-black fill-slate-400 uppercase tracking-tighter">Sensor</text>

        {/* Digital display on sensor carriage */}
        <rect x="5" y="10" width="20" height="12" fill="#000" rx="1" />
        <text x="15" y="19" textAnchor="middle" className="text-[6px] fill-emerald-500 font-mono">READY</text>
      </g>

      <text x="400" y="300" textAnchor="middle" className="text-[12px] font-black fill-slate-700 uppercase tracking-widest italic">Precision Optical bench for Radiation Laws</text>
    </svg>
  );
};
