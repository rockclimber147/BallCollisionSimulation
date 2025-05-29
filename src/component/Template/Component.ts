import { ComponentModelBase, ComponentUIBase, ComponentBase } from '../BaseComponent.js';

class UI extends ComponentUIBase {
  model: Model;
  id: string;

  constructor(model: Model, id: string) {
    super();
    this.model = model;
    this.id = id;
  }

  async setup(): Promise<void> {}
}

class Model extends ComponentModelBase {
  constructor() {
    super();
  }
}

export class Component extends ComponentBase<Model, UI> {
  private id: string;
  constructor(targetId: string, id: string) {
    const model = new Model();
    super(model, new UI(model, id), targetId);
    this.id = id;
  }

  setupUIEvents(): void {}

  getID() {
    return this.id;
  }
}
