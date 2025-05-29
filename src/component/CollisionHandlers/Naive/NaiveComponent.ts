import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable } from '../../../display/Drawable.js';
import { ComponentUIBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandler,
  CollisionHandlerComponentBase,
  CollisionHandlerModelBase,
} from '../CollisionHandler.js';

import { SimulationHandler } from '../../Simulation/SimulationEnums.js';

class NaiveUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class NaiveModel extends CollisionHandlerModelBase {
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    const pairs: BallCollisionPair[] = [];
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        pairs.push(new BallCollisionPair(balls[i], balls[j]));
      }
    }
    return pairs;
  }
  getCollisionRepresentation(): Drawable[] {
    return [];
  }
}

export class NaiveComponent
  extends CollisionHandlerComponentBase<NaiveModel, NaiveUI>
  implements CollisionHandler
{
  setupChildren(): Promise<void> {
    return Promise.resolve();
  }
  tearDownChildren(): void {
    return;
  }
  constructor(targetID: string) {
    super(new NaiveModel(SimulationHandler.NAIVE), new NaiveUI(), targetID);
  }
  setupUIEvents(): void {
    return;
  }

  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    return this.model.getAllPotentialCollisions(balls);
  }
  getCollisionRepresentation(): Drawable[] {
    return this.model.getCollisionRepresentation();
  }
}
