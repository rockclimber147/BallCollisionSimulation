import { ComponentModelBase, ComponentUIBase, TerminalComponentBase } from '../BaseComponent.js';

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
  tearDown(): void {
    this.container?.remove();
  }
}

class NumericSliderModel extends ComponentModelBase {
  value: number;
  min: number;
  max: number;
  step: number;
  constructor(value: number, min: number, max: number, step: number) {
    super();
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
  }
}

export class NumericSliderComponent extends TerminalComponentBase<NumericSliderModel, NumericSliderUI> {
  private id: string;
  constructor(
    targetId: string,
    id: string,
    initialValue: number = 1,
    min: number = 1,
    max: number = 100,
    step: number = 1
  ) {
    const model = new NumericSliderModel(initialValue, min, max, step);
    super(model, new NumericSliderUI(model, id), targetId);
    this.id = id;
  }

  setupUIEvents(): void {
    this.ui.slider?.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const value = Number(target.value);
      this.model.value = value;
      this.ui.display!.innerHTML = value.toString();
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
