import { Drawable } from '../../../display/Drawable.js';
import { ComponentModelBase, ComponentUIBase, ComponentBase } from '../../BaseComponent.js';
import { SimulationBounds } from '../../CollisionHandlers/CollisionHandler.js';

class CanvasUI extends ComponentUIBase {
  model: CanvasModel;
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  constructor(model: CanvasModel) {
    super();
    this.model = model;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
    this.canvas = this.container.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d')!;
    this.canvas.width = this.model.canvasWidth;
    this.canvas.height = this.model.canvasHeight;
  }
}

class CanvasModel extends ComponentModelBase {
  public static readonly DEFAULT_CANAVAS_WIDTH = 800;
  public static readonly DEFAULT_CANVAS_HEIGHT = 600;
  canvasWidth: number = CanvasModel.DEFAULT_CANAVAS_WIDTH;
  canvasHeight: number = CanvasModel.DEFAULT_CANVAS_HEIGHT;
  constructor() {
    super();
  }
}

export class CanvasComponent extends ComponentBase<CanvasModel, CanvasUI> {
  private id: string;
  constructor(targetId: string, id: string) {
    const model = new CanvasModel();
    super(model, new CanvasUI(model), targetId);
    this.id = id;
  }

  setupUIEvents(): void {}

  draw(drawable: Drawable) {
    drawable.draw(this.ui.context!);
  }

  drawAll(drawables: Drawable[], clear: boolean = true) {
    if (clear) this.ui.context!.clearRect(0, 0, this.ui.canvas!.width, this.ui.canvas!.height);
    for (const drawable of drawables) {
      drawable.draw(this.ui.context!);
    }
  }

  getID() {
    return this.id;
  }

  getBounds(): SimulationBounds {
    return new SimulationBounds(0, 0, this.model.canvasWidth, this.model.canvasHeight);
  }
}
