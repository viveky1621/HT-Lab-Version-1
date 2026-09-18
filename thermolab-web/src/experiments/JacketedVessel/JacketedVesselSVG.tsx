
import React from 'react';
import { type JacketedVesselState } from './JacketedVesselModel';

interface JacketedVesselSVGProps {
  state: JacketedVesselState;
}

export const JacketedVesselSVG: React.FC<JacketedVesselSVGProps> = ({ state }) => {
  const agitatorAngle = (Date.now() / 100) * state.agitationSpeed * 20;

  const getTemperatureColor = (temp: number) => {
    const t = Math.min(Math.max((temp - 20) / 60, 0), 1);
    const r = Math.round(59 + t * (239 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (68 - 246));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="vesselSteel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="30%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <radialGradient id="liquidReflect" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Jacket (Outer) */}
      <g className="cursor-help">
         <title>Thermal Jacket (Utility Side: {state.T_jacket.toFixed(1)}°C)</title>
         <rect x="180" y="140" width="240" height="280" fill={getTemperatureColor(state.T_jacket)} rx="25" opacity="0.4" />
         <rect x="180" y="140" width="240" height="280" fill="none" stroke="#475569" strokeWidth="3" rx="25" />
      </g>

      {/* Main Vessel */}
      <g className="cursor-help">
         <title>Batch Reactor Vessel (Product Side: {state.T_vessel.toFixed(1)}°C)</title>
         <rect x="200" y="80" width="200" height="320" fill={getTemperatureColor(state.T_vessel)} rx="20" />
         <rect x="200" y="80" width="200" height="320" fill="url(#liquidReflect)" rx="20" pointerEvents="none" />
         <rect x="200" y="80" width="200" height="320" fill="none" stroke="#334155" strokeWidth="4" rx="20" />
      </g>

      {/* Vessel Lid / Flange */}
      <g className="cursor-help">
         <title>Vessel Head Flange (Bolt-on)</title>
         <rect x="180" y="70" width="240" height="15" fill="#475569" rx="2" />
         <rect x="250" y="40" width="100" height="30" fill="#334155" />
      </g>

      {/* Agitator Assembly */}
      <g transform={`translate(300, 250)`} className="cursor-help">
        <title>Magnetic Drive Agitator (Speed: {(state.agitationSpeed * 100).toFixed(0)}%)</title>
        <rect x="-4" y="-180" width="8" height="260" fill="#1e293b" />
        <g transform={`rotate(${agitatorAngle})`}>
          <rect x="-70" y="60" width="140" height="25" fill="#0f172a" rx="4" />
          <rect x="-65" y="65" width="130" height="5" fill="rgba(255,255,255,0.1)" rx="2" />
          <rect x="-70" y="20" width="140" height="25" fill="#0f172a" rx="4" opacity="0.6" />
        </g>
      </g>

      {/* Utility Nozzles */}
      <g className="cursor-help">
         <title>Jacket Inlet (Hot/Cold Utility)</title>
         <rect x="100" y="160" width="80" height="20" fill="url(#vesselSteel)" stroke="#1e293b" strokeWidth="1" />
      </g>
      <g className="cursor-help">
         <title>Jacket Outlet</title>
         <rect x="420" y="360" width="80" height="20" fill="url(#vesselSteel)" stroke="#1e293b" strokeWidth="1" />
      </g>

      {/* Sensors */}
      <g transform="translate(230, 180)" className="cursor-help">
         <title>Immersion Thermowell (T_vessel)</title>
         <rect x="0" y="0" width="4" height="60" fill="#475569" />
         <circle cx="2" cy="60" r="4" fill="#ef4444" stroke="white" strokeWidth="1" />
      </g>

      <text x="300" y="460" textAnchor="middle" className="text-[12px] font-black fill-slate-800 uppercase tracking-widest italic pointer-events-none">Stirred Jacketed Reactor</text>
    </svg>
  );
};
