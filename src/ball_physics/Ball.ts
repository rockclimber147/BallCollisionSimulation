import { Drawable } from '../display/Drawable.js';

class Vector {
  x: number = 0;
  y: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector) {
    this.x += other.x;
    this.y += other.y;
  }

  scaleBy(factor: number) {
    this.x *= factor;
    this.y *= factor;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  scaleTo(target: number) {
    const factor = target / this.length();
    this.scaleBy(factor);
  }
}

class Ball implements Drawable {
  private static globalIdCount = 1;
  id: number;
  position: Vector;
  radius: number;
  color: string;

  constructor(position: Vector, radius: number, color: string) {
    this.id = Ball.globalIdCount++;
    this.position = position;
    this.radius = radius;
    this.color = color;
  }
  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  set x(value: number) {
    this.position.x = value;
  }

  set y(value: number) {
    this.position.y = value;
  }
}

export class MovingBall extends Ball {
  static xBounds: number = 800;
  static yBounds: number = 600;

  velocity: Vector;

  constructor(position: Vector, radius: number, color: string, velocity: Vector) {
    super(position, radius, color);
    this.velocity = velocity;
  }

  get vx(): number {
    return this.velocity.x;
  }

  get vy(): number {
    return this.velocity.y;
  }

  set vx(value: number) {
    this.velocity.x = value;
  }

  set vy(value: number) {
    this.velocity.y = value;
  }

  handleWallCollision(deltaTime: number) {
    const prevX = this.x - this.vx * deltaTime;
    const prevY = this.y - this.vy * deltaTime;

    const leftCollision = this.x - this.radius < 0;
    const rightCollision = this.x + this.radius > MovingBall.xBounds;
    const topCollision = this.y - this.radius < 0;
    const bottomCollision = this.y + this.radius > MovingBall.yBounds;

    if (leftCollision || rightCollision) {
      const wallX = leftCollision ? this.radius : MovingBall.xBounds - this.radius;

      const tX = (wallX - prevX) / (this.x - prevX);
      this.x = prevX + (this.x - prevX) * tX;
      this.y = prevY + (this.y - prevY) * tX;

      this.vx *= -1;

      const remainingTime = (1 - tX) * deltaTime;
      this.x += this.vx * remainingTime;
      this.y += this.vy * remainingTime;
    }

    if (topCollision || bottomCollision) {
      const wallY = topCollision ? this.radius : MovingBall.yBounds - this.radius;

      const tY = (wallY - prevY) / (this.y - prevY);
      this.x = prevX + (this.x - prevX) * tY;
      this.y = prevY + (this.y - prevY) * tY;

      this.vy *= -1;

      const remainingTime = (1 - tY) * deltaTime;
      this.x += this.vx * remainingTime;
      this.y += this.vy * remainingTime;
    }
  }

  update(deltatime: number) {
    this.x += this.vx * deltatime;
    this.y += this.vy * deltatime;
    this.handleWallCollision(deltatime);
  }

  static createRandomBall(): MovingBall {
    const radius = Math.min(20, Math.random() * 40 + 10);
    const x = MovingBall.xBounds * 0.5 + (Math.random() - 0.5) * MovingBall.xBounds * 0.5;
    const y = MovingBall.yBounds * 0.5 + (Math.random() - 0.5) * MovingBall.yBounds * 0.5;
    const vx = (Math.random() - 0.5) * 200;
    const vy = (Math.random() - 0.5) * 200;
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    return new MovingBall(new Vector(x, y), radius, color, new Vector(vx, vy));
  }
}
