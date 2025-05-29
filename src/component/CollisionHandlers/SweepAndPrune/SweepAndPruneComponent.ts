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
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    if (balls.length < 2) return [];
    return [];
  }
  getCollisionRepresentation(): Drawable[] {
    return [];
  }
  checkX: boolean = true;
  checkY: boolean = true;
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
