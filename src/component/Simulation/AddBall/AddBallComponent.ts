import { MovingBall } from '../../../ball_physics/Ball.js';
import { TerminalComponentBase, ComponentModelBase, ComponentUIBase } from '../../BaseComponent.js';

export class AddBallModel extends ComponentModelBase {
  private _toAddCount: number = 1;
  private _mode: BallModeEnum.RANDOM | BallModeEnum.SPECIFIC = BallModeEnum.RANDOM
  private _color: string = "#ff0000"
  private _radius: number = 10;
  private _mass: number = 50;

  constructor() {
    super();
  }

  getBalls(): MovingBall[] {
    const balls: MovingBall[] = [];
    for (let i = 1; i <= this.toAddCount; i++) {
      balls.push(this.createBall())
    }
    return balls
  }

  private createBall(): MovingBall {
    const ball = MovingBall.createRandomBall()
    if (this._mode == BallModeEnum.RANDOM) return ball;
    ball.color = this._color;
    ball.radius = this._radius;
    return ball;
  }

  get toAddCount(): number {
    return this._toAddCount;
  }

  set toAddCount(count: number) {
    if (count < 1) {
      throw new Error('toAddCount must be at least 1');
    }
    this.toAddCount = count;
  }
  get mode(): BallModeEnum.RANDOM | BallModeEnum.SPECIFIC {
    return this._mode;
  }

  set mode(newMode: BallModeEnum.RANDOM | BallModeEnum.SPECIFIC) {
    this._mode = newMode;
  }

  get color(): string {
    return this._color;
  }

  set color(newColor: string) {
    this._color = newColor;
  }

  get radius(): number {
    return this._radius;
  }

  set radius(newRadius: number) {
    if (newRadius <= 0) {
      throw new Error('Radius must be a positive number');
    }
    this._radius = newRadius;
  }

  get mass(): number {
    return this._mass;
  }

  set mass(newMass: number) {
    if (newMass <= 0) {
      throw new Error('Mass must be a positive number');
    }
    this._mass = newMass;
  }
}

export class AddBallUI extends ComponentUIBase {
  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);
  }

  tearDown(): void {
    this.container?.remove();
  }
}

export class AddBallComponent extends TerminalComponentBase<AddBallModel, AddBallUI> {
  constructor(model: AddBallModel, ui: AddBallUI, targetId: string) {
    super(model, ui, targetId);
  }

  setupUIEvents(): void {}
}

enum BallModeEnum {
    RANDOM = "Random",
    SPECIFIC = "Specific"
}
