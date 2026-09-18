
import React, { useMemo } from 'react';
import { clsx } from 'clsx';

interface AnimatedPipeProps {
  points: string; // SVG polyline points
  flowRate: number; // 0 to 1 (controls speed)
  temperature: number; // Celsius (controls color)
  fluidType: 'hot' | 'cold' | 'steam' | 'air';
  diameter?: number;
  label?: string;
  reverse?: boolean;
}

export const AnimatedPipe: React.FC<AnimatedPipeProps> = ({
  points,
  flowRate,
  temperature,
  fluidType,
  diameter = 8,
  label,
  reverse = false
}) => {
  const fluidColor = useMemo(() => {
    if (fluidType === 'steam') return '#e2e8f0';
    if (fluidType === 'air') return '#bae6fd';

    // Industrial color scale
    // 20C (Blue) -> 80C (Red)
    const t = Math.min(Math.max((temperature - 20) / 60, 0), 1);
    const r = Math.round(59 + t * (239 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (68 - 246));

    return `rgb(${r}, ${g}, ${b})`;
  }, [temperature, fluidType]);

  // Calculate speed based on flowRate
  // Higher flow rate = shorter duration
  const flowSpeed = flowRate > 0 ? (2 / Math.max(flowRate, 0.1)) : 0;

  const tooltipText = `${label || (fluidType === 'hot' ? 'Hot Stream' : 'Cold Stream')}: ${temperature.toFixed(1)}°C`;

  return (
    <g className="pipe-group group cursor-help transition-all duration-300 hover:brightness-125">
      <title>{tooltipText}</title>

      {/* Pipe Casting (Outer Shadow) */}
      <polyline
        points={points}
        fill="none"
        stroke="#0f172a"
        strokeWidth={diameter + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Pipe Metal Layer */}
      <polyline
        points={points}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={diameter + 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fluid Core */}
      <polyline
        points={points}
        fill="none"
        stroke={fluidColor}
        strokeWidth={diameter}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Moving Particles / Bubbles Overlay */}
      {flowRate > 0.001 && (
        <polyline
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={Math.max(diameter - 4, 2)}
          strokeDasharray="10, 30"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={clsx(
            "pointer-events-none transition-all duration-500",
            reverse ? "animate-fluid-reverse" : "animate-fluid-forward"
          )}
          style={{
            '--flow-speed': `${flowSpeed}s`
          } as React.CSSProperties}
        />
      )}

      {/* Surface Reflection */}
      <polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={diameter / 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(0, ${-diameter/4})`}
        className="pointer-events-none"
      />
    </g>
  );
};
