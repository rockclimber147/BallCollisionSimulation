import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable, Line } from '../../../display/Drawable.js';
import { ComponentUIBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandlerComponentBase,
  CollisionHandlerModelBase,
  SimulationBounds,
} from '../CollisionHandler.js';

import { SimulationHandler } from '../../Simulation/SimulationEnums.js';

class AlternatingAxisPartitionUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class AlternatingAxisPartitionModel extends CollisionHandlerModelBase {
  private collisionPairs: BallCollisionPair[] = [];
  private dividingLines: Drawable[] = [];
  private maxDepth: number = 10;
  private threshold: number = 10;
  private startVertical: boolean = true;

  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    this.collisionPairs = [];
    this.dividingLines = [];
    this.subDivide(balls, 0, this.startVertical, this.collisionBounds);
    return this.collisionPairs;
  }
  getCollisionRepresentation(): Drawable[] {
    return this.dividingLines;
  }

  subDivide(
    balls: PhysicsBall[],
    depth: number,
    isVertical: boolean = true,
    bounds: SimulationBounds
  ) {
    if (balls.length <= this.threshold || depth >= this.maxDepth) {
      this.collisionCheck(balls, this.collisionPairs);
      return;
    }
    const getter = isVertical ? (ball: PhysicsBall) => ball.x : (ball: PhysicsBall) => ball.y;
    const vals = balls.map((ball) => getter(ball));
    const mid = (Math.min(...vals) + Math.max(...vals)) / 2;
    const leftOrTop: PhysicsBall[] = [];
    const rightOrBottom: PhysicsBall[] = [];
    for (const ball of balls) {
      const min = getter(ball) - ball.radius;
      const max = getter(ball) + ball.radius;
      if (min <= mid) leftOrTop.push(ball);
      if (max >= mid) rightOrBottom.push(ball);
    }
    const updatedBounds: SimulationBounds[] = this.partitionBounds(mid, bounds, isVertical);
    this.subDivide(leftOrTop, depth + 1, !isVertical, updatedBounds[0]);
    this.subDivide(rightOrBottom, depth + 1, !isVertical, updatedBounds[1]);
  }

  collisionCheck(balls: PhysicsBall[], pairs: BallCollisionPair[]) {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        pairs.push(new BallCollisionPair(balls[i], balls[j]));
      }
    }
  }

  partitionBounds(mid: number, bounds: SimulationBounds, isVertical: boolean): SimulationBounds[] {
    if (isVertical) {
      this.dividingLines.push(new Line(mid, bounds.y, mid, bounds.y + bounds.height));
      return this.splitBoundsLeftRight(mid, bounds);
    } else {
      this.dividingLines.push(new Line(bounds.x, mid, bounds.x + bounds.width, mid));
      return this.splitBoundsTopBottom(mid, bounds);
    }
  }

  splitBoundsLeftRight(mid: number, bounds: SimulationBounds): SimulationBounds[] {
    const leftWidth = mid - bounds.x;
    const rightWidth = bounds.x + bounds.width - mid;

    return [
      new SimulationBounds(bounds.x, bounds.y, leftWidth, bounds.height),
      new SimulationBounds(mid, bounds.y, rightWidth, bounds.height),
    ];
  }

  splitBoundsTopBottom(mid: number, bounds: SimulationBounds): SimulationBounds[] {
    const topHeight = mid - bounds.y;
    const bottomHeight = bounds.y + bounds.height - mid;

    return [
      new SimulationBounds(bounds.x, bounds.y, bounds.width, topHeight),
      new SimulationBounds(bounds.x, mid, bounds.width, bottomHeight),
    ];
  }

  setMaxDepth(newDepth: number) {
    this.maxDepth = newDepth;
  }

  setThreshold(newThreshold: number) {
    this.threshold = newThreshold;
  }

  setStartVertical(val: boolean) {
    this.startVertical = val;
  }
}

export class AlternatingAxisPartitionComponent extends CollisionHandlerComponentBase<
  AlternatingAxisPartitionModel,
  AlternatingAxisPartitionUI
> {
  setupChildActions(): void {
    return;
  }
  constructor(targetID: string) {
    super(
      new AlternatingAxisPartitionModel(SimulationHandler.NAIVE),
      new AlternatingAxisPartitionUI(),
      targetID
    );
  }
  setupUIEvents(): void {
    return;
  }
}
