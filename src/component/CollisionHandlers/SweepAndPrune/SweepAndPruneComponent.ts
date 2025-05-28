import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable } from '../../../display/Drawable.js';
import { ComponentUIBase, ParentComponentBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandler,
  CollisionHandlerModelBase,
} from '../CollisionHandler.js';

class SweepAndPruneUI extends ComponentUIBase {
  setup(): Promise<void> {
    return Promise.resolve();
  }

  tearDown(): void {
    return;
  }
}

class SweepAndPruneModel extends CollisionHandlerModelBase {
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    throw new Error('Method not implemented.');
  }
  getCollisionRepresentation(): Drawable[] {
    throw new Error('Method not implemented.');
  }
  checkX: boolean = true;
  checkY: boolean = true;
}

export class SweepAndPruneComponent
  extends ParentComponentBase<SweepAndPruneModel, SweepAndPruneUI>
  implements CollisionHandler
{
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    return this.model.getAllPotentialCollisions(balls);
  }
  getCollisionRepresentation(): Drawable[] {
    return this.model.getCollisionRepresentation();
  }

  setupChildren(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  tearDownChildren(): void {
    throw new Error('Method not implemented.');
  }
  setupUIEvents(): void {
    throw new Error('Method not implemented.');
  }
}
