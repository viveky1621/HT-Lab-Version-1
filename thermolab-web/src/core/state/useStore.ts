
import { create } from 'zustand';
import { type SimulationState, type UnitSystem, type ExperimentReading, type ExperimentConfig } from '../../types';

type View = 'experiment' | 'datalog' | 'theory' | 'trends' | 'report';

interface AppState {
  simulation: SimulationState;
  activeExperiment: ExperimentConfig | null;
  experiments: ExperimentConfig[];
  currentView: View;
  readings: ExperimentReading[];
  liveReadings: Record<string, number>;
  isSteady: boolean;
  currentRunId: number;

  // Equipment Configuration
  equipmentConfig: Record<string, any>;
  faults: Record<string, boolean>;
  safetyPermitSigned: boolean;

  // Actions
  setRunning: (isRunning: boolean) => void;
  signSafetyPermit: () => void;
  setTimeScale: (scale: number) => void;
  resetSimulation: () => void;
  toggleUnits: () => void;
  setActiveExperiment: (config: ExperimentConfig) => void;
  setExperiments: (exps: ExperimentConfig[]) => void;
  updateEquipmentConfig: (config: Record<string, any>) => void;
  toggleFault: (faultId: string) => void;
  setView: (view: View) => void;
  addReading: (reading: Omit<ExperimentReading, 'runId' | 'timestamp'>) => void;
  updateLiveReadings: (values: Record<string, number>, isSteady: boolean) => void;
  clearReadings: () => void;
  advanceTime: (dt: number) => void;
}

export const useStore = create<AppState>((set) => ({
  simulation: {
    isRunning: false,
    timeScale: 1,
    elapsedTime: 0,
    unitSystem: 'SI',
    isInstructorMode: false,
    showCalculations: false,
  },
  activeExperiment: null,
  experiments: [],
  currentView: 'experiment',
  readings: [],
  liveReadings: {},
  isSteady: false,
  currentRunId: 0,
  equipmentConfig: {},
  faults: {},
  safetyPermitSigned: false,

  setRunning: (isRunning) => set((state) => ({
    simulation: { ...state.simulation, isRunning: state.safetyPermitSigned ? isRunning : false }
  })),

  signSafetyPermit: () => set({ safetyPermitSigned: true }),

  setTimeScale: (timeScale) => set((state) => ({
    simulation: { ...state.simulation, timeScale }
  })),

  resetSimulation: () => set((state) => ({
    simulation: { ...state.simulation, elapsedTime: 0, isRunning: false },
    currentRunId: state.currentRunId + 1,
    liveReadings: state.activeExperiment ? { ...state.activeExperiment.initialConditions } : {},
    isSteady: false,
    faults: {},
    safetyPermitSigned: false,
  })),

  toggleUnits: () => set((state) => ({
    simulation: {
      ...state.simulation,
      unitSystem: state.simulation.unitSystem === 'SI' ? 'English' : 'SI'
    }
  })),

  setActiveExperiment: (activeExperiment) => set({
    activeExperiment,
    readings: [],
    liveReadings: { ...activeExperiment.initialConditions },
    isSteady: false,
    currentRunId: 0,
    currentView: 'experiment',
    equipmentConfig: { ...activeExperiment.initialConditions },
    faults: {},
    safetyPermitSigned: false,
    simulation: {
       isRunning: false,
       timeScale: 1,
       elapsedTime: 0,
       unitSystem: 'SI',
       isInstructorMode: false,
       showCalculations: false,
    }
  }),

  setExperiments: (experiments) => set({ experiments }),

  updateEquipmentConfig: (config) => set((state) => ({
    equipmentConfig: { ...state.equipmentConfig, ...config }
  })),

  toggleFault: (faultId) => set((state) => ({
    faults: { ...state.faults, [faultId]: !state.faults[faultId] }
  })),

  setView: (currentView) => set({ currentView }),

  addReading: (reading) => set((state) => ({
    readings: [...state.readings, {
      ...reading,
      runId: state.currentRunId,
      timestamp: Date.now()
    }]
  })),

  updateLiveReadings: (liveReadings, isSteady) => set({ liveReadings, isSteady }),

  clearReadings: () => set({ readings: [] }),

  advanceTime: (dt) => set((state) => ({
    simulation: {
      ...state.simulation,
      elapsedTime: state.simulation.elapsedTime + dt
    }
  })),
}));
