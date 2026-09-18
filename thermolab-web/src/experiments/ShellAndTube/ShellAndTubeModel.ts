
import { PhysicsEngine } from '../../core/simulation/PhysicsEngine';

export interface ShellAndTubeParams {
  shellDiameter: number; // m
  tubeOD: number; // m
  tubeID: number; // m
  tubeLength: number; // m
  tubeCount: number;
  tubePasses: 1 | 2 | 4;
  baffleSpacing: number; // m
  baffleCut: number; // fraction 0-1
  segments: number;
}

export interface ShellAndTubeState {
  T_tube: number[][]; // [pass][segment]
  T_shell: number[]; // [segment]
  m_tube: number;
  m_shell: number;
  T_tube_in: number;
  T_shell_in: number;
  hotStream: 'tube' | 'shell';
}

export class ShellAndTubeModel {
  private params: ShellAndTubeParams;
  private state: ShellAndTubeState;
  private Cp_water = 4180;
  private rho_water = 1000;

  constructor(params: ShellAndTubeParams, initialState: Partial<ShellAndTubeState> = {}) {
    this.params = params;
    const n = params.segments;
    const p = params.tubePasses;

    this.state = {
      T_tube: Array.from({ length: p }, () => new Array(n).fill(initialState.T_tube_in || 20)),
      T_shell: new Array(n).fill(initialState.T_shell_in || 70),
      m_tube: initialState.m_tube || 0.2,
      m_shell: initialState.m_shell || 0.1,
      T_tube_in: initialState.T_tube_in || 20,
      T_shell_in: initialState.T_shell_in || 70,
      hotStream: initialState.hotStream || 'shell',
    };
  }

  public step(dt: number): void {
    const n = this.params.segments;
    const p = this.params.tubePasses;
    const dx = this.params.tubeLength / n;

    // Areas
    const At_inner = Math.PI * this.params.tubeID * dx * this.params.tubeCount;
    const At_outer = Math.PI * this.params.tubeOD * dx * this.params.tubeCount;

    // Volumes
    const Vt = (Math.PI * Math.pow(this.params.tubeID, 2) / 4) * dx * this.params.tubeCount;
    const Vs = (Math.PI * Math.pow(this.params.shellDiameter, 2) / 4 -
                Math.PI * Math.pow(this.params.tubeOD, 2) / 4 * this.params.tubeCount) * dx;

    // Convection (simplified)
    const ht = 800 + 2000 * Math.pow(this.state.m_tube / 0.2, 0.8);
    const hs = 600 + 1500 * Math.pow(this.state.m_shell / 0.1, 0.7) * (1 / (this.params.baffleSpacing / 0.1));

    const derivatives = (t: number, y: number[]): number[] => {
      // y layout: [T_tube_pass0...n, T_tube_pass1...n, ..., T_shell0...n]
      const tubeTemps = Array.from({ length: p }, (_, j) => y.slice(j * n, (j + 1) * n));
      const shellTemps = y.slice(p * n, (p + 1) * n);

      const dTt = Array.from({ length: p }, () => new Array(n).fill(0));
      const dTs = new Array(n).fill(0);

      // Shell Energy Balance
      for (let i = 0; i < n; i++) {
        const Ts_prev = i === 0 ? this.state.T_shell_in : shellTemps[i - 1];
        let q_sum_to_tube = 0;
        for (let j = 0; j < p; j++) {
           q_sum_to_tube += hs * At_outer / p * (shellTemps[i] - tubeTemps[j][i]);
        }
        dTs[i] = (this.state.m_shell * this.Cp_water * (Ts_prev - shellTemps[i]) - q_sum_to_tube) / (this.rho_water * Vs * this.Cp_water);
      }

      // Tube Energy Balance
      for (let j = 0; j < p; j++) {
        const isForward = j % 2 === 0; // Forward pass
        for (let i = 0; i < n; i++) {
          let Tt_prev;
          if (isForward) {
            Tt_prev = i === 0
              ? (j === 0 ? this.state.T_tube_in : tubeTemps[j-1][0])
              : tubeTemps[j][i-1];
          } else {
            Tt_prev = i === n - 1
              ? tubeTemps[j-1][n-1]
              : tubeTemps[j][i+1];
          }

          const q_from_shell = ht * At_inner / p * (shellTemps[i] - tubeTemps[j][i]);
          const currentT = tubeTemps[j][i];
          const flowTerm = this.state.m_tube * this.Cp_water * (Tt_prev - currentT);

          dTt[j][i] = (flowTerm + q_from_shell) / (this.rho_water * Vt * this.Cp_water);
        }
      }

      return [...dTt.flat(), ...dTs];
    };

    const currentState = [...this.state.T_tube.flat(), ...this.state.T_shell];
    const nextState = PhysicsEngine.rk4(0, currentState, dt, derivatives);

    for (let j = 0; j < p; j++) {
      this.state.T_tube[j] = nextState.slice(j * n, (j + 1) * n);
    }
    this.state.T_shell = nextState.slice(p * n, (p + 1) * n);
  }

  public getState() {
    return this.state;
  }

  public setInlets(Tsi: number, Tti: number, ms: number, mt: number) {
    this.state.T_shell_in = Tsi;
    this.state.T_tube_in = Tti;
    this.state.m_shell = ms;
    this.state.m_tube = mt;
  }
}
