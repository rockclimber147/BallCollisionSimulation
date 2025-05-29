import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable } from '../../../display/Drawable.js';
import { ComponentUIBase, ParentComponentBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandler,
  CollisionHandlerModelBase,
} from '../CollisionHandler.js';
import { SimulationHandler } from '../../Simulation/SimulationEnums.js';

class SweepAndPruneUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class SweepAndPruneModel extends CollisionHandlerModelBase {
  getX: (ball: PhysicsBall) => number = (ball: PhysicsBall) => ball.x;
  getY: (ball: PhysicsBall) => number = (ball: PhysicsBall) => ball.y;

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
      const minX = axis(currentBall) - currentBall.radius;
      while (
        start < activeBalls.length &&
        axis(activeBalls[start]) + activeBalls[start].radius < minX
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

  getCollisionRepresentation(): Drawable[] {
    return [];
  }
}

export class SweepAndPruneComponent
  extends ParentComponentBase<SweepAndPruneModel, SweepAndPruneUI>
  implements CollisionHandler
{
  constructor(targetID: string) {
    super(
      new SweepAndPruneModel(SimulationHandler.SWEEP_AND_PRUNE),
      new SweepAndPruneUI(),
      targetID
    );
  }
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    return this.model.getAllPotentialCollisions(balls);
  }
  getCollisionRepresentation(): Drawable[] {
    return this.model.getCollisionRepresentation();
  }

  setupChildActions(): void {
    return;
  }
  setupUIEvents(): void {
    return;
  }
}
