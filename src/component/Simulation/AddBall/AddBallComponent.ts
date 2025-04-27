import { MovingBall } from '../../../ball_physics/Ball.js';
import { TerminalComponentBase, ComponentModelBase, ComponentUIBase } from '../../BaseComponent.js';

export class AddBallModel extends ComponentModelBase {
  private toAddCount: number = 1;
  private mode: BallModeEnum.RANDOM | BallModeEnum.SPECIFIC = BallModeEnum.RANDOM
  private color: string = "#ff0000"
  private radius: number = 10;
  private mass: number = 50;

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
    if (this.mode == BallModeEnum.RANDOM) return ball;
    ball.color = this.color;
    ball.radius = this.radius;
    return ball;
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
