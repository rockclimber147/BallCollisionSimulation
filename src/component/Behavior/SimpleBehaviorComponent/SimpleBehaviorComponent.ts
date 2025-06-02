import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { ParentComponentBase, ComponentModelBase, ComponentUIBase } from '../../BaseComponent.js';
import {
  NumericSliderComponent,
  NumericSliderOptions,
} from '../../TerminalComponents/NumericSlider/NumericSliderComponent.js';

export interface IBehavior {
  applyBehavior(ball: PhysicsBall, deltaTime: number): void;
}

class SimpleBehaviorUI extends ComponentUIBase {
  model: SimpleBehaviorModel;

  constructor(model: SimpleBehaviorModel) {
    super();
    this.model = model;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

export abstract class SimpleBehaviorModel extends ComponentModelBase implements IBehavior {
  constructor() {
    super();
  }
  abstract applyBehavior(ball: PhysicsBall, deltaTime: number): void;
  abstract apply(sliderValue: number): void;
  abstract sliderOptions(): NumericSliderOptions;
}

export class SimpleBehaviorComponent
  extends ParentComponentBase<SimpleBehaviorModel, SimpleBehaviorUI>
  implements IBehavior
{
  behaviorSlider: NumericSliderComponent;
  constructor(model: SimpleBehaviorModel, targetId: string, sliderLabel: string) {
    super(model, new SimpleBehaviorUI(model), targetId);
    this.behaviorSlider = this.registerChild(
      new NumericSliderComponent('behaviorSlider', sliderLabel, model.sliderOptions())
    );
  }
  applyBehavior(ball: PhysicsBall, deltaTime: number): void {
    this.model.applyBehavior(ball, deltaTime);
  }
  setupChildActions(): void {
    this.addAction(this.behaviorSlider.getID(), () => {
      this.model.apply(this.behaviorSlider.getValue());
    });
  }
  setupUIEvents(): void {}
}
