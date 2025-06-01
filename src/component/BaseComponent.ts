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
  public static readonly ID_SEPARATOR = '__';
  protected container?: HTMLElement;
  protected registeredListeners: ElementListener[] = [];
  private static id = 0;
  protected idMap: Map<string, string>;

  abstract setup(): Promise<void>;
  tearDown(): void {
    this.registeredListeners.forEach((listener) => this.removeEventListener(listener));
  }

  constructor() {
    super();
    this.idMap = new Map();
  }

  protected mapIdsToUnique(container: HTMLElement) {
    const elementsWithId = container.querySelectorAll('[id]');
    Array.from(elementsWithId).forEach((el) => {
      const id = el.id;
      const uId = `${id}${ComponentUIBase.ID_SEPARATOR}${ComponentUIBase.id++}`;
      el.id = uId;
      this.idMap.set(id, uId);
    });
  }

  public idUnique(id: string): string {
    if (this.idMap.has(id)) return this.idMap.get(id)!;
    return id;
  }

  public idUniqueQuery(id: string): string {
    return '#' + this.idUnique(id);
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
  /**
   * Loads the template from the associated url.
   *
   * Navigates from the transpiled js dist directory to the src Typescript directory with the html
   * Also changes the ids of any element explicitly assigned an id to a unique id stored in the idMap.
   * The new id is accessed by inputting the old id
   *
   * @param url The url of the current fle
   * @returns HTMLFragment of the contents of the template in the HTML file
   */
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
    const container = template.content.cloneNode(true) as HTMLElement;
    this.mapIdsToUnique(container);
    return container;
  }

  /**
   *
   * @param targetId The id of the DOM element to inject into
   * @returns The container that was injected
   */
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
  protected targetId: string;
  private readonly subject = new SubjectBase();
  private uiContainer?: HTMLElement;

  constructor(model: M, ui: U, targetId: string) {
    super();
    this.model = model;
    this.ui = ui;
    this.targetId = targetId;

    this.model.addObserver(this);
  }

  /**
   * Updates the targetId of the component based on the parent ui
   *
   * @param parentUI the parent ui with a map of initial ids to unique ids
   */
  updateTargetId(parentUI: ComponentUIBase) {
    const oldId = this.targetId.split(ComponentUIBase.ID_SEPARATOR)[0];
    this.targetId = parentUI.idUnique(oldId);
  }

  get TargetId() {
    return this.targetId;
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
    this.uiContainer!.replaceChildren();
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
  
  deregisterChild(component: ComponentBase<ComponentModelBase, ComponentUIBase>) {
    this.children = this.children.filter((child) => child != component);
  }

  /**
   * Sets up the child components registered with this one.
   * @param ui The parent ui with a map of initial to unique ids
   */
  async setupChildren(ui: ComponentUIBase): Promise<void> {
    await Promise.all(
      this.children.map((child) => {
        if (ui) child.updateTargetId(ui);
        child.setup();
      })
    );
    this.children.forEach((child) => child.addObserver(this));
  }

  abstract setupChildActions(): void;

  tearDownChildren(): void {
    this.children.forEach((child) => {
      child.tearDown();
    });
  }

  async setup(): Promise<void> {
    await super.setup();
    await this.setupChildren(this.ui);
    this.setupChildActions();
  }

  tearDown(): void {
    this.tearDownChildren();
    super.tearDown();
  }
}

export { ComponentUIBase, ComponentModelBase, ComponentBase, ParentComponentBase };
