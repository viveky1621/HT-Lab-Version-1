
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface ConductionParams {
  area: number;
  layers: { k: number; thickness: number; name: string }[];
}

export interface ConductionState {
  T: number[]; // Temperature at interfaces [T0, T1, T2, ...]
  heaterPower: number;
  T_ambient: number;
}

export class ConductionModel {
  private params: ConductionParams;
  private state: ConductionState;

  constructor(params: ConductionParams, initialState: Partial<ConductionState> = {}) {
    this.params = params;
    const n = params.layers.length;
    this.state = {
      T: new Array(n + 1).fill(initialState.T_ambient || 25),
      heaterPower: initialState.heaterPower || 20,
      T_ambient: initialState.T_ambient || 25,
    };
  }

  public step(dt: number): void {
    const n = this.params.layers.length;
    const mass_layer = 0.5; // simplified mass per layer
    const Cp = 800;

    // Conduction resistances R = L / (k * A)
    const R = this.params.layers.map(l => l.thickness / (l.k * this.params.area));
    const h_ext = 10; // external convection
    const R_ext = 1 / (h_ext * this.params.area);

    const derivatives = (t: number, y: number[]): number[] => {
      // y: [T0, T1, ..., Tn]
      const T = y;
      const dT = new Array(n + 1).fill(0);

      // Node 0: Heater interface
      // Q_in - (T0 - T1)/R0 = C*dT0/dt
      dT[0] = (this.state.heaterPower - (T[0] - T[1]) / R[0]) / (mass_layer * Cp);

      // Interior Nodes
      for (let i = 1; i < n; i++) {
        // (T[i-1] - T[i])/R[i-1] - (T[i] - T[i+1])/R[i] = C*dTi/dt
        dT[i] = ((T[i-1] - T[i]) / R[i-1] - (T[i] - T[i+1]) / R[i]) / (mass_layer * Cp);
      }

      // External Interface Node
      // (T[n-1] - T[n])/R[n-1] - (T[n] - Tamb)/R_ext = C*dTn/dt
      dT[n] = ((T[n-1] - T[n]) / R[n-1] - (T[n] - this.state.T_ambient) / R_ext) / (mass_layer * Cp);

      return dT;
    };

    const nextState = PhysicsEngine.rk4(0, this.state.T, dt, derivatives);
    this.state.T = nextState;
  }

  public getState() {
    return this.state;
  }

  public setControls(q: number, Tamb: number) {
    this.state.heaterPower = q;
    this.state.T_ambient = Tamb;
  }
}
