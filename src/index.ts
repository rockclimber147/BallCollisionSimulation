import { SimulationComponent, SimulationModel, SimulationUI } from './SimulationComponent.js';

document.addEventListener('DOMContentLoaded', () => {
  const model = new SimulationModel();
  const ui = new SimulationUI(model);
  const simComponent = new SimulationComponent(model, ui, 'mainContainer');
  simComponent.setup();
});
