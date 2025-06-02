import { ComponentModelBase, ComponentUIBase, ComponentBase } from '../../BaseComponent.js';

class NumericSliderUI extends ComponentUIBase {
  model: NumericSliderModel;
  id: string;
  slider?: HTMLInputElement;
  display?: HTMLSpanElement;
  label?: HTMLLabelElement;

  constructor(model: NumericSliderModel, id: string) {
    super();
    this.model = model;
    this.id = id;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);

    this.slider = this.container.querySelector('input[type="range"]')!;
    this.slider.id = `${this.id}Slider`;
    this.slider.min = this.model.min.toString();
    this.slider.max = this.model.max.toString();
    this.slider.step = this.model.step.toString();
    this.slider.value = this.model.value.toString();

    this.label = this.container.querySelector('label')!;
    this.label.htmlFor = this.slider.id;
    this.label.innerHTML = this.id;

    this.display = this.container.querySelector('span')!;
    this.display.id = `${this.id}Display`;
    this.display.innerHTML = this.model.value.toString();
  }
}

class NumericSliderModel extends ComponentModelBase {
  value: number;
  min: number;
  max: number;
  step: number;
  constructor(options: NumericSliderOptions = {}) {
    super();
    this.value = options.value ?? 1;
    this.min = options.min ?? 1;
    this.max = options.max ?? 100;
    this.step = options.step ?? 1;
  }
}

export class NumericSliderComponent extends ComponentBase<NumericSliderModel, NumericSliderUI> {
  private id: string;
  constructor(targetId: string, id: string, options: NumericSliderOptions = {}) {
    const model = new NumericSliderModel(options);
    super(model, new NumericSliderUI(model, id), targetId);
    this.id = id;
  }

  setupUIEvents(): void {
    const ui = this.ui;

    ui.registerEventListener(ui.slider!, 'input', (event) => {
      const target = event.target as HTMLInputElement;
      const value = Number(target.value);
      this.model.value = value;
      ui.display!.innerHTML = value.toString();
      this.notify(this.id);
    });
  }

  getValue(): number {
    return this.model.value;
  }

  getID() {
    return this.id;
  }
}

export type NumericSliderOptions = {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
};
