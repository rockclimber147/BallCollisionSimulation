import { ComponentUIBase, ComponentModelBase, ComponentBase } from '../BaseComponent.js';
import { MovingBall } from '../../ball_physics/Ball.js';
import { Drawable } from '../../display/Drawable.js';

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
    this.balls.push(ball);
    this.notify(SimulationActionEnum.BALL_ADDED);
  }
}

export class SimulationUI extends ComponentUIBase<SimulationModel> {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  addBallButton?: HTMLButtonElement;

  constructor(model: SimulationModel) {
    super(model);
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);
    this.canvas = this.container.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d')!;
    this.addBallButton = this.container.querySelector('#addBallButton')!;
  }

  tearDown(): void {
    this.container?.remove();
  }

  draw(drawable: Drawable) {
    drawable.draw(this.context!);
  }

  drawAll(drawables: Drawable[]) {
    for (const drawable of drawables) {
      drawable.draw(this.context!);
    }
  }
}

export class SimulationComponent extends ComponentBase<SimulationModel, SimulationUI> {
  constructor(model: SimulationModel, ui: SimulationUI, targetId: string) {
    super(model, ui, targetId);

    this.addAction(SimulationActionEnum.BALL_ADDED, () => {
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

enum SimulationActionEnum {
  BALL_ADDED = 'ballAdded',
}
