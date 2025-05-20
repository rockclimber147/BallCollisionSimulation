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
