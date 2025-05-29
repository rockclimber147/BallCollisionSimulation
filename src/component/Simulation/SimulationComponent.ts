import { ComponentUIBase, ComponentModelBase, ParentComponentBase } from '../BaseComponent.js';
import { PhysicsBall } from '../../ball_physics/Ball.js';
import { Drawable } from '../../display/Drawable.js';
import { AddBallComponent, AddBallModel, AddBallUI } from './AddBall/AddBallComponent.js';
import { NumericSliderComponent } from '../TerminalComponents/NumericSlider/NumericSliderComponent.js';
import { TickBoxComponent } from '../TerminalComponents/TickBox/TickBoxComponent.js';
import {
  CollisionHandlerModelBase,
  CollisionHandlerComponentBase,
  BallCollisionPair,
} from '../CollisionHandlers/CollisionHandler.js';
import { NaiveComponent } from '../CollisionHandlers/Naive/NaiveComponent.js';
import { SweepAndPruneComponent } from '../CollisionHandlers/SweepAndPrune/SweepAndPruneComponent.js';
export class SimulationModel extends ComponentModelBase {
  private balls: PhysicsBall[] = [];
  private fps: number = 60;
  private updateInterval?: number;
  private updateTime: string = '0';
  physicsSteps: number = 1;
  potentialCollisions: BallCollisionPair[] = [];
  drawPotentialCollisions: boolean = true;
  drawCollisionRepresentation: boolean = true;

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

  get FPS() {
    return this.fps;
  }
  set FPS(val: number) {
    this.fps = val;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.startUpdateLoop();
    }
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
      this.updateInterval = undefined;
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
    this.notify(SimulationActionEnum.UPDATE_MODEL_COLLISIONS);
    this.potentialCollisions.forEach((pair) => pair.resolveCollision());
    this.balls.forEach((ball) => {
      ball.update(deltaTime);
    });
  }

  getBallsAsDrawable(): Drawable[] {
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

  getBalls(): PhysicsBall[] {
    return this.balls;
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

  draw(drawable: Drawable) {
    drawable.draw(this.context!);
  }

  drawAll(drawables: Drawable[], clear: boolean = true) {
    if (clear) this.context!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
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
  fpsSliderComponent: NumericSliderComponent;
  physicsSubStepSliderComponent: NumericSliderComponent;
  drawPotentialCollisionsToggleComponent: TickBoxComponent;
  drawCollisionRepresentationToggleComponent: TickBoxComponent;
  collisionHandlerComponent: CollisionHandlerComponentBase<
    CollisionHandlerModelBase,
    ComponentUIBase
  >;
  constructor(model: SimulationModel, ui: SimulationUI, targetId: string) {
    super(model, ui, targetId);
    this.addBallsComponent = this.registerChild(
      new AddBallComponent(new AddBallModel(), new AddBallUI(), 'AddBallComponent')
    );

    this.fpsSliderComponent = this.registerChild(
      new NumericSliderComponent('fpsSlider', 'FPS: ', {
        value: this.model.FPS,
      })
    );

    this.physicsSubStepSliderComponent = this.registerChild(
      new NumericSliderComponent('physicsSubStepSlider', 'Physics Substeps: ', {
        value: this.model.physicsSteps,
        max: 20,
      })
    );

    this.drawPotentialCollisionsToggleComponent = this.registerChild(
      new TickBoxComponent('drawCollisions', 'Draw Potential Collisions: ', true)
    );

    this.drawCollisionRepresentationToggleComponent = this.registerChild(
      new TickBoxComponent('drawCollisionRepresentation', 'Draw Collision Representation: ')
    );

    this.collisionHandlerComponent = this.registerChild(new NaiveComponent('collisionHandler'));

    this.addAction(SimulationActionEnum.BALL_ADDED, this.ballAdded);

    this.addAction(SimulationActionEnum.DRAW_BALLS, this.drawBalls);

    this.addAction(SimulationActionEnum.UPDATE_TIME, this.updateTime);

    this.addAction(
      SimulationActionEnum.UPDATE_MODEL_COLLISIONS,
      this.updateModelPotentialCollisions
    );
  }

  setupUIEvents(): void {
    const ui = this.ui;

    ui.registerEventListener(ui.startPauseButton!, 'click', (event) => {
      const state = (event?.target as HTMLButtonElement).textContent;
      ui.toggleStartPause();
      if (state === UIStartPauseEnum.START) {
        this.model.startUpdateLoop();
      } else {
        this.model.stopUpdateLoop();
      }
    });

    ui.registerEventListener(ui.tickButton!, 'click', () => {
      this.model.tick();
    });

    ui.registerEventListener(ui.clearBallsButton!, 'click', () => {
      this.clearBalls();
    });
  }

  setupChildActions(): void {
    this.addAction(this.fpsSliderComponent.getID(), () => {
      this.model.FPS = this.fpsSliderComponent.getValue();
    });

    this.addAction(this.drawPotentialCollisionsToggleComponent.getID(), () => {
      this.model.drawPotentialCollisions = this.drawPotentialCollisionsToggleComponent.getValue();
      this.drawBalls();
    });

    this.addAction(this.drawCollisionRepresentationToggleComponent.getID(), () => {
      this.model.drawCollisionRepresentation =
        this.drawCollisionRepresentationToggleComponent.getValue();
      this.drawBalls();
    });

    this.addAction(this.physicsSubStepSliderComponent.getID(), () => {
      this.model.physicsSteps = this.physicsSubStepSliderComponent.getValue();
    });
  }

  ballAdded = () => {
    this.model.addBalls(this.addBallsComponent.getBalls());
    this.drawBalls();
  };

  drawBalls = () => {
    this.ui.drawAll([], true);
    if (this.model.drawCollisionRepresentation)
      this.ui.drawAll(this.collisionHandlerComponent.getCollisionRepresentation(), false);
    this.ui.drawAll(this.model.getBallsAsDrawable(), false);
    if (this.model.drawPotentialCollisions) this.ui.drawAll(this.model.potentialCollisions, false);
  };

  clearBalls = () => {
    this.model.clearBalls();
    this.drawBalls();
  };

  updateTime = () => {
    this.ui.setUpdateTimeSpan(this.model.UpdateTime);
  };

  updateModelPotentialCollisions = () => {
    this.model.potentialCollisions = this.collisionHandlerComponent.getAllPotentialCollisions(
      this.model.getBalls()
    );
  };

  async updateCollisionHandler(
    newHandler: CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>
  ) {
    this.collisionHandlerComponent.tearDown();
    this.collisionHandlerComponent = this.registerChild(newHandler);
    await newHandler.setup();
  }
}

export enum SimulationActionEnum {
  BALL_ADDED = 'ballAdded',
  DRAW_BALLS = 'drawBalls',
  UPDATE_TIME = 'updateTime',
  UPDATE_MODEL_COLLISIONS = 'updateModelCollisions',
}

enum UIStartPauseEnum {
  START = 'Start',
  PAUSE = 'PAUSE',
}
