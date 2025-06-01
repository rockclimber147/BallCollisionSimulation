import {
  CollisionHandlerModelBase,
  CollisionHandlerComponentBase,
  BallCollisionPair,
  SimulationBounds,
} from '../CollisionHandler.js';
import { ComponentUIBase } from '../../BaseComponent.js';
import { SimulationHandler } from '../../Simulation/SimulationEnums.js';
import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable, Line } from '../../../display/Drawable.js';
import { NumericSliderComponent } from '../../TerminalComponents/NumericSlider/NumericSliderComponent.js';
import { SimulationActionEnum } from '../../Simulation/SimulationComponent.js';

class QuadTreeUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class QuadTreeModel extends CollisionHandlerModelBase {
  maxCapacity: number = 2;
  tree: QuadTree = new QuadTree(this.collisionBounds, this.maxCapacity, 0);
  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    this.tree = new QuadTree(this.collisionBounds, this.maxCapacity, 0);
    balls.forEach((ball) => this.tree.insert(ball));
    return this.tree.getPotentialCollisions();
  }
  getCollisionRepresentation(): Drawable[] {
    return this.tree.getLines();
  }
}

class QuadTree {
  static maxDepth: number = 6;
  depth: number;
  bounds: SimulationBounds;
  capacity: number;
  topLeft?: QuadTree;
  topRight?: QuadTree;
  bottomLeft?: QuadTree;
  bottomRight?: QuadTree;
  balls: PhysicsBall[];
  children: QuadTree[];

  constructor(bounds: SimulationBounds, capacity: number, depth: number) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.depth = depth;
    this.balls = [];
    this.children = [];
  }

  insert(ball: PhysicsBall) {
    if (!this.bounds.overlaps(ball)) return;
    if (this.children.length > 0) {
      this.children.forEach((child) => child.insert(ball));
      return;
    }
    this.balls.push(ball);
    if (this.balls.length <= this.capacity || this.depth >= QuadTree.maxDepth) {
      return;
    }
    this.split();
    while (this.balls.length > 0) {
      this.insert(this.balls.pop()!);
    }
  }

  split() {
    const bounds = this.bounds;
    const width = bounds.width / 2;
    const height = bounds.height / 2;
    this.topLeft = new QuadTree(
      new SimulationBounds(bounds.x, bounds.y, width, height),
      this.capacity,
      this.depth + 1
    );
    this.topRight = new QuadTree(
      new SimulationBounds(bounds.x + width, bounds.y, width, height),
      this.capacity,
      this.depth + 1
    );
    this.bottomLeft = new QuadTree(
      new SimulationBounds(bounds.x, bounds.y + height, width, height),
      this.capacity,
      this.depth + 1
    );
    this.bottomRight = new QuadTree(
      new SimulationBounds(bounds.x + width, bounds.y + height, width, height),
      this.capacity,
      this.depth + 1
    );

    this.children = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
  }

  getLines(): Line[] {
    if (this.children.length == 0) return [];

    const midX = this.bounds.x + this.bounds.width / 2;
    const midY = this.bounds.y + this.bounds.height / 2;

    const lines: Line[] = [
      new Line(this.bounds.x, midY, this.bounds.x + this.bounds.width, midY),
      new Line(midX, this.bounds.y, midX, this.bounds.y + this.bounds.height),
    ];
    this.children.forEach((child) => lines.push(...child.getLines()));
    return lines;
  }

  getPotentialCollisions(): BallCollisionPair[] {
    const pairs: BallCollisionPair[] = [];
    if (this.children.length == 0) {
      for (let i = 0; i < this.balls.length; i++) {
        for (let j = i + 1; j < this.balls.length; j++) {
          pairs.push(new BallCollisionPair(this.balls[i], this.balls[j]));
        }
      }
    }
    this.children.forEach((child) => pairs.push(...child.getPotentialCollisions()));
    return pairs;
  }
}

export class QuadTreeComponent extends CollisionHandlerComponentBase<QuadTreeModel, QuadTreeUI> {
  capacitySlider: NumericSliderComponent;
  depthSlider: NumericSliderComponent;
  constructor(targetID: string) {
    super(new QuadTreeModel(SimulationHandler.QUAD_TREE), new QuadTreeUI(), targetID);
    this.capacitySlider = this.registerChild(
      new NumericSliderComponent('capacitySlider', 'Max Balls Per Cell: ', {
        value: this.model.maxCapacity,
        max: 30,
      })
    );
    this.depthSlider = this.registerChild(
      new NumericSliderComponent('depthSlider', 'Max cell subdivisions: ', {
        value: QuadTree.maxDepth,
        max: 12,
      })
    );
  }
  setupChildActions(): void {
    this.addAction(this.capacitySlider.getID(), () => {
      this.model.maxCapacity = this.capacitySlider.getValue();
      this.notify(SimulationActionEnum.DRAW_BALLS);
    });
    this.addAction(this.depthSlider.getID(), () => {
      QuadTree.maxDepth = this.depthSlider.getValue();
      this.notify(SimulationActionEnum.DRAW_BALLS);
    });
  }
  setupUIEvents(): void {
    return;
  }
}
