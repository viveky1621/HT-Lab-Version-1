
export class SteadyStateMonitor {
  private history: { time: number; values: Record<string, number> }[] = [];
  private windowSize: number; // simulated seconds
  private threshold: number; // relative change (0.005 for 0.5%)

  constructor(windowSize: number = 30, threshold: number = 0.005) {
    this.windowSize = windowSize;
    this.threshold = threshold;
  }

  public addDataPoint(time: number, values: Record<string, number>): void {
    this.history.push({ time, values });

    // Prune history
    const cutoff = time - this.windowSize;
    while (this.history.length > 0 && this.history[0].time < cutoff) {
      this.history.shift();
    }
  }

  public isSteady(keys: string[]): boolean {
    if (this.history.length < 2) return false;

    // Check if we have enough time coverage
    const timespan = this.history[this.history.length - 1].time - this.history[0].time;
    if (timespan < this.windowSize * 0.9) return false;

    for (const key of keys) {
      const values = this.history.map(h => h.values[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = (min + max) / 2;

      if (avg === 0) {
        if (max - min > this.threshold) return false;
      } else {
        const relativeDiff = (max - min) / Math.abs(avg);
        if (relativeDiff > this.threshold) return false;
      }
    }

    return true;
  }

  public reset(): void {
    this.history = [];
  }
}
