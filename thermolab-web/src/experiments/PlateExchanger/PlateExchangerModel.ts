
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface PlateExchangerParams {
  plateArea: number; // m2 per plate
  plateCount: number;
  chevronAngle: number;
  segments: number;
}

export interface PlateExchangerState {
  Th: number[];
  Tc: number[];
  mh: number;
  mc: number;
  Thi: number;
  Tci: number;
  isCounterCurrent: boolean;
}

export class PlateExchangerModel {
  private params: PlateExchangerParams;
  private state: PlateExchangerState;
  private Cp_water = 4180;
  private rho_water = 1000;

  constructor(params: PlateExchangerParams, initialState: Partial<PlateExchangerState> = {}) {
    this.params = params;
    const n = params.segments;
    this.state = {
      Th: new Array(n).fill(initialState.Thi || 70),
      Tc: new Array(n).fill(initialState.Tci || 20),
      mh: initialState.mh || 0.15,
      mc: initialState.mc || 0.15,
      Thi: initialState.Thi || 70,
      Tci: initialState.Tci || 20,
      isCounterCurrent: initialState.isCounterCurrent ?? true,
    };
  }

  public step(dt: number): void {
    const n = this.params.segments;
    const dx = 1.0 / n; // normalized length
    const totalArea = this.params.plateArea * (this.params.plateCount - 1);
    const dA = totalArea * dx;

    // Plate exchangers have very high U due to corrugations
    // U ~ Re^0.65
    const U = 2000 + 4000 * Math.pow((this.state.mh + this.state.mc) / 0.3, 0.65);

    const derivatives = (t: number, y: number[]): number[] => {
      const Th = y.slice(0, n);
      const Tc = y.slice(n, 2 * n);
      const dTh = new Array(n).fill(0);
      const dTc = new Array(n).fill(0);

      for (let i = 0; i < n; i++) {
        const Th_prev = i === 0 ? this.state.Thi : Th[i-1];
        const q_transfer = U * dA * (Th[i] - Tc[i]);

        // Simplified dynamic mass-based balance
        dTh[i] = (this.state.mh * this.Cp_water * (Th_prev - Th[i]) - q_transfer) / (5 * this.rho_water * (totalArea/n * 0.005) * this.Cp_water);

        let Tc_prev_val;
        if (this.state.isCounterCurrent) {
          Tc_prev_val = i === n - 1 ? this.state.Tci : Tc[i+1];
          dTc[i] = (this.state.mc * this.Cp_water * (Tc_prev_val - Tc[i]) + q_transfer) / (5 * this.rho_water * (totalArea/n * 0.005) * this.Cp_water);
        } else {
          Tc_prev_val = i === 0 ? this.state.Tci : Tc[i-1];
          dTc[i] = (this.state.mc * this.Cp_water * (Tc_prev_val - Tc[i]) + q_transfer) / (5 * this.rho_water * (totalArea/n * 0.005) * this.Cp_water);
        }
      }
      return [...dTh, ...dTc];
    };

    const currentState = [...this.state.Th, ...this.state.Tc];
    const nextState = PhysicsEngine.rk4(0, currentState, dt, derivatives);

    this.state.Th = nextState.slice(0, n);
    this.state.Tc = nextState.slice(n, 2 * n);
  }

  public getState() {
    return this.state;
  }

  public setInlets(Thi: number, Tci: number, mh: number, mc: number, isCounter: boolean) {
    this.state.Thi = Thi;
    this.state.Tci = Tci;
    this.state.mh = mh;
    this.state.mc = mc;
    this.state.isCounterCurrent = isCounter;
  }
}
