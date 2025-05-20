import { BehaviorBall } from './Ball.js';

export interface IBehavior {
  applyBehavior(ball: BehaviorBall, deltaTime: number): void;
}

export abstract class BehaviorBase implements IBehavior {
  private static instances: Map<string, BehaviorBase> = new Map();
  abstract applyBehavior(ball: BehaviorBall, deltaTime: number): void;
}

export class GravityBehavior extends BehaviorBase {
  static instance: GravityBehavior;
  static gravityConstant = 0;

  applyBehavior(ball: BehaviorBall, deltaTime: number): void {
    ball.vy += GravityBehavior.gravityConstant * deltaTime;
  }

  static getInstance() {
    if (!GravityBehavior.instance) {
      GravityBehavior.instance = new GravityBehavior();
    }
    return GravityBehavior.instance;
  }
}

export class MouseAttractBehavior extends BehaviorBase {
  static instance: MouseAttractBehavior;

  attractConstant = 1000;
  mouseX = 0;
  mouseY = 0;

  constructor(mouseX: number, mouseY: number, attractConstant: number = 1000) {
    super();
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    this.attractConstant = attractConstant;
  }

  applyBehavior(ball: BehaviorBall, deltaTime: number): void {
    const dx = ball.x - this.mouseX;
    const dy = ball.y - this.mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = this.attractConstant / (distance * distance);
    const angle = Math.atan2(dy, dx);
    ball.vx -= force * Math.cos(angle) * deltaTime;
    ball.vy -= force * Math.sin(angle) * deltaTime;
  }

  static getInstance() {
    if (!MouseAttractBehavior.instance) {
      MouseAttractBehavior.instance = new MouseAttractBehavior(0, 0, 1000);
    }
    return MouseAttractBehavior.instance;
  }
}
