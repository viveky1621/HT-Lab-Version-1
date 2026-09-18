
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface AirCooledParams {
  tubeArea: number; // m2
  finEfficiency: number;
  fanMaxFlow: number; // m3/s
  segments: number;
}

export interface AirCooledState {
  T_process: number[];
  T_air_out: number[];
  m_process: number;
  fanSpeed: number; // 0-1
  T_inlet: number;
  T_ambient: number;
}

export class AirCooledModel {
  private params: AirCooledParams;
  private state: AirCooledState;
  private Cp_water = 4180;
  private Cp_air = 1005;
  private rho_water = 1000;
  private rho_air = 1.2;

  constructor(params: AirCooledParams, initialState: Partial<AirCooledState> = {}) {
    this.params = params;
    const n = params.segments;
    this.state = {
      T_process: new Array(n).fill(initialState.T_inlet || 80),
      T_air_out: new Array(n).fill(initialState.T_ambient || 25),
      m_process: initialState.m_process || 0.5,
      fanSpeed: initialState.fanSpeed || 0.5,
      T_inlet: initialState.T_inlet || 80,
      T_ambient: initialState.T_ambient || 25,
    };
  }

  public step(dt: number): void {
    const n = this.params.segments;
    const dx = 1.0 / n;
    const dA = this.params.tubeArea * dx;

    const m_air = this.params.fanMaxFlow * this.state.fanSpeed * this.rho_air;

    // Convection coefficients
    const h_process = 1000 * Math.pow(this.state.m_process / 0.5, 0.8);
    const h_air = 50 * Math.pow(this.state.fanSpeed, 0.6) * this.params.finEfficiency;
    const U = 1 / (1/h_process + 1/h_air);

    const derivatives = (t: number, y: number[]): number[] => {
      const Tp = y.slice(0, n);
      const dTp = new Array(n).fill(0);

      for (let i = 0; i < n; i++) {
        const Tp_prev = i === 0 ? this.state.T_inlet : Tp[i-1];

        // Air side is cross-flow, but we simplify to local balance
        // m_air * Cp_air * (T_air_out - T_ambient) = U * dA * (Tp - T_air_avg)
        // Let's assume air-side is steady-state relative to process side
        const m_air_local = m_air / n;
        const T_air_out_i = m_air_local > 0
          ? this.state.T_ambient + (U * dA * (Tp[i] - this.state.T_ambient)) / (m_air_local * this.Cp_air + U * dA / 2)
          : Tp[i];

        const q_transfer = U * dA * (Tp[i] - (T_air_out_i + this.state.T_ambient) / 2);

        dTp[i] = (this.state.m_process * this.Cp_water * (Tp_prev - Tp[i]) - q_transfer) / (this.rho_water * (this.params.tubeArea * 0.01 / n) * this.Cp_water);
      }
      return dTp;
    };

    const nextState = PhysicsEngine.rk4(0, this.state.T_process, dt, derivatives);
    this.state.T_process = nextState;

    // Update air out (quasi-steady)
    const m_air_local = m_air / n;
    const h_air_local = 50 * Math.pow(this.state.fanSpeed, 0.6) * this.params.finEfficiency;
    const U_local = 1 / (1/h_process + 1/h_air_local);
    for (let i = 0; i < n; i++) {
       this.state.T_air_out[i] = m_air_local > 0
          ? this.state.T_ambient + (U_local * dA * (this.state.T_process[i] - this.state.T_ambient)) / (m_air_local * this.Cp_air + U_local * dA / 2)
          : this.state.T_process[i];
    }
  }

  public getState() {
    return this.state;
  }

  public setControls(Ti: number, Tamb: number, mp: number, fan: number) {
    this.state.T_inlet = Ti;
    this.state.T_ambient = Tamb;
    this.state.m_process = mp;
    this.state.fanSpeed = fan;
  }
}
