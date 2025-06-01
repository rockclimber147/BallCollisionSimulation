import { Ball, PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable, Rectangle } from '../../../display/Drawable.js';
import { ComponentUIBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandlerComponentBase,
  CollisionHandlerModelBase,
} from '../CollisionHandler.js';
import { SimulationHandler } from '../../Simulation/SimulationEnums.js';
import { TickBoxComponent } from '../../TerminalComponents/TickBox/TickBoxComponent.js';
import { SimulationActionEnum } from '../../Simulation/SimulationComponent.js';

class SweepAndPruneUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class SweepAndPruneModel extends CollisionHandlerModelBase {
  getX: (ball: PhysicsBall) => number = (ball: PhysicsBall) => ball.x - ball.radius;
  getY: (ball: PhysicsBall) => number = (ball: PhysicsBall) => ball.y - ball.radius;

  filterX: boolean = true;
  filterY: boolean = true;

  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    let collisionPairs: BallCollisionPair[] = [];
    if (this.filterX) collisionPairs = this.getCollisionsAlongAxis(balls, this.getX);
    if (this.filterY && !this.filterX)
      collisionPairs = this.getCollisionsAlongAxis(balls, this.getY);
    if (this.filterX && this.filterY) {
      const yFilteredPairs: BallCollisionPair[] = [];
      collisionPairs.forEach((pair) => {
        const yDistance = Math.abs(pair.ball1.y - pair.ball2.y);
        if (yDistance <= pair.ball1.radius + pair.ball2.radius) yFilteredPairs.push(pair);
      });
      collisionPairs = yFilteredPairs;
    }
    return collisionPairs;
  }

  getCollisionsAlongAxis(balls: PhysicsBall[], axis: (ball: PhysicsBall) => number) {
    balls.sort((a, b) => axis(a) - axis(b));
    const activeBalls: PhysicsBall[] = [];
    const collisionPairs: BallCollisionPair[] = [];

    let start = 0;

    for (const currentBall of balls) {
      const minX = axis(currentBall);
      while (
        start < activeBalls.length &&
        axis(activeBalls[start]) + 2 * activeBalls[start].radius < minX
      ) {
        start++;
      }

      for (let i = start; i < activeBalls.length; i++) {
        collisionPairs.push(new BallCollisionPair(currentBall, activeBalls[i]));
      }
      activeBalls.push(currentBall);
    }

    return collisionPairs;
  }

  getCollisionRepresentation(balls: PhysicsBall[]): Drawable[] {
    const collisionRepresentation: Drawable[] = [];
    if (this.filterX || this.filterY)
      balls.forEach((ball: Ball) =>
        collisionRepresentation.push(...this.getRectangleForBall(ball))
      );
    return collisionRepresentation;
  }

  getRectangleForBall(ball: Ball) {
    const rectangles: Rectangle[] = [];
    if (this.filterX)
      rectangles.push(
        new Rectangle(
          ball.x - ball.radius,
          this.collisionBounds.y,
          2 * ball.radius,
          this.collisionBounds.height,
          'black',
          0.2,
          true
        )
      );
    if (this.filterY)
      rectangles.push(
        new Rectangle(
          this.collisionBounds.x,
          ball.y - ball.radius,
          this.collisionBounds.width,
          2 * ball.radius,
          'black',
          0.2,
          true
        )
      );
    return rectangles;
  }
}

export class SweepAndPruneComponent extends CollisionHandlerComponentBase<
  SweepAndPruneModel,
  SweepAndPruneUI
> {
  sortX: TickBoxComponent;
  sortY: TickBoxComponent;
  constructor(targetID: string) {
    super(
      new SweepAndPruneModel(SimulationHandler.SWEEP_AND_PRUNE),
      new SweepAndPruneUI(),
      targetID
    );
    this.sortX = this.registerChild(new TickBoxComponent('sortX', 'X axis: '));
    this.sortY = this.registerChild(new TickBoxComponent('sortX', 'Y axis: '));
  }

  setupChildActions(): void {
    this.addAction(this.sortX.getID(), () => {
      this.model.filterX = this.sortX.getValue();
      this.notify(SimulationActionEnum.DRAW_BALLS);
    });
    this.addAction(this.sortY.getID(), () => {
      this.model.filterY = this.sortY.getValue();
      this.notify(SimulationActionEnum.DRAW_BALLS);
    });
    return;
  }
  setupUIEvents(): void {
    return;
  }
}
