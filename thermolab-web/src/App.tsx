
import { useEffect } from 'react';
import { Layout } from './components/shell/Layout';
import { useStore } from './core/state/useStore';
import { DoublePipeExperiment } from './experiments/DoublePipe/DoublePipeExperiment';
import { ShellAndTubeExperiment } from './experiments/ShellAndTube/ShellAndTubeExperiment';
import { JacketedVesselExperiment } from './experiments/JacketedVessel/JacketedVesselExperiment';
import { ForcedConvectionExperiment } from './experiments/ForcedConvection/ForcedConvectionExperiment';
import { PlateExchangerExperiment } from './experiments/PlateExchanger/PlateExchangerExperiment';
import { AirCooledExperiment } from './experiments/AirCooled/AirCooledExperiment';
import { NaturalConvectionExperiment } from './experiments/NaturalConvection/NaturalConvectionExperiment';
import { PinFinExperiment } from './experiments/PinFin/PinFinExperiment';
import { ConductionExperiment } from './experiments/Conduction/ConductionExperiment';
import { RadiationExperiment } from './experiments/Radiation/RadiationExperiment';
import { BoilingExperiment } from './experiments/Boiling/BoilingExperiment';
import { CondenserExperiment } from './experiments/PhaseChange/CondenserExperiment';
import { type ExperimentConfig } from './types';

