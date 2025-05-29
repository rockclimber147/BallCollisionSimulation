export interface Drawable {
  draw(context: CanvasRenderingContext2D): void;
}

export class Line implements Drawable {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  alpha: number;

  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = 'black',
    alpha: number = 1
  ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.alpha = alpha;
  }

  draw(context: CanvasRenderingContext2D) {
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.strokeStyle = this.color;
    context.stroke();
    context.closePath();
    context.globalAlpha = 1;
  }
}

export class Rectangle implements Drawable {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
  fill: boolean;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = 'black',
    alpha: number = 1,
    fill: boolean = true
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.alpha = alpha;
    this.fill = fill;
  }

  draw(context: CanvasRenderingContext2D) {
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);

    if (this.fill) {
      context.fillStyle = this.color;
      context.fill();
    } else {
      context.strokeStyle = this.color;
      context.stroke();
    }

    context.closePath();
    context.globalAlpha = 1;
  }
}
