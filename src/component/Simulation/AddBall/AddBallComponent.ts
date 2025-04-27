import { MovingBall } from '../../../ball_physics/Ball.js';
import { TerminalComponentBase, ComponentModelBase, ComponentUIBase } from '../../BaseComponent.js';
import { SimulationActionEnum } from '../SimulationComponent.js';

export class AddBallModel extends ComponentModelBase {
  private _toAddCount: number = 1;
  private _mode: BallModeEnum.RANDOM | BallModeEnum.SPECIFIC = BallModeEnum.RANDOM;
  private _color: string = '#ff0000';
  private _radius: number = 10;
  private _mass: number = 50;

  constructor() {
    super();
  }

  getBalls(): MovingBall[] {
    const balls: MovingBall[] = [];
    for (let i = 1; i <= this.toAddCount; i++) {
      balls.push(this.createBall());
    }
    return balls;
  }

  private createBall(): MovingBall {
    const ball = MovingBall.createRandomBall();
    if (this._mode == BallModeEnum.RANDOM) return ball;
    ball.color = this._color;
    ball.radius = this._radius;
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
  get mode(): BallModeEnum.RANDOM | BallModeEnum.SPECIFIC {
    return this._mode;
  }

  set mode(newMode: BallModeEnum.RANDOM | BallModeEnum.SPECIFIC) {
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
  private _modeSelect?: HTMLSelectElement;
  private _amountInput?: HTMLInputElement;
  private _amountDisplay?: HTMLSpanElement;
  private _specificFieldsDiv?: HTMLDivElement;
  private _radiusInput?: HTMLInputElement;
  private _radiusDisplay?: HTMLSpanElement;
  private _massInput?: HTMLInputElement;
  private _massDisplay?: HTMLSpanElement;
  private _colorInput?: HTMLInputElement;
  private _addButton?: HTMLButtonElement;

  constructor() {
    super();
  }

  async setup() {
    this.container = await this.loadTemplate(import.meta.url);

    this._modeSelect = this.container.querySelector('#mode')!;
    this._amountInput = this.container.querySelector('#amount')!;
    this._amountDisplay = this.container.querySelector('#amountDisplay')!;
    this._specificFieldsDiv = this.container.querySelector('#specificFields')!;
    this._radiusInput = this.container.querySelector('#radius')!;
    this._radiusDisplay = this.container.querySelector('#radiusDisplay')!;
    this._massInput = this.container.querySelector('#mass')!;
    this._massDisplay = this.container.querySelector('#massDisplay')!;
    this._colorInput = this.container.querySelector('#color')!;
    this._addButton = this.container.querySelector('#add')!;
  }

  public toggleSpecificFields(mode: BallModeEnum.RANDOM | BallModeEnum.SPECIFIC) {
    if (mode == BallModeEnum.SPECIFIC) {
      this._specificFieldsDiv!.style.display = 'block';
    } else {
      this._specificFieldsDiv!.style.display = 'none';
    }
  }

  tearDown(): void {
    this.container?.remove();
  }

  get modeSelect(): HTMLSelectElement | undefined {
    return this._modeSelect;
  }

  get amountInput(): HTMLInputElement | undefined {
    return this._amountInput;
  }

  get amountDisplay(): HTMLSpanElement | undefined {
    return this._amountDisplay;
  }

  get specificFieldsDiv(): HTMLDivElement | undefined {
    return this._specificFieldsDiv;
  }

  get radiusInput(): HTMLInputElement | undefined {
    return this._radiusInput;
  }

  get radiusDisplay(): HTMLSpanElement | undefined {
    return this._radiusDisplay;
  }

  get massInput(): HTMLInputElement | undefined {
    return this._massInput;
  }

  get massDisplay(): HTMLSpanElement | undefined {
    return this._massDisplay;
  }

  get colorInput(): HTMLInputElement | undefined {
    return this._colorInput;
  }

  get addButton(): HTMLButtonElement | undefined {
    return this._addButton;
  }
}

export class AddBallComponent extends TerminalComponentBase<AddBallModel, AddBallUI> {
  constructor(model: AddBallModel, ui: AddBallUI, targetId: string) {
    super(model, ui, targetId);
  }

  setupUIEvents(): void {
    this.ui.addButton?.addEventListener('click', () => {
      this.notify(SimulationActionEnum.BALL_ADDED);
    });

    this.ui.modeSelect?.addEventListener('change', (event) => {
      const selectedMode = (event.target as HTMLSelectElement).value as
        | BallModeEnum.RANDOM
        | BallModeEnum.SPECIFIC;
      console.log(selectedMode)
      this.model.mode = selectedMode;
      this.ui.toggleSpecificFields(this.model.mode);
    });
  }

  getBalls(): MovingBall[] {
    return this.model.getBalls();
  }
}

enum BallModeEnum {
  RANDOM = 'Random',
  SPECIFIC = 'Specific',
}
