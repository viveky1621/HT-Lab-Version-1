
import React from 'react';
import { AnimatedPipe } from '../../components/shared/AnimatedPipe';
import { type DoublePipeState } from './DoublePipeModel';

interface DoublePipeSVGProps {
  state: DoublePipeState;
  mh: number;
  mc: number;
}

export const DoublePipeSVG: React.FC<DoublePipeSVGProps> = ({ state, mh, mc }) => {
  const n = state.Th.length;
  const Th_in = state.Thi;
  const Th_out = state.Th[n-1];
  const Tc_in = state.Tci;
  const Tc_out = state.isCounterCurrent ? state.Tc[0] : state.Tc[n-1];

  // Hot Side (Annulus): MH flow
  // Cold Side (Tube): MC flow

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Supports */}
      <g>
         <rect x="250" y="300" width="15" height="60" fill="#1e293b" />
         <rect x="535" y="300" width="15" height="60" fill="#1e293b" />
         <rect x="200" y="360" width="400" height="8" fill="#0f172a" rx="4" />
      </g>

      {/* Outer Shell (The "Big" Pipe) */}
      <g className="cursor-help">
        <title>Exchanger Shell (Annulus Section)</title>
        <rect x="180" y="140" width="440" height="120" fill="url(#metalGrad)" stroke="#0f172a" strokeWidth="1.5" rx="10" />
        <rect x="170" y="130" width="15" height="140" fill="#475569" rx="2" stroke="#0f172a" />
        <rect x="615" y="130" width="15" height="140" fill="#475569" rx="2" stroke="#0f172a" />
        <rect x="220" y="100" width="30" height="40" fill="#475569" stroke="#0f172a" />
        <rect x="550" y="260" width="30" height="40" fill="#475569" stroke="#0f172a" />
      </g>

      {/* ANNULUS FLUID FLOW (Hot) */}
      <AnimatedPipe
        points="235,50 235,200 565,200 565,350"
        flowRate={mh > 0 ? 0.8 : 0}
        temperature={(Th_in + Th_out) / 2}
        fluidType="hot"
        diameter={100}
        label="Shell-side Stream (Hot Fluid)"
      />

      {/* Inner Concentric Tube Material */}
      <g className="cursor-help">
        <title>Process Inner Tube (Concentric Core)</title>
        <rect x="100" y="185" width="600" height="30" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" rx="2" />
        <rect x="90" y="175" width="15" height="50" fill="#334155" rx="2" />
        <rect x="695" y="175" width="15" height="50" fill="#334155" rx="2" />
      </g>

      {/* TUBE SIDE FLUID FLOW (Cold) */}
      {/* Dynamic direction for Parallel/Counter-current */}
      <AnimatedPipe
        points="80,200 720,200"
        flowRate={mc > 0 ? 0.8 : 0}
        temperature={(Tc_in + Tc_out) / 2}
        fluidType="cold"
        diameter={18}
        reverse={state.isCounterCurrent}
        label={state.isCounterCurrent ? "Tube Flow (Counter-Current)" : "Tube Flow (Parallel)"}
      />

      {/* External Process Nozzles */}
      {/* Shell Side (Fixed positions) */}
      <AnimatedPipe points="235,20 235,100" flowRate={mh > 0 ? 0.5 : 0} temperature={Th_in} fluidType="hot" label="Utility Inlet" />
      <AnimatedPipe points="565,300 565,380" flowRate={mh > 0 ? 0.5 : 0} temperature={Th_out} fluidType="hot" label="Utility Outlet" />

      {/* Tube Side (Dyanmic) */}
      {state.isCounterCurrent ? (
        <>
          <AnimatedPipe points="770,200 700,200" flowRate={mc > 0 ? 0.5 : 0} temperature={Tc_in} fluidType="cold" label="Process Inlet" />
          <AnimatedPipe points="100,200 30,200" flowRate={mc > 0 ? 0.5 : 0} temperature={Tc_out} fluidType="cold" label="Process Outlet" />
        </>
      ) : (
        <>
          <AnimatedPipe points="30,200 100,200" flowRate={mc > 0 ? 0.5 : 0} temperature={Tc_in} fluidType="cold" label="Process Inlet" />
          <AnimatedPipe points="700,200 770,200" flowRate={mc > 0 ? 0.5 : 0} temperature={Tc_out} fluidType="cold" label="Process Outlet" />
        </>
      )}

      {/* Telemetry Annotations */}
      <g className="text-[10px] font-black fill-white/80 uppercase pointer-events-none">
        <text x="250" y="40">Hot In</text>
        <text x="580" y="375">Hot Out</text>
        <text x="20" y="180">Cold</text>
        <text x="740" y="180">Cold</text>
      </g>
    </svg>
  );
};
