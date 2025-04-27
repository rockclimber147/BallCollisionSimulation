import {
  SimulationComponent,
  SimulationModel,
  SimulationUI,
} from './component/Simulation/SimulationComponent.js';

document.addEventListener('DOMContentLoaded', () => {
  const model = new SimulationModel();
  const ui = new SimulationUI();
  const simComponent = new SimulationComponent(model, ui, 'mainContainer');
  simComponent.setup();
});
