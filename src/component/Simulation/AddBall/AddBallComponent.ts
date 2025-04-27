import { TerminalComponentBase, ComponentModelBase, ComponentUIBase } from '../../BaseComponent.js';

export class AddBallModel extends ComponentModelBase {
  toAddCount: number = 1;

  constructor() {
    super();
  }
}

export class AddBallUI extends ComponentUIBase {
  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);
  }

  tearDown(): void {
    this.container?.remove();
  }
}

export class AddBallComponent extends TerminalComponentBase<AddBallModel, AddBallUI> {
  constructor(model: AddBallModel, ui: AddBallUI, targetId: string) {
    super(model, ui, targetId);
  }

  setupUIEvents(): void {}
}
