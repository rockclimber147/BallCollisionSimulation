import { ComponentUIBase, ComponentModelBase, ComponentBase } from './component/component.js';
import { MovingBall } from './ball_physics/Ball.js';
import { Drawable } from './display/Drawable.js';

export class SimulationModel extends ComponentModelBase {
  balls: MovingBall[] = [];
  fps: number = 60;
  get BallCount(): number {
    return this.balls.length;
  }

  constructor() {
    super();
  }

  getDrawables(): Drawable[] {
    return this.balls;
  }
}

export class SimulationUI extends ComponentUIBase<SimulationModel> {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(model: SimulationModel) {
    super(model);
    this.canvas = document.createElement('canvas');

    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to get 2D context');
    }

    this.context = context;
  }

  setup(): void {
    this.container = document.createElement('div');
    this.canvas.style.border = '1px solid black';
    this.container.appendChild(this.canvas);
  }

  tearDown(): void {
    throw new Error('Method not implemented.');
  }

  draw() {
    for (const drawable of this.model.getDrawables()) {
      drawable.draw(this.context);
    }
  }
}

export class SimulationComponent extends ComponentBase<SimulationModel, SimulationUI> {}
