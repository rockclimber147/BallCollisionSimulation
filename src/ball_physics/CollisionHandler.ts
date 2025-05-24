import { PhysicsBall } from './Ball.js';
import { Drawable, Line } from '../display/Drawable.js';

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

export interface CollisionHandler {
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[];
  getCollisionRepresentation(): Drawable[];
}

export abstract class CollisionHandlerBase implements CollisionHandler {
  handlerName: string;
  collisionRepresentation: Drawable[] = [];
  constructor(handlerName: string) {
    this.handlerName = handlerName;
  }
  getTimeTakenForAction(action: () => void): number {
    const startTime = performance.now();
    action();
    const endTime = performance.now();
    return endTime - startTime;
  }

  abstract getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[];
  abstract getCollisionRepresentation(): Drawable[];
}

export class NaiveCollisionHandler extends CollisionHandlerBase {
  constructor() {
    super('Naive');
  }

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
    return this.collisionRepresentation;
  }
}
