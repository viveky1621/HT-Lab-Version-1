
export class SensorModel {
  private currentValue: number;
  private targetValue: number;
  private timeConstant: number; // seconds
  private noiseLevel: number;
  private bias: number;
  private resolution: number;

  constructor(initialValue: number, config: {
    timeConstant?: number;
    noiseLevel?: number;
    bias?: number;
    resolution?: number;
  } = {}) {
    this.currentValue = initialValue;
    this.targetValue = initialValue;
    this.timeConstant = config.timeConstant || 2.0;
    this.noiseLevel = config.noiseLevel || 0.05;
    this.bias = config.bias || 0;
    this.resolution = config.resolution || 0.01;
  }

  public update(target: number, dt: number, useIdeal: boolean = false): void {
    this.targetValue = target;

    if (useIdeal) {
      this.currentValue = target;
      return;
    }

    // First-order lag: dV/dt = (Target - V) / tau
    const delta = (this.targetValue - this.currentValue) * (dt / this.timeConstant);
    this.currentValue += delta;
  }

  public getReading(seed: number = Math.random()): number {
    // Add bias
    let val = this.currentValue + this.bias;

    // Add pseudo-random Gaussian noise
    // Using Box-Muller transform
    const u1 = seed;
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    val += z * this.noiseLevel;

    // Apply resolution
    if (this.resolution > 0) {
      val = Math.round(val / this.resolution) * this.resolution;
    }

    return val;
  }

  public reset(value: number): void {
    this.currentValue = value;
    this.targetValue = value;
  }
}
