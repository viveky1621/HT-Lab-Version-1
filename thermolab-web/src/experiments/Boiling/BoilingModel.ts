
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface BoilingParams {
  surfaceArea: number;
  volume: number;
}

export interface BoilingState {
  T_surface: number;
  T_bulk: number;
  heaterPower: number;
  pressure: number; // bar
  isTripped: boolean;
}

export class BoilingModel {
  private params: BoilingParams;
  private state: BoilingState;

  private Cp_liquid = 4180;
  private h_fg = 2.257e6; // J/kg

  constructor(params: BoilingParams, initialState: Partial<BoilingState> = {}) {
    this.params = params;
    this.state = {
      T_surface: initialState.T_surface || 100,
      T_bulk: initialState.T_bulk || 100,
      heaterPower: initialState.heaterPower || 0,
      pressure: initialState.pressure || 1.0,
      isTripped: false,
    };
  }

  public step(dt: number): void {
    if (this.state.isTripped) return;

    const T_sat = 100 + (this.state.pressure - 1) * 20; // Simplified saturation curve
    const deltaT_e = this.state.T_surface - T_sat;

    // Nukiyama curve simplified
    let h = 0;
    if (deltaT_e <= 0) {
      h = 200; // Natural convection
    } else if (deltaT_e < 30) {
      h = 200 + 500 * Math.pow(deltaT_e, 2); // Nucleate boiling
    } else if (deltaT_e < 100) {
      h = 50000 * Math.pow(30/deltaT_e, 1.5); // Transition boiling
    } else {
      h = 1000 + 5 * deltaT_e; // Film boiling
      if (this.state.T_surface > 500) this.state.isTripped = true;
    }

    const derivatives = (t: number, y: number[]): number[] => {
      const Ts = y[0];
      const Tb = y[1];

      const q_boil = h * this.params.surfaceArea * (Ts - Tb);
      const dTs = (this.state.heaterPower - q_boil) / (0.2 * 400); // Surface block
      const dTb = (q_boil - 1000) / (this.params.volume * 1000 * 4180); // Bulk (minus loss)

      return [dTs, dTb];
    };

    const nextState = PhysicsEngine.rk4(0, [this.state.T_surface, this.state.T_bulk], dt, derivatives);
    this.state.T_surface = nextState[0];
    this.state.T_bulk = nextState[1];
  }

  public getState() {
    return this.state;
  }

  public setControls(q: number, p: number) {
    this.state.heaterPower = q;
    this.state.pressure = p;
  }
}
