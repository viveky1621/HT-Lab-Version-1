
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface NaturalConvectionParams {
  plateHeight: number; // m
  plateWidth: number; // m
  heaterMaxPower: number; // W
}

export interface NaturalConvectionState {
  T_surface: number;
  T_ambient: number;
  heaterPower: number; // W
  emissivity: number;
}

export class NaturalConvectionModel {
  private params: NaturalConvectionParams;
  private state: NaturalConvectionState;

  private rho_air = 1.2;
  private mu_air = 1.8e-5;
  private k_air = 0.026;
  private beta = 1/300; // 1/T_avg
  private g = 9.81;
  private Pr = 0.7;

  constructor(params: NaturalConvectionParams, initialState: Partial<NaturalConvectionState> = {}) {
    this.params = params;
    this.state = {
      T_surface: initialState.T_surface || 25,
      T_ambient: initialState.T_ambient || 25,
      heaterPower: initialState.heaterPower || 0,
      emissivity: initialState.emissivity || 0.85,
    };
  }

  public step(dt: number): void {
    const Area = this.params.plateHeight * this.params.plateWidth * 2; // Two sides
    const mass = 0.3; // kg
    const Cp_mat = 400; // J/kgK

    // Grashof Number: Gr = g * beta * (Ts - Ta) * L^3 / nu^2
    const nu = this.mu_air / this.rho_air;
    const deltaT = Math.max(this.state.T_surface - this.state.T_ambient, 0.1);
    const Gr = (this.g * this.beta * deltaT * Math.pow(this.params.plateHeight, 3)) / Math.pow(nu, 2);
    const Ra = Gr * this.Pr;

    // Churchill and Chu correlation for vertical plate
    const Nu = Math.pow(0.825 + (0.387 * Math.pow(Ra, 1/6)) / Math.pow(1 + Math.pow(0.492/this.Pr, 9/16), 8/27), 2);

    const h = (Nu * this.k_air) / this.params.plateHeight;

    const sigma = 5.67e-8;
    const q_rad = this.state.emissivity * sigma * Area * (Math.pow(this.state.T_surface + 273, 4) - Math.pow(this.state.T_ambient + 273, 4));

    const derivatives = (t: number, y: number[]): number[] => {
      const Ts = y[0];
      const q_conv = h * Area * (Ts - this.state.T_ambient);
      const dTs = (this.state.heaterPower - q_conv - q_rad) / (mass * Cp_mat);
      return [dTs];
    };

    const nextState = PhysicsEngine.rk4(0, [this.state.T_surface], dt, derivatives);
    this.state.T_surface = nextState[0];
  }

  public getState() {
    return this.state;
  }

  public setControls(q: number, Tamb: number, eps: number) {
    this.state.heaterPower = q;
    this.state.T_ambient = Tamb;
    this.state.emissivity = eps;
  }
}
