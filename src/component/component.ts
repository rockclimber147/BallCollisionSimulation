interface Observer {
  updateWithType(notificationType: string): void;
  update(): void
}

interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notify(notificationType: string): void;
}

interface ComponentUI<T extends ComponentModelBase> {
  model: T;
  setup(): void;
  tearDown(): void;
  inject(targetId: string): void;
}

abstract class ComponentUIBase<T extends ComponentModelBase> implements Observer, ComponentUI<T> {
  model: T;
  private actions: Map<string, () => void> = new Map();
  protected container?: HTMLElement;

  abstract setup(): void
  abstract tearDown(): void

  constructor(model: T) {
    this.model = model;
  }

  updateWithType(notificationType: string): void {
    const action = this.actions.get(notificationType)
    if (!action) {
        console.log(`no associated action for ${notificationType}`)
        return;
    }
    action();
  }

  update() {
    for (const action of this.actions.values()) action()
  }

  inject(targetId: string): void {
    const target = document.getElementById(targetId);
    if (!target) throw new Error(`Target element with id "${targetId}" not found.`);
    if (!this.container) throw new Error(`No container to inject for UI component.`);
  
    target.appendChild(this.container);
  }

  addAction(type: string, action: () => void) {
    this.actions.set(type, action)
  }

  removeAction(type: string) {
    this.actions.delete(type)
  }
}

abstract class ComponentModelBase implements Subject {
  observers: Observer[] = [];
  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }
  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((obs) => obs != observer);
  }
  notify(notificationType: string): void {
    this.observers.forEach((obs) => obs.updateWithType(notificationType));
  }
}

abstract class ComponentBase<
  M extends ComponentModelBase,
  U extends ComponentUIBase<M>
> {
  readonly model: M;
  readonly ui: U;
  readonly targetId: string;

  constructor(model: M, ui: U, targetId: string) {
    this.model = model;
    this.ui = ui;
    this.targetId = targetId;
  }

  setup(): void {
    this.ui.setup();
    this.ui.inject(this.targetId)
  }

  destroy(): void {
    this.model.removeObserver(this.ui);
    this.ui.tearDown();
  }
}

export { ComponentUIBase, ComponentModelBase, ComponentBase };
