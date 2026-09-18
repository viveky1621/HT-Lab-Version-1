
export type UnitSystem = 'SI' | 'English';

export interface ExperimentReading {
  timestamp: number;
  simulatedTime: number;
  runId: number;
  values: Record<string, number>;
  stability: number; // 0 to 1
  isSteady: boolean;
  notes?: string;
}

export interface SimulationState {
  isRunning: boolean;
  timeScale: number;
  elapsedTime: number;
  unitSystem: UnitSystem;
  isInstructorMode: boolean;
  showCalculations: boolean;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  theory: string;
  objectives: string[];
  procedure: string[];
  safety: string[];
  parameters: Record<string, any>;
  initialConditions: Record<string, any>;
  faults?: Record<string, boolean>;
}

export interface Instrument {
  id: string;
  label: string;
  unit: string;
  precision: number;
  timeConstant: number;
  bias: number;
  noiseLevel: number;
}
