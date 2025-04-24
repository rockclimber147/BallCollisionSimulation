import { ComponentUIBase, ComponentModelBase, ComponentBase } from './component/BaseComponent.js';
import { MovingBall } from './ball_physics/Ball.js';
import { Drawable } from './display/Drawable.js';

export class SimulationModel extends ComponentModelBase {
  private balls: MovingBall[] = [];
  fps: number = 60;
  get BallCount(): number {
    return this.balls.length;
  }

  constructor() {
    super();
  }

  getBalls(): Drawable[] {
    return this.balls;
  }

  addRandomBall() {
    const ball = MovingBall.createRandomBall();
    console.log('adding ball: ');
    console.log(ball);
    this.balls.push(ball);
    this.notify(SimulationActionEnum.BALL_ADDED);
  }
}

export class SimulationUI extends ComponentUIBase<SimulationModel> {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  addBallButton?: HTMLButtonElement;

  constructor(model: SimulationModel) {
    super(model);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;

    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to get 2D context');
    }

    this.context = context;
  }

  setup(): void {
    this.container = document.createElement('div');
    this.canvas.style.border = '1px solid black';

    this.addBallButton = document.createElement('button');
    this.addBallButton.textContent = 'Add Ball';

    this.container.appendChild(this.canvas);
    this.container.appendChild(this.addBallButton);
  }

  tearDown(): void {
    throw new Error('Method not implemented.');
  }

  draw(drawable: Drawable) {
    drawable.draw(this.context);
  }

  drawAll(drawables: Drawable[]) {
    for (const drawable of drawables) {
      drawable.draw(this.context);
    }
  }
}

export class SimulationComponent extends ComponentBase<SimulationModel, SimulationUI> {
  constructor(model: SimulationModel, ui: SimulationUI, targetId: string) {
    super(model, ui, targetId);

    this.ui.addAction(SimulationActionEnum.BALL_ADDED, () => {
      const allBalls = this.model.getBalls();
      const finalBall = allBalls[allBalls.length - 1];
      this.ui.draw(finalBall);
    });
  }

  setupUIEvents(): void {
    this.ui.addBallButton?.addEventListener('click', () => {
      this.model.addRandomBall();
    });
  }
}

class SimulationActionEnum {
  static readonly BALL_ADDED = 'ballAdded';
}
