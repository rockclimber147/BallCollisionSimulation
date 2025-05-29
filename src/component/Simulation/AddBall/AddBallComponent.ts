import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { ComponentModelBase, ComponentUIBase, ParentComponentBase } from '../../BaseComponent.js';
import { DropDownComponent } from '../../TerminalComponents/Dropdown/DropDownComponent.js';
import { NumericSliderComponent } from '../../TerminalComponents/NumericSlider/NumericSliderComponent.js';
import { SimulationActionEnum } from '../SimulationComponent.js';

export class AddBallModel extends ComponentModelBase {
  private _toAddCount: number = 1;
  private _mode: string = BallModeEnum.RANDOM;
  private _color: string = '#ff0000';
  private _radius: number = 10;
  private _mass: number = 50;

  constructor() {
    super();
  }

  getBalls(): PhysicsBall[] {
    const balls: PhysicsBall[] = [];
    for (let i = 1; i <= this.toAddCount; i++) {
      balls.push(this.createBall());
    }
    return balls;
  }

  private createBall(): PhysicsBall {
    const ball = PhysicsBall.createRandomBall();
    if (this._mode == BallModeEnum.RANDOM) return ball;
    ball.color = this._color;
    ball.radius = this._radius;
    ball.mass = this._mass;
    return ball;
  }

  get toAddCount(): number {
    return this._toAddCount;
  }

  set toAddCount(count: number) {
    if (count < 1) {
      throw new Error('toAddCount must be at least 1');
    }
    this._toAddCount = count;
  }
  get mode(): string {
    return this._mode;
  }

  set mode(newMode: string) {
    this._mode = newMode;
  }

  get color(): string {
    return this._color;
  }

  set color(newColor: string) {
    this._color = newColor;
  }

  get radius(): number {
    return this._radius;
  }

  set radius(newRadius: number) {
    if (newRadius <= 0) {
      throw new Error('Radius must be a positive number');
    }
    this._radius = newRadius;
  }

  get mass(): number {
    return this._mass;
  }

  set mass(newMass: number) {
    if (newMass <= 0) {
      throw new Error('Mass must be a positive number');
    }
    this._mass = newMass;
  }
}

export class AddBallUI extends ComponentUIBase {
  private _specificFieldsDiv?: HTMLDivElement;
  private _colorInput?: HTMLInputElement;
  private _addButton?: HTMLButtonElement;

  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);

    this._specificFieldsDiv = this.container.querySelector('#specificFields')!;
    this._colorInput = this.container.querySelector('#color')!;
    this._addButton = this.container.querySelector('#add')!;
  }

  public toggleSpecificFields(mode: string) {
    if (mode == BallModeEnum.SPECIFIC) {
      this._specificFieldsDiv!.style.display = 'block';
    } else {
      this._specificFieldsDiv!.style.display = 'none';
    }
  }

  get specificFieldsDiv(): HTMLDivElement | undefined {
    return this._specificFieldsDiv;
  }

  get colorInput(): HTMLInputElement | undefined {
    return this._colorInput;
  }

  get addButton(): HTMLButtonElement | undefined {
    return this._addButton;
  }
}

export class AddBallComponent extends ParentComponentBase<AddBallModel, AddBallUI> {
  modeSelectDropdown: DropDownComponent;
  amountSlider: NumericSliderComponent;
  radiusSlider: NumericSliderComponent;
  massSlider: NumericSliderComponent;
  constructor(model: AddBallModel, ui: AddBallUI, targetId: string) {
    super(model, ui, targetId);
    const ballModeValues: string[] = Object.keys(BallModeEnum).map(
      (key) => BallModeEnum[key as keyof typeof BallModeEnum]
    );
    this.modeSelectDropdown = this.registerChild(
      new DropDownComponent('dropdownComponent', 'Mode Select', ballModeValues)
    );

    this.radiusSlider = this.registerChild(
      new NumericSliderComponent('radius', 'Radius', {
        value: this.model.radius,
      })
    );
    this.massSlider = this.registerChild(
      new NumericSliderComponent('mass', 'Mass', { value: this.model.mass })
    );
    this.amountSlider = this.registerChild(
      new NumericSliderComponent('amount', 'Choose Amount', {
        value: this.model.toAddCount,
      })
    );
  }

  setupUIEvents(): void {
    const ui = this.ui;
    ui.registerEventListener(ui.addButton!, 'click', () => {
      this.notify(SimulationActionEnum.BALL_ADDED);
    });

    ui.registerEventListener(ui.colorInput!, 'change', (event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      this.model.color = value;
    });
  }

  setupChildActions(): void {
    this.addAction(this.radiusSlider.getID(), () => {
      this.model.radius = this.radiusSlider.getValue();
    });

    this.addAction(this.massSlider.getID(), () => {
      this.model.mass = this.massSlider.getValue();
    });

    this.addAction(this.amountSlider.getID(), () => {
      this.model.toAddCount = this.amountSlider.getValue();
    });

    this.addAction(this.modeSelectDropdown.getID(), () => {
      this.model.mode = this.modeSelectDropdown.getValue();
      this.ui.toggleSpecificFields(this.model.mode);
    });
  }

  getBalls(): PhysicsBall[] {
    return this.model.getBalls();
  }
}

enum BallModeEnum {
  RANDOM = 'Random',
  SPECIFIC = 'Specific',
}
