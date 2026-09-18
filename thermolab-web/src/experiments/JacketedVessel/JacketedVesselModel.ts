
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface JacketedVesselParams {
  volume: number; // m3
  jacketArea: number; // m2
  UA_base: number; // W/K
  mass_vessel: number; // kg
}

export interface JacketedVesselState {
  T_vessel: number;
  T_jacket: number;
  m_jacket: number;
  T_jacket_in: number;
  T_ambient: number;
  agitationSpeed: number; // 0-1
  heaterOutput: number; // 0-1
}

export class JacketedVesselModel {
  private params: JacketedVesselParams;
  private state: JacketedVesselState;
  private Cp_water = 4180;
  private rho_water = 1000;

  constructor(params: JacketedVesselParams, initialState: Partial<JacketedVesselState> = {}) {
    this.params = params;
    this.state = {
      T_vessel: initialState.T_vessel || 25,
      T_jacket: initialState.T_jacket || 25,
      m_jacket: initialState.m_jacket || 0.1,
      T_jacket_in: initialState.T_jacket_in || 80,
      T_ambient: initialState.T_ambient || 25,
      agitationSpeed: initialState.agitationSpeed || 0.5,
      heaterOutput: initialState.heaterOutput || 0,
    };
  }

  public step(dt: number): void {
    // UA depends on agitation
    const UA = this.params.UA_base * (0.5 + 0.5 * Math.pow(this.state.agitationSpeed, 0.67));

    const derivatives = (t: number, y: number[]): number[] => {
      const Tv = y[0];
      const Tj = y[1];

      // Jacket balance: rho*Vj*Cp*dTj/dt = mj*Cp*(Tji - Tj) - UA*(Tj - Tv)
      // Assume Vj = 0.05 * V
      const Vj = this.params.volume * 0.1;
      const q_jacket = UA * (Tj - Tv);
      const dTj = (this.state.m_jacket * this.Cp_water * (this.state.T_jacket_in - Tj) - q_jacket) / (this.rho_water * Vj * this.Cp_water);

      // Vessel balance: rho*Vv*Cp*dTv/dt = q_jacket - q_loss
      const q_loss = 5 * this.params.jacketArea * (Tv - this.state.T_ambient);
      const dTv = (q_jacket - q_loss) / (this.rho_water * this.params.volume * this.Cp_water);

      return [dTv, dTj];
    };

    const nextState = PhysicsEngine.rk4(0, [this.state.T_vessel, this.state.T_jacket], dt, derivatives);
    this.state.T_vessel = nextState[0];
    this.state.T_jacket = nextState[1];
  }

  public getState() {
    return this.state;
  }

  public setControls(Tji: number, mj: number, agitation: number) {
    this.state.T_jacket_in = Tji;
    this.state.m_jacket = mj;
    this.state.agitationSpeed = agitation;
  }
}

export class PIDController {
  private kp: number;
  private ki: number;
  private kd: number;
  private integral: number = 0;
  private lastError: number = 0;

  constructor(kp: number, ki: number, kd: number) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
  }

  public update(setpoint: number, processValue: number, dt: number): number {
    const error = setpoint - processValue;
    this.integral += error * dt;
    const derivative = (error - this.lastError) / dt;

    this.lastError = error;

    const output = this.kp * error + this.ki * this.integral + this.kd * derivative;
    return Math.min(Math.max(output, 0), 1); // Clamp 0-1
  }
}
