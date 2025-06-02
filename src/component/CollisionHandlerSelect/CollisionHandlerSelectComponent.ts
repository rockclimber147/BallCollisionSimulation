import { ComponentModelBase, ComponentUIBase, ParentComponentBase } from '../BaseComponent.js';
import {
  CollisionHandlerComponentBase,
  CollisionHandlerModelBase,
} from '../CollisionHandlers/CollisionHandler.js';
import { SimulationHandler } from '../Simulation/SimulationEnums.js';
import { NaiveComponent } from '../CollisionHandlers/Naive/NaiveComponent.js';
import { SweepAndPruneComponent } from '../CollisionHandlers/SweepAndPrune/SweepAndPruneComponent.js';
import { UniformGridComponent } from '../CollisionHandlers/UniformGrid/UniformGridComponent.js';
import { QuadTreeComponent } from '../CollisionHandlers/QuadTree/QuadTreeComponent.js';
import { DropDownComponent } from '../TerminalComponents/Dropdown/DropDownComponent.js';

class CollisionHandlerSelectUI extends ComponentUIBase {
  model: CollisionHandlerSelectModel;
  id: string;

  constructor(model: CollisionHandlerSelectModel, id: string) {
    super();
    this.model = model;
    this.id = id;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class CollisionHandlerSelectModel extends ComponentModelBase {
  isHandlerParent: boolean;
  handlerMap: Map<
    string,
    CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>
  >;
  value: CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>;
  handlerComponentTarget: string;
  constructor(handlerComponentTarget: string, isHandlerParent: boolean) {
    super();
    this.handlerComponentTarget = handlerComponentTarget;
    this.isHandlerParent = isHandlerParent;
    this.handlerMap = new Map<
      string,
      CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>
    >();
    this.constructMap();
    this.value = this.handlerMap.get(SimulationHandler.NAIVE)!;
  }

  updateValue(handlerName: string) {
    this.value = this.handlerMap.get(handlerName)!;
  }

  constructMap() {
    this.handlerMap.set(SimulationHandler.NAIVE, new NaiveComponent(this.handlerComponentTarget));
    this.handlerMap.set(
      SimulationHandler.SWEEP_AND_PRUNE,
      new SweepAndPruneComponent(this.handlerComponentTarget)
    );
    if (!this.isHandlerParent)
      this.handlerMap.set(
        SimulationHandler.QUAD_TREE,
        new QuadTreeComponent(this.handlerComponentTarget)
    );
    if (!this.isHandlerParent)
      this.handlerMap.set(
        SimulationHandler.UNIFORM_GRID,
        new UniformGridComponent(this.handlerComponentTarget)
      );
  }
}

export class CollisionHandlerSelectComponent extends ParentComponentBase<
  CollisionHandlerSelectModel,
  CollisionHandlerSelectUI
> {
  private id: string;
  componentSelect: DropDownComponent;
  constructor(
    targetId: string,
    id: string,
    handlerComponentTarget: string,
    isHandlerParent = false
  ) {
    const model = new CollisionHandlerSelectModel(handlerComponentTarget, isHandlerParent);
    super(model, new CollisionHandlerSelectUI(model, id), targetId);
    this.id = id;
    this.componentSelect = this.registerChild(
      new DropDownComponent(CollisionHandlerSelectIds.COMPONENT_SELECT, id, [
        ...this.model.handlerMap.keys(),
      ])
    );
  }

  setupChildActions(): void {
    this.addAction(this.componentSelect.getID(), () => {
      this.model.updateValue(this.componentSelect.getValue());
      this.notify(this.id);
    });
  }

  setupUIEvents(): void {}

  getID() {
    return this.id;
  }

  getValue(): CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase> {
    return this.model.value;
  }
}

enum CollisionHandlerSelectIds {
  COMPONENT_SELECT = 'componentSelect',
}
