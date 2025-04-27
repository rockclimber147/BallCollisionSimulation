interface Observer {
  updateWithType(notificationType: string): void;
  update(): void;
}

abstract class ObserverBase implements Observer {
  private actions: Map<string, () => void> = new Map();
  updateWithType(notificationType: string): void {
    const action = this.actions.get(notificationType);
    if (!action) {
      console.log(`no associated action for ${notificationType}`);
      return;
    }
    action();
  }

  update() {
    for (const action of this.actions.values()) action();
  }

  addAction(type: string, action: () => void) {
    this.actions.set(type, action);
  }

  removeAction(type: string) {
    this.actions.delete(type);
  }
}

interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notify(notificationType: string): void;
}

class SubjectBase implements Subject {
  private observers: Observer[] = [];
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

interface ComponentUI<T extends ComponentModelBase> {
  model: T;
  setup(): void;
  tearDown(): void;
  inject(targetId: string): void;
}

abstract class ComponentUIBase<T extends ComponentModelBase>
  extends ObserverBase
  implements ComponentUI<T>
{
  model: T;
  protected container?: HTMLElement;

  abstract setup(): void;
  abstract tearDown(): void;

  constructor(model: T) {
    super();
    this.model = model;
  }

  inject(targetId: string): void {
    const target = document.getElementById(targetId);
    if (!target) throw new Error(`Target element with id "${targetId}" not found.`);
    if (!this.container) throw new Error(`No container to inject for UI component.`);

    target.appendChild(this.container);
  }
}

abstract class ComponentModelBase extends SubjectBase {

}

abstract class ComponentBase<M extends ComponentModelBase, U extends ComponentUIBase<M>>
  extends ObserverBase
  implements Subject
{
  protected readonly model: M;
  protected readonly ui: U;
  protected readonly targetId: string;
  private readonly subject = new SubjectBase()

  constructor(model: M, ui: U, targetId: string) {
    super();
    this.model = model;
    this.ui = ui;
    this.targetId = targetId;

    this.model.addObserver(this.ui);
  }

  addObserver(observer: Observer): void {
    this.subject.addObserver(observer);
  }

  removeObserver(observer: Observer): void {
    this.subject.removeObserver(observer);
  }

  notify(notificationType: string): void {
    this.subject.notify(notificationType);
  }

  setup(): void {
    this.ui.setup();
    this.ui.inject(this.targetId);
    this.setupUIEvents();
  }

  abstract setupUIEvents(): void;

  destroy(): void {
    this.model.removeObserver(this.ui);
    this.ui.tearDown();
  }
}

export { ComponentUIBase, ComponentModelBase, ComponentBase };
