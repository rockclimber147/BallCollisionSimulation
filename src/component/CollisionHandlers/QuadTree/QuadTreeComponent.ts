import {
  CollisionHandlerModelBase,
  CollisionHandlerComponentBase,
  BallCollisionPair,
} from '../CollisionHandler.js';
import { ComponentUIBase } from '../../BaseComponent.js';
import { SimulationHandler } from '../../Simulation/SimulationEnums.js';
import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable } from '../../../display/Drawable.js';

class QuadTreeUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class QuadTreeModel extends CollisionHandlerModelBase {
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    return [];
  }
  getCollisionRepresentation(balls: PhysicsBall[]): Drawable[] {
    return [];
  }
}

export class QuadTreeComponent extends CollisionHandlerComponentBase<QuadTreeModel, QuadTreeUI> {
  constructor(targetID: string) {
    super(new QuadTreeModel(SimulationHandler.QUAD_TREE), new QuadTreeUI(), targetID);
  }
  setupChildActions(): void {
    return;
  }
  setupUIEvents(): void {
    return;
  }
}
