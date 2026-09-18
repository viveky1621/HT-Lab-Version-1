# ThermoLab: Digital Heat-Transfer Experiments

A complete, production-quality, browser-based digital laboratory for undergraduate chemical engineering.

## Architecture

- **Frontend**: React 18+, TypeScript, Vite.
- **Styling**: Tailwind CSS 4.
- **State Management**: Zustand.
- **Physics**: Real-time numerical integration (RK4/Euler) with segmented axial models.
- **Instrumentation**: Realistic sensor model with 1st-order lag, Gaussian noise, and finite resolution.
- **Visuals**: Scalable, animated SVG-based process and instrument diagrams.
- **Reporting**: KaTeX for equations, CSV/JSON data export.

## Project Structure

```
src/
  core/
    simulation/      # Physics engine, sensor models, steady-state monitoring
    state/           # Global Zustand store
    reporting/       # Data logging and report generation
  components/
    shell/           # Dashboard layout, toolbar, sidebar, instrument rack
    shared/          # Reusable UI and equipment components
  experiments/       # Individual experiment implementations
    DoublePipe/      # Experiment 1 implementation
  types/             # TypeScript definitions
```

## Setup and Running

1.  Navigate to the project directory:
    ```bash
    cd thermolab-web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Build for production:
    ```bash
    npm run build
    ```

## Physics Assumptions

- **Heat Exchangers**: Segmented axial model (default 20 segments). Constant fluid properties (rho, Cp) assumed for simplicity.
- **Steady State**: Defined as <0.5% relative change over 30 simulated seconds.
- **Sensors**: Pseudo-random Gaussian noise added to true model values.

## Limitations

- This is an educational tool, not a process simulator for detailed design.
- Fluid properties are currently simplified to water-like behavior.
- Numerical stability depends on `dt` and `timeScale`. High speeds (>20x) may require smaller base `dt`.
