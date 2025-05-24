import { ComponentModelBase, ComponentUIBase, TerminalComponentBase } from '../BaseComponent.js';

class TickBoxUI extends ComponentUIBase {
  model: TickBoxModel;
  id: string;
  tickBox?: HTMLInputElement;
  label?: HTMLLabelElement;

  constructor(model: TickBoxModel, id: string) {
    super();
    this.model = model;
    this.id = id;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
    this.tickBox = this.container.querySelector('input[type="checkbox"]')!;
    this.tickBox.id = `${this.id}TickBox`;
    this.tickBox.checked = this.model.value;

    this.label = this.container.querySelector('label')!;
    this.label.htmlFor = this.tickBox.id;
    this.label.innerHTML = this.id;
  }
  tearDown(): void {
    this.container?.remove();
  }
}

class TickBoxModel extends ComponentModelBase {
  value: boolean;

  constructor(value: boolean = true) {
    super();
    this.value = value;
  }
}

export class TickBoxComponent extends TerminalComponentBase<TickBoxModel, TickBoxUI> {
  private id: string;
  constructor(targetId: string, id: string, value: boolean = true) {
    const model = new TickBoxModel(value);
    super(model, new TickBoxUI(model, id), targetId);
    this.id = id;
  }

  setupUIEvents(): void {
    this.ui.tickBox?.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      this.model.value = target.checked;
      this.notify(this.id);
    });
  }

  getValue(): boolean {
    return this.model.value;
  }

  getID() {
    return this.id;
  }
}
