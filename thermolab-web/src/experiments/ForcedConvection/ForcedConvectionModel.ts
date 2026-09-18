
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface ForcedConvectionParams {
  cylinderDiameter: number; // m
  cylinderLength: number; // m
  heaterMaxPower: number; // W
}

export interface ForcedConvectionState {
  T_surface: number;
  T_air: number;
  airVelocity: number; // m/s
  heaterPower: number; // W
  T_ambient: number;
}

export class ForcedConvectionModel {
  private params: ForcedConvectionParams;
  private state: ForcedConvectionState;

  private rho_air = 1.2;
  private mu_air = 1.8e-5;
  private k_air = 0.026;
  private Pr_air = 0.7;

  constructor(params: ForcedConvectionParams, initialState: Partial<ForcedConvectionState> = {}) {
    this.params = params;
    this.state = {
      T_surface: initialState.T_surface || 25,
      T_air: initialState.T_air || 25,
      airVelocity: initialState.airVelocity || 0,
      heaterPower: initialState.heaterPower || 0,
      T_ambient: initialState.T_ambient || 25,
    };
  }

  public step(dt: number): void {
    const Area = Math.PI * this.params.cylinderDiameter * this.params.cylinderLength;
    const mass = 0.5; // kg (assumed mass of copper cylinder)
    const Cp_copper = 385; // J/kgK

    // Hilpert Correlation for Nu: Nu = C * Re^m * Pr^(1/3)
    const Re = (this.rho_air * this.state.airVelocity * this.params.cylinderDiameter) / this.mu_air;
    let Nu = 0;
    if (Re > 0) {
      // simplified Churchill-Bernstein like
      Nu = 0.3 + (0.62 * Math.sqrt(Re) * Math.pow(this.Pr_air, 1/3)) /
           Math.pow(1 + Math.pow(0.4/this.Pr_air, 2/3), 0.25) *
           Math.pow(1 + Math.pow(Re/282000, 5/8), 0.8);
    }

    const h = (Nu * this.k_air) / this.params.cylinderDiameter;

    // Radiation loss (simplified)
    const epsilon = 0.8;
    const sigma = 5.67e-8;
    const q_rad = epsilon * sigma * Area * (Math.pow(this.state.T_surface + 273, 4) - Math.pow(this.state.T_ambient + 273, 4));

    const derivatives = (t: number, y: number[]): number[] => {
      const Ts = y[0];
      const q_conv = h * Area * (Ts - this.state.T_ambient);
      const dTs = (this.state.heaterPower - q_conv - q_rad) / (mass * Cp_copper);
      return [dTs];
    };

    const nextState = PhysicsEngine.rk4(0, [this.state.T_surface], dt, derivatives);
    this.state.T_surface = nextState[0];
  }

  public getState() {
    return this.state;
  }

  public setControls(v: number, q: number, Tamb: number) {
    this.state.airVelocity = v;
    this.state.heaterPower = q;
    this.state.T_ambient = Tamb;
  }
}
