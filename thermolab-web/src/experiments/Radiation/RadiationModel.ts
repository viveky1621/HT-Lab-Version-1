
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface RadiationParams {
  sourceArea: number;
  detectorArea: number;
}

export interface RadiationState {
  T_source: number;
  T_ambient: number;
  heaterPower: number;
  detectorDistance: number; // m
  emissivity: number;
  viewFactor: number;
}

export class RadiationModel {
  private params: RadiationParams;
  private state: RadiationState;
  private sigma = 5.67e-8;

  constructor(params: RadiationParams, initialState: Partial<RadiationState> = {}) {
    this.params = params;
    this.state = {
      T_source: initialState.T_source || 25,
      T_ambient: initialState.T_ambient || 25,
      heaterPower: initialState.heaterPower || 0,
      detectorDistance: initialState.detectorDistance || 0.5,
      emissivity: initialState.emissivity || 0.95,
      viewFactor: 1.0,
    };
  }

  public step(dt: number): void {
    const mass = 0.5;
    const Cp = 400;

    // View factor simplified: F = r^2 / (r^2 + d^2)
    const d = this.state.detectorDistance;
    const r_source = Math.sqrt(this.params.sourceArea / Math.PI);
    this.state.viewFactor = (r_source * r_source) / (r_source * r_source + d * d);

    const derivatives = (t: number, y: number[]): number[] => {
      const Ts = y[0];
      const q_rad = this.state.emissivity * this.sigma * this.params.sourceArea * (Math.pow(Ts + 273, 4) - Math.pow(this.state.T_ambient + 273, 4));
      const q_conv = 5 * this.params.sourceArea * (Ts - this.state.T_ambient);

      const dTs = (this.state.heaterPower - q_rad - q_conv) / (mass * Cp);
      return [dTs];
    };

    const nextState = PhysicsEngine.rk4(0, [this.state.T_source], dt, derivatives);
    this.state.T_source = nextState[0];
  }

  public getDetectorReading(): number {
    // Q_received = Q_emitted * F_view * epsilon
    const Q_emitted = this.state.emissivity * this.sigma * this.params.sourceArea * (Math.pow(this.state.T_source + 273, 4) - Math.pow(this.state.T_ambient + 273, 4));
    return Q_emitted * this.state.viewFactor;
  }

  public getState() {
    return this.state;
  }

  public setControls(q: number, dist: number, eps: number) {
    this.state.heaterPower = q;
    this.state.detectorDistance = dist;
    this.state.emissivity = eps;
  }
}
