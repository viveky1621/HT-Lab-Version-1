
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface PinFinParams {
  length: number; // m
  diameter: number; // m
  k: number; // W/mK
  segments: number;
}

export interface PinFinState {
  T: number[]; // Temperature along fin
  T_base: number;
  T_ambient: number;
  h: number; // W/m2K
  heaterPower: number;
}

export class PinFinModel {
  private params: PinFinParams;
  private state: PinFinState;

  private rho_mat = 8000;
  private Cp_mat = 400;

  constructor(params: PinFinParams, initialState: Partial<PinFinState> = {}) {
    this.params = params;
    const n = params.segments;
    this.state = {
      T: new Array(n).fill(initialState.T_base || 25),
      T_base: initialState.T_base || 25,
      T_ambient: initialState.T_ambient || 25,
      h: initialState.h || 20,
      heaterPower: initialState.heaterPower || 0,
    };
  }

  public step(dt: number): void {
    const n = this.params.segments;
    const dx = this.params.length / n;
    const Ac = (Math.PI * Math.pow(this.params.diameter, 2)) / 4;
    const P = Math.PI * this.params.diameter;

    // First segment is the base heater
    // mass_base * Cp * dT_base/dt = Q_in - q_fin_base - q_loss_base
    const mass_base = 0.2; // base block mass

    const derivatives = (t: number, y: number[]): number[] => {
      // y: [T_base, T0, T1, ..., Tn-1]
      const Tb = y[0];
      const T = y.slice(1);
      const dTb = (this.state.heaterPower - (this.params.k * Ac * (Tb - T[0]) / dx) - 5 * (Tb - this.state.T_ambient)) / (mass_base * 400);

      const dT = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        const T_prev = i === 0 ? Tb : T[i-1];
        const T_next = i === n - 1 ? T[i] : T[i+1]; // Adiabatic tip simplification or T[i] for convective tip

        // k*Ac*(d2T/dx2) - h*P*(T-Ta) = rho*Ac*Cp*dT/dt
        const conduction = this.params.k * Ac * (T_prev - 2*T[i] + T_next) / (dx*dx);
        const convection = this.state.h * P * (T[i] - this.state.T_ambient);

        dT[i] = (conduction - convection) / (this.rho_mat * Ac * this.Cp_mat);
      }
      return [dTb, ...dT];
    };

    const nextState = PhysicsEngine.rk4(0, [this.state.T_base, ...this.state.T], dt, derivatives);
    this.state.T_base = nextState[0];
    this.state.T = nextState.slice(1);
  }

  public getState() {
    return this.state;
  }

  public setControls(q: number, h: number, Tamb: number) {
    this.state.heaterPower = q;
    this.state.h = h;
    this.state.T_ambient = Tamb;
  }
}
