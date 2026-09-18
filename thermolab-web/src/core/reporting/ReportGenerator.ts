
import { type ExperimentConfig, type ExperimentReading } from '../../types';

export class ReportGenerator {
  public static generateHTML(config: ExperimentConfig, readings: ExperimentReading[]): string {
    const timestamp = new Date().toLocaleString();

    return `
<!DOCTYPE html>
<html>
<head>
  <title>ThermoLab Report - ${config.name}</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
    .header-info { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .header-info div span { font-weight: bold; color: #64748b; font-size: 0.8rem; text-transform: uppercase; display: block; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 50px; font-size: 0.8rem; color: #94a3b8; text-align: center; }
    .badge { padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.7rem; }
    .badge-steady { background: #dcfce7; color: #15803d; }
    .badge-unsteady { background: #fef3c7; color: #b45309; }
  </style>
</head>
<body>
  <h1>Laboratory Report: ${config.name}</h1>

  <div class="header-info">
    <div>
      <span>Date Generated</span>
      ${timestamp}
    </div>
    <div>
      <span>Experiment ID</span>
      ${config.id.toUpperCase()}
    </div>
    <div>
      <span>Total Observations</span>
      ${readings.length}
    </div>
    <div>
      <span>Final Stability</span>
      ${readings.length > 0 ? (readings[readings.length-1].isSteady ? 'Steady State' : 'Unsteady') : 'N/A'}
    </div>
  </div>

  <h2>1. Objectives</h2>
  <ul>
    ${config.objectives.map(o => `<li>${o}</li>`).join('')}
  </ul>

  <h2>2. Apparatus Description</h2>
  <p>${config.description}</p>

  <h2>3. Collected Data</h2>
  ${readings.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Time (s)</th>
          <th>Run</th>
          ${Object.keys(readings[0].values).map(k => `<th>${k}</th>`).join('')}
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${readings.map(r => `
          <tr>
            <td>${r.simulatedTime.toFixed(1)}</td>
            <td>${r.runId}</td>
            ${Object.values(r.values).map(v => `<td>${v.toFixed(3)}</td>`).join('')}
            <td><span class="badge ${r.isSteady ? 'badge-steady' : 'badge-unsteady'}">${r.isSteady ? 'STEADY' : 'TRANSIENT'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No data recorded in this session.</p>'}

  <h2>4. Summary & Analysis</h2>
  <p>Student analysis goes here. The simulation confirms the principles of ${config.name.toLowerCase()}. Measured discrepancies in energy balance are attributed to simulated instrument noise and environmental heat loss.</p>

  <div class="footer">
    ThermoLab: Digital Heat-Transfer Experiments &copy; 2024. For educational use only.
  </div>
</body>
</html>
    `;
  }
}
