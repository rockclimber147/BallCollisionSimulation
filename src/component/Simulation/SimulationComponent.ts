import { ComponentUIBase, ComponentModelBase, ParentComponentBase } from '../BaseComponent.js';
import { PhysicsBall } from '../../ball_physics/Ball.js';
import { Drawable } from '../../display/Drawable.js';
import { AddBallComponent, AddBallModel, AddBallUI } from './AddBall/AddBallComponent.js';
// import { NaiveCollisionHandler } from '../../ball_physics/CollisionHandler.js';

export class SimulationModel extends ComponentModelBase {
  private balls: PhysicsBall[] = [];
  fps: number = 60;
  updateInterval?: number;
  private updateTime: string = '0';
  physicsSteps: number = 1;

  constructor() {
    super();
  }

  get UpdateTime() {
    return this.updateTime;
  }
  set UpdateTime(val: string) {
    this.updateTime = val;
    this.notify(SimulationActionEnum.UPDATE_TIME);
  }

  startUpdateLoop() {
    const interval = 1000 / this.fps;
    this.updateInterval = window.setInterval(() => {
      this.tick();
    }, interval);
  }

  stopUpdateLoop() {
    if (this.updateInterval !== undefined) {
      clearInterval(this.updateInterval);
    }
  }

  tick() {
    const startTime = performance.now();
    const deltaTime = 1 / this.fps;
    const deltaTimeStep = deltaTime / this.physicsSteps;
    for (let i = 0; i < this.physicsSteps; i++) {
      this.update(deltaTimeStep);
    }
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    this.UpdateTime = timeTaken.toFixed(2);
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

  clearBalls() {
    this.balls.length = 0;
  }

  get BallCount(): number {
    return this.balls.length;
  }
}

export class SimulationUI extends ComponentUIBase {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  startPauseButton?: HTMLButtonElement;
  clearBallsButton?: HTMLButtonElement;
  tickButton?: HTMLButtonElement;
  updateTimeSpan?: HTMLSpanElement;

  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);
    this.canvas = this.container.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d')!;
    this.startPauseButton = this.container.querySelector('#start')!;
    this.clearBallsButton = this.container.querySelector('#clearBalls')!;
    this.tickButton = this.container.querySelector('#tick')!;
    this.updateTimeSpan = this.container.querySelector('#updateTime')!;
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

  setUpdateTimeSpan(time: string) {
    this.updateTimeSpan!.innerHTML = time;
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

    this.addAction(SimulationActionEnum.UPDATE_TIME, this.updateTime);
  }

  setupUIEvents(): void {
    this.ui.startPauseButton!.addEventListener('click', () => {
      const state = (event?.target as HTMLButtonElement).textContent;
      this.ui.toggleStartPause();
      if (state == UIStartPauseEnum.START) this.model.startUpdateLoop();
      else this.model.stopUpdateLoop();
    });

    this.ui.tickButton!.addEventListener('click', () => {
      this.model.tick();
    });

    this.ui.clearBallsButton!.addEventListener('click', () => {
      this.clearBalls();
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

  clearBalls = () => {
    this.model.clearBalls();
    this.drawBalls();
  };

  updateTime = () => {
    this.ui.setUpdateTimeSpan(this.model.UpdateTime);
  };
}

export enum SimulationActionEnum {
  BALL_ADDED = 'ballAdded',
  DRAW_BALLS = 'drawBalls',
  UPDATE_TIME = 'updateTime',
}

enum UIStartPauseEnum {
  START = 'Start',
  PAUSE = 'PAUSE',
}
