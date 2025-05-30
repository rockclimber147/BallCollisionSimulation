import { PhysicsBall } from '../../ball_physics/Ball.js';
import { Drawable, Line } from '../../display/Drawable.js';
import { ComponentModelBase, ComponentUIBase, ParentComponentBase } from '../BaseComponent.js';

export class BallCollisionPair implements Drawable {
  ball1: PhysicsBall;
  ball2: PhysicsBall;
  hasCollided: boolean = false;

  constructor(ball1: PhysicsBall, ball2: PhysicsBall) {
    this.ball1 = ball1;
    this.ball2 = ball2;
  }

  equals(other: BallCollisionPair): boolean {
    return (
      (this.ball1.id == other.ball1.id && this.ball2.id == other.ball2.id) ||
      (this.ball1.id == other.ball2.id && this.ball2.id == other.ball1.id)
    );
  }

  getCollisionLine(): Line {
    return new Line(
      this.ball1.x,
      this.ball1.y,
      this.ball2.x,
      this.ball2.y,
      this.hasCollided ? 'green' : 'red',
      0.5
    );
  }

  draw(context: CanvasRenderingContext2D): void {
    const color = this.hasCollided ? 'green' : 'red';
    const collisionLine = new Line(
      this.ball1.x,
      this.ball1.y,
      this.ball2.x,
      this.ball2.y,
      color,
      0.5
    );
    collisionLine.draw(context);
  }

  getId(): number {
    return (
      Math.max(this.ball1.id, this.ball2.id) * 1000000 + Math.min(this.ball1.id, this.ball2.id)
    );
  }

  resolveCollision(): void {
    this.hasCollided = this.ball1.handleCollision(this.ball2);
  }
}

export class SimulationBounds {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number = 0, y: number = 0, width: number = 1000, height: number = 1000) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export interface CollisionHandler {
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[];
  getCollisionRepresentation(balls?: PhysicsBall[]): Drawable[];
}

export abstract class CollisionHandlerModelBase
  extends ComponentModelBase
  implements CollisionHandler
{
  collisionBounds: SimulationBounds = new SimulationBounds();
  handlerName: string;
  collisionRepresentation: Drawable[] = [];
  constructor(handlerName: string) {
    super();
    this.handlerName = handlerName;
  }

  abstract getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[];
  abstract getCollisionRepresentation(balls: PhysicsBall[]): Drawable[];
}

export abstract class CollisionHandlerComponentBase<
    M extends CollisionHandlerModelBase,
    U extends ComponentUIBase,
  >
  extends ParentComponentBase<M, U>
  implements CollisionHandler
{
  setCollisionBounds(bounds: SimulationBounds) {
    this.model.collisionBounds = bounds;
  }
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    return this.model.getAllPotentialCollisions(balls);
  }
  getCollisionRepresentation(balls: PhysicsBall[]): Drawable[] {
    return this.model.getCollisionRepresentation(balls);
  }
}
