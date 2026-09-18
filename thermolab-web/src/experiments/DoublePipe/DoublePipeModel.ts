
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface DoublePipeParams {
  length: number; // m
  di_inner: number; // m
  do_inner: number; // m
  di_outer: number; // m
  k_wall: number; // W/mK
  segments: number;
}

export interface DoublePipeState {
  Th: number[]; // Temperature of hot fluid in each segment
  Tc: number[]; // Temperature of cold fluid in each segment
  Tw: number[]; // Wall temperatures
  mh: number; // mass flow hot kg/s
  mc: number; // mass flow cold kg/s
  Thi: number; // Inlet hot
  Tci: number; // Inlet cold
  isCounterCurrent: boolean;
}

export class DoublePipeModel {
  private params: DoublePipeParams;
  private state: DoublePipeState;

  // Material properties (simplified for now)
  private Cp_water = 4180; // J/kgK
  private rho_water = 1000; // kg/m3

  constructor(params: DoublePipeParams, initialState: Partial<DoublePipeState> = {}) {
    this.params = params;
    const n = params.segments;
    this.state = {
      Th: new Array(n).fill(initialState.Thi || 70),
      Tc: new Array(n).fill(initialState.Tci || 20),
      Tw: new Array(n).fill(45),
      mh: initialState.mh || 0.1,
      mc: initialState.mc || 0.2,
      Thi: initialState.Thi || 70,
      Tci: initialState.Tci || 20,
      isCounterCurrent: initialState.isCounterCurrent ?? true,
    };
  }

  public step(dt: number, faults: Record<string, boolean> = {}): void {
    const n = this.params.segments;
    const dx = this.params.length / n;
    const Ai = Math.PI * this.params.di_inner * dx;
    const Ao = Math.PI * this.params.do_inner * dx;

    // Segment volumes
    const Vh = (Math.PI * Math.pow(this.params.di_inner, 2) / 4) * dx;
    const Vo = (Math.PI * (Math.pow(this.params.di_outer, 2) - Math.pow(this.params.do_inner, 2)) / 4) * dx;

    // Convection coefficients
    let hi = this.calculateHi(this.state.mh);
    let ho = this.calculateHo(this.state.mc);

    // Apply Faults
    if (faults.fouling) {
       hi *= 0.65;
       ho *= 0.65;
    }
    if (faults.blockage) {
       // effectively reduces flow rate internally
    }

    // Derivatives function
    const derivatives = (t: number, y: number[]): number[] => {
      const Th = y.slice(0, n);
      const Tc = y.slice(n, 2 * n);
      const dTh = new Array(n).fill(0);
      const dTc = new Array(n).fill(0);

      const effectiveMh = faults.blockage ? this.state.mh * 0.5 : this.state.mh;
      const effectiveMc = faults.blockage ? this.state.mc * 0.5 : this.state.mc;

      for (let i = 0; i < n; i++) {
        const Th_prev = i === 0 ? this.state.Thi : Th[i-1];
        const q_conv_h = hi * Ai * (Th[i] - this.state.Tw[i]);
        dTh[i] = (effectiveMh * this.Cp_water * (Th_prev - Th[i]) - q_conv_h) / (this.rho_water * Vh * this.Cp_water);

        let Tc_prev_val;
        if (this.state.isCounterCurrent) {
          Tc_prev_val = i === n - 1 ? this.state.Tci : Tc[i+1];
          const q_conv_c = ho * Ao * (this.state.Tw[i] - Tc[i]);
          dTc[i] = (effectiveMc * this.Cp_water * (Tc_prev_val - Tc[i]) + q_conv_c) / (this.rho_water * Vo * this.Cp_water);
        } else {
          Tc_prev_val = i === 0 ? this.state.Tci : Tc[i-1];
          const q_conv_c = ho * Ao * (this.state.Tw[i] - Tc[i]);
          dTc[i] = (effectiveMc * this.Cp_water * (Tc_prev_val - Tc[i]) + q_conv_c) / (this.rho_water * Vo * this.Cp_water);
        }
      }
      return [...dTh, ...dTc];
    };

    const currentState = [...this.state.Th, ...this.state.Tc];
    const nextState = PhysicsEngine.rk4(0, currentState, dt, derivatives);

    this.state.Th = nextState.slice(0, n);
    this.state.Tc = nextState.slice(n, 2 * n);

    for (let i = 0; i < n; i++) {
      this.state.Tw[i] = (hi * Ai * this.state.Th[i] + ho * Ao * this.state.Tc[i]) / (hi * Ai + ho * Ao);
    }
  }

  private calculateHi(m: number): number {
    return 500 + 2000 * Math.pow(m / 0.1, 0.8);
  }

  private calculateHo(m: number): number {
    return 400 + 1500 * Math.pow(m / 0.1, 0.8);
  }

  public getState() {
    return this.state;
  }

  public setInlets(Thi: number, Tci: number, mh: number, mc: number, isCounterCurrent: boolean) {
    this.state.Thi = Thi;
    this.state.Tci = Tci;
    this.state.mh = mh;
    this.state.mc = mc;
    this.state.isCounterCurrent = isCounterCurrent;
  }
}
