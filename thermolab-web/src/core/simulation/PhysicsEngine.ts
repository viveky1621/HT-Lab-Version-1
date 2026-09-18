
export type DerivativeFn = (_t: number, y: number[]) => number[];

export class PhysicsEngine {
  /**
   * Runge-Kutta 4th Order Solver
   * @param t Current time
   * @param y Current state vector
   * @param dt Time step
   * @param dydt Function to calculate derivatives
   */
  public static rk4(t: number, y: number[], dt: number, dydt: DerivativeFn): number[] {
    const k1 = dydt(t, y);

    const y2 = y.map((yi, i) => yi + k1[i] * dt / 2);
    const k2 = dydt(t + dt / 2, y2);

    const y3 = y.map((yi, i) => yi + k2[i] * dt / 2);
    const k3 = dydt(t + dt / 2, y3);

    const y4 = y.map((yi, i) => yi + k3[i] * dt);
    const k4 = dydt(t + dt, y4);

    return y.map((yi, i) =>
      yi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
    );
  }

  /**
   * Simple Euler Step
   */
  public static euler(t: number, y: number[], dt: number, dydt: DerivativeFn): number[] {
    const k = dydt(t, y);
    return y.map((yi, i) => yi + k[i] * dt);
  }
}
