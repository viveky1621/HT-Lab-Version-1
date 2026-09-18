
export class UnitConverter {
  public static convert(value: number, type: 'temp' | 'flow' | 'power' | 'length', target: 'SI' | 'English'): string {
    if (target === 'SI') {
      if (type === 'temp') return `${value.toFixed(2)} °C`;
      if (type === 'flow') return `${value.toFixed(3)} kg/s`;
      if (type === 'power') return `${value.toFixed(1)} W`;
      if (type === 'length') return `${value.toFixed(3)} m`;
    } else {
      if (type === 'temp') return `${(value * 9/5 + 32).toFixed(2)} °F`;
      if (type === 'flow') return `${(value * 2.20462).toFixed(3)} lb/s`;
      if (type === 'power') return `${(value * 3.41214).toFixed(1)} BTU/hr`;
      if (type === 'length') return `${(value * 3.28084).toFixed(3)} ft`;
    }
    return value.toString();
  }
}
