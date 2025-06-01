import { ComponentModelBase, ComponentUIBase, ComponentBase } from '../../BaseComponent.js';

class DropDownComponentUI extends ComponentUIBase {
  model: DropDownComponentModel;
  id: string;
  dropDown?: HTMLSelectElement;
  label?: HTMLLabelElement;

  constructor(model: DropDownComponentModel, id: string) {
    super();
    this.model = model;
    this.id = id;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
    this.dropDown = this.container.querySelector('select')!;
    this.dropDown.id = `${this.id}DropDown`;

    this.label = this.container.querySelector('label')!;
    this.label.htmlFor = this.dropDown.id;
    this.label.innerHTML = this.id;

    this.model.values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.text = value;
      this.dropDown!.appendChild(option);
    });
    this.dropDown.value = this.model.value;
  }
}

class DropDownComponentModel extends ComponentModelBase {
  values: string[];
  value: string;

  constructor(values: string[]) {
    super();
    this.values = values;
    this.value = values[0];
  }
}

export class DropDownComponent extends ComponentBase<DropDownComponentModel, DropDownComponentUI> {
  private id: string;
  constructor(targetId: string, id: string, values: string[]) {
    const model = new DropDownComponentModel(values);
    const ui = new DropDownComponentUI(model, id);
    super(model, ui, targetId);
    this.id = id;
  }

  setupUIEvents(): void {
    const ui = this.ui;

    ui.registerEventListener(ui.dropDown!, 'change', (event) => {
      const target = event.target as HTMLSelectElement;
      this.model.value = target.value;
      this.notify(this.id);
    });
  }

  getValue(): string {
    return this.model.value;
  }

  getID() {
    return this.id;
  }
}
