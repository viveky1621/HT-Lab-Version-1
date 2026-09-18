
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface CondenserParams {
  area: number;
  U_base: number;
}

export interface CondenserState {
  T_coolant_in: number;
  T_coolant_out: number;
  m_coolant: number;
  T_vapor: number;
  m_vapor: number;
  T_condensate: number;
  pressure: number;
}

export class CondenserModel {
  private params: CondenserParams;
  private state: CondenserState;
  private Cp_water = 4180;
  private h_fg = 2.257e6;

  constructor(params: CondenserParams, initialState: Partial<CondenserState> = {}) {
    this.params = params;
    this.state = {
      T_coolant_in: initialState.T_coolant_in || 20,
      T_coolant_out: initialState.T_coolant_out || 25,
      m_coolant: initialState.m_coolant || 0.5,
      T_vapor: initialState.T_vapor || 100,
      m_vapor: initialState.m_vapor || 0.01,
      T_condensate: 95,
      pressure: 1.0,
    };
  }

  public step(dt: number): void {
    // Q_condense = m_vapor * h_fg
    const Q_duty = this.state.m_vapor * this.h_fg;

    // Q = UA * LMTD
    // LMTD = ((Tv-Tco) - (Tv-Tci)) / ln((Tv-Tco)/(Tv-Tci))
    // We can solve for Tco: Q = m_c * Cp * (Tco - Tci)
    const dTc = Q_duty / (this.state.m_coolant * this.Cp_water);

    // Dynamics (first order lag for outlet temperature)
    const tau = 5.0;
    const targetTco = this.state.T_coolant_in + dTc;
    this.state.T_coolant_out += (targetTco - this.state.T_coolant_out) * (dt / tau);

    const targetTcon = this.state.T_vapor - 5; // Subcooling
    this.state.T_condensate += (targetTcon - this.state.T_condensate) * (dt / tau);
  }

  public getState() {
    return this.state;
  }

  public setControls(Tci: number, mc: number, mv: number, Tv: number) {
    this.state.T_coolant_in = Tci;
    this.state.m_coolant = mc;
    this.state.m_vapor = mv;
    this.state.T_vapor = Tv;
  }
}