const experiments: ExperimentConfig[] = [
  {
    id: 'double-pipe',
    name: 'Double-Pipe Heat Exchanger',
    description: 'Measure heat duty, LMTD, and overall heat-transfer coefficient in concentric tubes.',
    theory: 'Heat transfer in a double-pipe exchanger occurs between two fluids at different temperatures flowing in concentric tubes. The arrangement can be parallel or counter-current.',
    objectives: ['Determine overall heat transfer coefficient (U)', 'Study the effect of flow arrangement'],
    procedure: ['Select flow arrangement', 'Adjust flow rates', 'Wait for stability', 'Record data'],
    safety: ['High temperature hazard (>70°C)'],
    parameters: {},
    initialConditions: { Thin: 75, Thout: 70, Tcin: 20, Tcout: 25, Fh: 0.1, Fc: 0.2, length: 2.0, isCounterCurrent: true }
  },
  {
    id: 'shell-tube',
    name: 'Shell-and-Tube Heat Exchanger',
    description: 'Explore industrial standard baffle design and multi-pass tube configurations.',
    theory: 'The shell-and-tube exchanger is the most common industrial design. Baffles induce turbulence and cross-flow on the shell side.',
    objectives: ['Observe baffle-induced turbulence', 'Find overall U for multi-pass configuration'],
    procedure: ['Adjust shell and tube flows', 'Monitor outlet temperature', 'Record stabilization data'],
    safety: ['High pressure warning'],
    parameters: {},
    initialConditions: { Tsi: 75, Tso: 70, Tti: 20, Tto: 25, Fs: 0.2, Ft: 0.5, tubeCount: 40, tubePasses: 2, baffleSpacing: 0.2 }
  },
  {
    id: 'jacket-vessel',
    name: 'Jacketed Stirred Vessel',
    description: 'Study unsteady heating, agitation effects, and PID temperature control.',
    theory: 'Jacketed vessels are used for batch heating/cooling. Heat transfer depends on agitation speed and utility flow.',
    objectives: ['Measure heating rate (dT/dt)', 'Tune a PID controller'],
    procedure: ['Set batch volume', 'Set agitator speed', 'Configure PID setpoint'],
    safety: ['Rotating agitator hazard'],
    parameters: {},
    initialConditions: { Tv: 25, Tj: 25, SP: 50, Fj: 0.2, agitation: 0.5, volume: 0.5 }
  },
  {
    id: 'forced-conv',
    name: 'Forced Convection',
    description: 'Determine h and Nu for air flow over a heated cylinder in a duct.',
    theory: 'Forced convection follows correlations like Hilpert: Nu = C * Re^m * Pr^n.',
    objectives: ['Verify empirical correlations', 'Study Reynolds number influence'],
    procedure: ['Set air velocity', 'Set heater power', 'Record stabilization data'],
    safety: ['Hot surface hazard'],
    parameters: {},
    initialConditions: { Ts: 25, Ta: 25, Vel: 2.0, Q: 20, geometry: 'Cylinder' }
  },
  {
    id: 'plate-hx',
    name: 'Plate Heat Exchanger',
    description: 'Study high-efficiency compact heat transfer surfaces with corrugated plates.',
    theory: 'Plate exchangers offer very high surface area to volume ratios and induced turbulence at low Reynolds numbers.',
    objectives: ['Measure U in compact geometry', 'Observe fast thermal response times'],
    procedure: ['Set hot and cold flows', 'Observe rapid approach to steady state'],
    safety: ['Gasket temperature compatibility'],
    parameters: {},
    initialConditions: { Thin: 75, Thout: 65, Tcin: 20, Tcout: 30, Fh: 0.15, Fc: 0.2, plateCount: 16, isCounterCurrent: true }
  },
  {
    id: 'air-cooled',
    name: 'Air-Cooled Heat Exchanger',
    description: 'Cooling with finned tubes and forced air when cooling water is limited.',
    theory: 'Air-cooled exchangers reject heat to the atmosphere using extended surfaces (fins).',
    objectives: ['Study fan speed effect', 'Investigate ambient sensitivity'],
    procedure: ['Adjust fan speed', 'Monitor air-side temperature rise'],
    safety: ['Moving fan blades'],
    parameters: {},
    initialConditions: { Tpi: 80, Tpo: 60, Tamb: 25, Tao: 35, Fp: 0.5, Fan: 0.5, fanDiameter: 0.8 }
  },
  {
    id: 'nat-conv',
    name: 'Natural Convection',
    description: 'Study buoyancy-driven heat transfer from vertical plates.',
    theory: 'Natural convection is driven by density gradients determined by the Rayleigh number.',
    objectives: ['Determine Grashof and Rayleigh numbers', 'Separate convective and radiative heat losses'],
    procedure: ['Set low power levels', 'Wait for slow stabilization'],
    safety: ['Enclosure gets hot'],
    parameters: {},
    initialConditions: { Ts: 25, Ta: 25, Q: 10, eps: 0.85, finish: 'Polished' }
  },
  {
    id: 'pin-fin',
    name: 'Pin-Fin Apparatus',
    description: 'Measure temperature distribution in extended surfaces (fins).',
    theory: '1D conduction in fins follows the second-order ODE with hyperbolic cosine solutions.',
    objectives: ['Measure temperature profile', 'Calculate fin efficiency'],
    procedure: ['Power the base heater', 'Measure axial temperatures'],
    safety: ['Hot base block (>100°C)'],
    parameters: {},
    initialConditions: { Tb: 25, T1: 25, T3: 25, T5: 25, Ta: 25, Q: 20, material: 'Aluminum', k: 200 }
  },
  {
    id: 'conduction',
    name: 'Composite Wall Conduction',
    description: 'Determine thermal conductivity and resistance of multi-layer materials.',
    theory: 'Fourier law: Q = k * A * dT/dx. For multi-layer walls, resistances are additive in series.',
    objectives: ['Measure k-values of unknowns', 'Study temperature gradients'],
    procedure: ['Set heater power', 'Monitor all interface temperatures'],
    safety: ['High surface temperature'],
    parameters: {},
    initialConditions: { T0: 25, T1: 25, T2: 25, T3: 25, Ta: 25, Q: 50, insulationThickness: 0.02 }
  },
  {
    id: 'radiation',
    name: 'Radiation & Emissivity',
    description: 'Verify Stefan-Boltzmann and Inverse Square laws of thermal radiation.',
    theory: 'Radiation follows Q = epsilon * sigma * A * (T^4 - Ta^4).',
    objectives: ['Determine emissivity', 'Verify distance effect (1/r²)'],
    procedure: ['Heat source to high temp', 'Vary distance to detector'],
    safety: ['Optical hazard'],
    parameters: {},
    initialConditions: { Ts: 25, Qdet: 0, Dist: 0.5, Eps: 0.95, targetPlate: 'Black' }
  },
  {
    id: 'boiling',
    name: 'Pool Boiling Apparatus',
    description: 'Observe boiling regimes and the Critical Heat Flux (CHF) point.',
    theory: 'Pool boiling goes through distinct regimes: natural convection, nucleate, transition, and film.',
    objectives: ['Map the boiling curve', 'Identify the CHF point'],
    procedure: ['Increase power increments', 'Observe bubble behavior'],
    safety: ['Explosive boiling hazard'],
    parameters: {},
    initialConditions: { Ts: 100, Tb: 100, P: 1.0, Q: 200, surfaceArea: 0.005 }
  },
  {
    id: 'condenser',
    name: 'Condenser Operation',
    description: 'Study latent heat transfer and phase change in industrial condensers.',
    theory: 'Condensation involves removal of latent heat: Q = m_vapor * h_fg.',
    objectives: ['Measure condensation duty', 'Calculate overall U for phase change'],
    procedure: ['Start coolant flow', 'Introduce vapor flow'],
    safety: ['Hot vapor hazard'],
    parameters: {},
    initialConditions: { Tci: 20, Tco: 25, Tv: 100, Tcon: 95, Fc: 0.5, Fv: 0.01, area: 1.0 }
  }
];

function App() {
  const { setExperiments, activeExperiment } = useStore();

  useEffect(() => {
    setExperiments(experiments);
  }, [setExperiments]);

  return (
    <Layout>
      {activeExperiment?.id === 'double-pipe' && <DoublePipeExperiment />}
      {activeExperiment?.id === 'shell-tube' && <ShellAndTubeExperiment />}
      {activeExperiment?.id === 'jacket-vessel' && <JacketedVesselExperiment />}
      {activeExperiment?.id === 'forced-conv' && <ForcedConvectionExperiment />}
      {activeExperiment?.id === 'plate-hx' && <PlateExchangerExperiment />}
      {activeExperiment?.id === 'air-cooled' && <AirCooledExperiment />}
      {activeExperiment?.id === 'nat-conv' && <NaturalConvectionExperiment />}
      {activeExperiment?.id === 'pin-fin' && <PinFinExperiment />}
      {activeExperiment?.id === 'conduction' && <ConductionExperiment />}
      {activeExperiment?.id === 'radiation' && <RadiationExperiment />}
      {activeExperiment?.id === 'boiling' && <BoilingExperiment />}
      {activeExperiment?.id === 'condenser' && <CondenserExperiment />}
    </Layout>
  );
}

export default App;
