import { ComponentUIBase, ComponentModelBase, ParentComponentBase } from '../BaseComponent.js';
import { MovingBall } from '../../ball_physics/Ball.js';
import { Drawable } from '../../display/Drawable.js';
import { AddBallComponent, AddBallModel, AddBallUI } from './AddBall/AddBallComponent.js';

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

export class SimulationUI extends ComponentUIBase {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  addBallButton?: HTMLButtonElement;

  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);
    this.canvas = this.container.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d')!;
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

export class SimulationComponent extends ParentComponentBase<SimulationModel, SimulationUI> {
  addBallsComponent: AddBallComponent;
  constructor(model: SimulationModel, ui: SimulationUI, targetId: string) {
    super(model, ui, targetId);

    this.addBallsComponent = new AddBallComponent(
      new AddBallModel(),
      new AddBallUI(),
      'AddBallComponent'
    );

    this.addAction(SimulationActionEnum.BALL_ADDED, () => {});
  }

  setupUIEvents(): void {
    this.ui.addBallButton?.addEventListener('click', () => {
      this.model.addRandomBall();
    });
  }

  async setupChildren(): Promise<void> {
    await this.addBallsComponent.setup();
  }

  tearDownChildren(): void {
    this.addBallsComponent.tearDown();
  }
}

export enum SimulationActionEnum {
  BALL_ADDED = 'ballAdded',
}
