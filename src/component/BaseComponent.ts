interface Observer {
  updateWithType(notificationType: string): void;
  update(): void;
}

abstract class ObserverBase implements Observer {
  private actions: Map<string, () => void> = new Map();
  updateWithType(notificationType: string): void {
    this.actions.get(notificationType)?.();
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

interface ComponentUI {
  setup(): void;
  tearDown(): void;
  inject(targetId: string): void;
}

abstract class ComponentUIBase extends ObserverBase implements ComponentUI {
  protected container?: HTMLElement;

  abstract setup(): Promise<void>;
  abstract tearDown(): void;

  constructor() {
    super();
  }

  protected async loadTemplate(url: string): Promise<HTMLElement> {
    const pathParts = url.split('/');
    const lastIndex = pathParts.length - 1;
    pathParts[3] = 'src';
    const templateId = pathParts[lastIndex].replace('.js', '');
    pathParts[lastIndex] = templateId + '.html';
    const htmlUrl = pathParts.join('/');

    const response = await fetch(htmlUrl);
    const text = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const template = tempDiv.querySelector(`template#${templateId}`) as HTMLTemplateElement;
    if (!template) throw new Error(`Template with ID '${templateId}' not found in ${url}`);

    return template.content.cloneNode(true) as HTMLElement;
  }

  inject(targetId: string): void {
    const target = document.getElementById(targetId);
    if (!target) throw new Error(`Target element with id "${targetId}" not found.`);
    if (!this.container) throw new Error(`No container to inject for UI component.`);

    target.appendChild(this.container);
  }
}

abstract class ComponentModelBase extends SubjectBase {}

abstract class ComponentBase<M extends ComponentModelBase, U extends ComponentUIBase>
  extends ObserverBase
  implements Subject
{
  protected readonly model: M;
  protected readonly ui: U;
  protected readonly targetId: string;
  private readonly subject = new SubjectBase();

  constructor(model: M, ui: U, targetId: string) {
    super();
    this.model = model;
    this.ui = ui;
    this.targetId = targetId;

    this.model.addObserver(this);
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

  abstract setup(): Promise<void>;

  abstract setupUIEvents(): void;

  tearDown(): void {
    this.model.removeObserver(this.ui);
    this.ui.tearDown();
  }
}

interface ParentComponent {
  setupChildren(): Promise<void>;
  tearDownChildren(): void;
}

abstract class ParentComponentBase<M extends ComponentModelBase, U extends ComponentUIBase>
  extends ComponentBase<M, U>
  implements ParentComponent
{
  abstract setupChildren(): Promise<void>;

  abstract tearDownChildren(): void;

  async setup(): Promise<void> {
    await this.ui.setup();
    this.ui.inject(this.targetId);
    await this.setupChildren();
    this.setupUIEvents();
  }

  tearDown(): void {
    this.tearDownChildren();
    this.model.removeObserver(this.ui);
    this.ui.tearDown();
  }
}

abstract class TerminalComponentBase<
  M extends ComponentModelBase,
  U extends ComponentUIBase,
> extends ComponentBase<M, U> {
  async setup(): Promise<void> {
    await this.ui.setup();
    this.ui.inject(this.targetId);
    this.setupUIEvents();
  }

  tearDown(): void {
    this.model.removeObserver(this.ui);
    this.ui.tearDown();
  }
}

export {
  ComponentUIBase,
  ComponentModelBase,
  ComponentBase,
  TerminalComponentBase,
  ParentComponentBase,
};
