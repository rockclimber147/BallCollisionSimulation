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
  inject(targetId: string): HTMLElement;
}

type ElementListener = {
  element: HTMLElement;
  type: string;
  action: (event: Event) => void;
};

abstract class ComponentUIBase extends ObserverBase implements ComponentUI {
  protected container?: HTMLElement;
  protected registeredListeners: ElementListener[] = [];

  abstract setup(): Promise<void>;
  tearDown(): void {
    this.registeredListeners.forEach((listener) => this.removeEventListener(listener));
  }

  constructor() {
    super();
  }

  public registerEventListener(
    element: HTMLElement,
    type: string,
    action: (event: Event) => void
  ): void {
    this.registeredListeners.push({ element: element, type: type, action: action });
    element.addEventListener(type, action);
  }

  protected removeEventListener(listener: ElementListener) {
    listener.element.removeEventListener(listener.type, listener.action);
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

  inject(targetId: string): HTMLElement {
    const target = document.getElementById(targetId);
    if (!target) throw new Error(`Target element with id "${targetId}" not found.`);
    if (!this.container) throw new Error(`No container to inject for UI component.`);

    target.appendChild(this.container);
    return target;
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
  private uiContainer?: HTMLElement;

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

  async setup(): Promise<void> {
    await this.ui.setup();
    this.uiContainer = this.ui.inject(this.targetId);
    this.setupUIEvents();
  }

  abstract setupUIEvents(): void;

  tearDown(): void {
    this.model.removeObserver(this.ui);
    this.ui.tearDown();
    this.uiContainer!.innerHTML = '';
  }
}

interface ParentComponent {
  setupChildActions(): void;
  tearDownChildren(): void;
}

abstract class ParentComponentBase<M extends ComponentModelBase, U extends ComponentUIBase>
  extends ComponentBase<M, U>
  implements ParentComponent
{
  children: ComponentBase<ComponentModelBase, ComponentUIBase>[] = [];

  protected registerChild<T extends ComponentBase<ComponentModelBase, ComponentUIBase>>(
    child: T
  ): T {
    this.children.push(child);
    return child;
  }

  protected deregisterChild(child: ComponentBase<ComponentModelBase, ComponentUIBase>) {
    this.children.filter((currentChild) => currentChild != child);
    child.removeObserver(this);
  }

  async setupChildren(): Promise<void> {
    await Promise.all(this.children.map((child) => child.setup()));
    this.children.forEach((child) => child.addObserver(this));
  }

  abstract setupChildActions(): void;

  tearDownChildren(): void {
    this.children.forEach((child) => {
      this.deregisterChild(child);
      child.tearDown();
    });
  }

  async setup(): Promise<void> {
    await super.setup();
    await this.setupChildren();
    this.setupChildActions();
  }

  tearDown(): void {
    this.tearDownChildren();
    super.tearDown();
  }
}

export { ComponentUIBase, ComponentModelBase, ComponentBase, ParentComponentBase };
