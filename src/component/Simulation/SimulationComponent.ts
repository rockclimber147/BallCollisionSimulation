import { ComponentUIBase, ComponentModelBase, ParentComponentBase } from '../BaseComponent.js';
import { PhysicsBall } from '../../ball_physics/Ball.js';
import { Drawable } from '../../display/Drawable.js';
import { AddBallComponent, AddBallModel, AddBallUI } from './AddBall/AddBallComponent.js';

export class SimulationModel extends ComponentModelBase {
  private balls: PhysicsBall[] = [];
  fps: number = 60;
  updateInterval?: number;
  updateTime: string = '0';
  physicsSteps: number = 1;

  constructor() {
    super();
  }

  startUpdateLoop() {
    const interval = 1000 / this.fps;
    this.updateInterval = window.setInterval(() => {
      const startTime = performance.now();

      this.tick();

      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      this.updateTime = timeTaken.toFixed(2);
    }, interval);
  }

  stopUpdateLoop() {
    if (this.updateInterval !== undefined) {
      clearInterval(this.updateInterval);
    }
  }

  tick() {
    const deltaTime = 1 / this.fps;
    const deltaTimeStep = deltaTime / this.physicsSteps;
    for (let i = 0; i < this.physicsSteps; i++) {
      this.update(deltaTimeStep);
    }
    this.notify(SimulationActionEnum.DRAW_BALLS);
  }

  update(deltaTime: number) {
    this.balls.forEach((ball) => {
      ball.update(deltaTime);
    });
  }

  getBalls(): Drawable[] {
    return this.balls;
  }

  addBalls(balls: PhysicsBall[]) {
    this.balls = this.balls.concat(balls);
  }

  get BallCount(): number {
    return this.balls.length;
  }
}

export class SimulationUI extends ComponentUIBase {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  startPauseButton?: HTMLButtonElement;

  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);
    this.canvas = this.container.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d')!;
    this.startPauseButton = this.container.querySelector('#start')!;
  }

  tearDown(): void {
    this.container?.remove();
  }

  draw(drawable: Drawable) {
    drawable.draw(this.context!);
  }

  drawAll(drawables: Drawable[]) {
    this.context!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    for (const drawable of drawables) {
      drawable.draw(this.context!);
    }
  }

  toggleStartPause() {
    if (this.startPauseButton?.textContent == UIStartPauseEnum.START)
      this.startPauseButton!.textContent = UIStartPauseEnum.PAUSE;
    else this.startPauseButton!.textContent = UIStartPauseEnum.START;
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
    this.addBallsComponent.addObserver(this);

    this.addAction(SimulationActionEnum.BALL_ADDED, this.ballAdded);

    this.addAction(SimulationActionEnum.DRAW_BALLS, this.drawBalls);
  }

  setupUIEvents(): void {
    this.ui.startPauseButton!.addEventListener('click', () => {
      const state = (event?.target as HTMLButtonElement).textContent;
      this.ui.toggleStartPause();
      if (state == UIStartPauseEnum.START) this.model.startUpdateLoop();
      else this.model.stopUpdateLoop();
    });
  }

  async setupChildren(): Promise<void> {
    await this.addBallsComponent.setup();
  }

  tearDownChildren(): void {
    this.addBallsComponent.tearDown();
  }

  ballAdded = () => {
    this.model.addBalls(this.addBallsComponent.getBalls());
    this.drawBalls();
  };

  drawBalls = () => {
    this.ui.drawAll(this.model.getBalls());
  };
}

export enum SimulationActionEnum {
  BALL_ADDED = 'ballAdded',
  DRAW_BALLS = 'drawBalls',
}

enum UIStartPauseEnum {
  START = 'Start',
  PAUSE = 'PAUSE',
}
