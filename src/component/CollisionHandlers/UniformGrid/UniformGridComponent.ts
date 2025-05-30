import { ComponentUIBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandlerComponentBase,
  CollisionHandlerModelBase,
  SimulationBounds,
} from '../CollisionHandler.js';
import { SimulationHandler } from '../../Simulation/SimulationEnums.js';
import { PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable, Line } from '../../../display/Drawable.js';
import { NumericSliderComponent } from '../../TerminalComponents/NumericSlider/NumericSliderComponent.js';
import { SimulationActionEnum } from '../../Simulation/SimulationComponent.js';
import { SweepAndPruneComponent } from '../SweepAndPrune/SweepAndPruneComponent.js';

class UniformGridUI extends ComponentUIBase {
  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class UniformGridModel extends CollisionHandlerModelBase {
  xCells: number = 2;
  yCells: number = 2;
  grid: Grid;
  subhandler?: CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>;

  constructor() {
    super(SimulationHandler.UNIFORM_GRID);
    this.grid = new Grid(this.xCells, this.yCells, this.collisionBounds);
  }

  constructGrid() {
    this.grid = new Grid(this.xCells, this.yCells, this.collisionBounds);
  }

  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    const collisions: BallCollisionPair[] = [];
    this.grid.clear();
    balls.forEach((ball) => this.grid.addBall(ball));
    this.grid.getCells().forEach((cell) => {
      const balls = cell.balls;
      collisions.push(...this.subhandler!.getAllPotentialCollisions(balls));
    });
    return collisions;
  }

  getCollisionRepresentation(): Drawable[] {
    const representation: Drawable[] = [];
    representation.push(...this.grid.getGridLines());
    this.grid.getCells().forEach((cell) => {
      const balls = cell.balls;
      this.subhandler?.setCollisionBounds(cell.bounds);
      representation.push(...this.subhandler!.getCollisionRepresentation(balls));
    });
    return representation;
  }
}

class Grid {
  xCells: number;
  yCells: number;
  cellWidth: number;
  cellHeight: number;
  cells: Cell[][];
  collisionBounds: SimulationBounds;

  constructor(xCells: number, yCells: number, bounds: SimulationBounds) {
    this.xCells = xCells;
    this.yCells = yCells;
    this.cellWidth = bounds.width / this.xCells;
    this.cellHeight = bounds.height / this.yCells;

    this.cells = this.constructGrid();
    this.collisionBounds = bounds;
  }

  constructGrid(): Cell[][] {
    const cells: Cell[][] = [];
    for (let x = 0; x < this.xCells; x++) {
      const column: Cell[] = [];
      for (let y = 0; y < this.yCells; y++) {
        column.push(
          new Cell(x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight)
        );
      }
      cells.push(column);
    }
    this.cells = cells;
    return cells;
  }

  addBall(ball: PhysicsBall) {
    const minX = Math.floor((ball.x - ball.radius) / this.cellWidth);
    const maxX = Math.floor((ball.x + ball.radius) / this.cellWidth);
    const minY = Math.floor((ball.y - ball.radius) / this.cellHeight);
    const maxY = Math.floor((ball.y + ball.radius) / this.cellHeight);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (this.coordinatesAreInbounds(x, y)) {
          this.cells[x][y].add(ball);
        }
      }
    }
  }

  coordinatesAreInbounds(x: number, y: number): boolean {
    return x >= 0 && x < this.xCells && y >= 0 && y < this.yCells;
  }

  getCells(): Cell[] {
    return this.cells.reduce((acc, row) => acc.concat(row), []);
  }

  clear() {
    this.getCells().forEach((cell) => cell.clear());
  }

  toString() {
    let str = '';
    for (const row of this.cells) {
      for (const cell of row) {
        str += `${cell} `;
      }
      str += '\n';
    }
    return str;
  }

  getGridLines(): Drawable[] {
    const lines: Drawable[] = [];
    const cellWidth = this.collisionBounds.width / this.xCells;
    const cellHeight = this.collisionBounds.height / this.yCells;
    for (let x = 1; x < this.xCells; x++) {
      lines.push(
        new Line(x * cellWidth, this.collisionBounds.y, x * cellWidth, this.collisionBounds.height)
      );
    }
    for (let y = 1; y < this.yCells; y++) {
      lines.push(
        new Line(this.collisionBounds.x, y * cellHeight, this.collisionBounds.width, y * cellHeight)
      );
    }
    return lines;
  }
}

class Cell {
  balls: PhysicsBall[];
  bounds: SimulationBounds;

  constructor(x: number, y: number, width: number, height: number) {
    this.balls = [];
    this.bounds = new SimulationBounds(x, y, width, height);
  }
  clear() {
    this.balls.length = 0;
  }
  add(ball: PhysicsBall) {
    this.balls.push(ball);
  }
  toString() {
    return `${this.balls.length}`;
  }
}

export class UniformGridComponent extends CollisionHandlerComponentBase<
  UniformGridModel,
  UniformGridUI
> {
  subHandlerTarget: string = 'subHandler';
  xCellsSlider: NumericSliderComponent;
  yCellsSlider: NumericSliderComponent;
  // subHandlerSelect: CollisionHandlerSelectComponent
  subHandler: CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>;
  constructor(targetId: string) {
    super(new UniformGridModel(), new UniformGridUI(), targetId);
    this.xCellsSlider = this.registerChild(
      new NumericSliderComponent('xCellsSlider', 'X cell count: ', {
        value: this.model.xCells,
        max: 10,
      })
    );
    this.yCellsSlider = this.registerChild(
      new NumericSliderComponent('yCellsSlider', 'Y cell count: ', {
        value: this.model.yCells,
        max: 10,
      })
    );

    // this.subHandlerSelect = this.registerChild(new CollisionHandlerSelectComponent("subHandlerSelect", "subHandler: ", this.subHandlerTarget, true))
    this.subHandler = this.registerChild(new SweepAndPruneComponent(this.subHandlerTarget));
    this.model.subhandler = this.subHandler;
  }

  setupChildActions(): void {
    this.refresh();
    this.addAction(this.xCellsSlider.getID(), () => {
      this.model.xCells = this.xCellsSlider.getValue();
      this.refresh();
    });
    this.addAction(this.yCellsSlider.getID(), () => {
      this.model.yCells = this.yCellsSlider.getValue();
      this.refresh();
    });
    // this.addAction(this.subHandlerSelect.getID(), () => {

    // })
  }

  refresh() {
    this.model.constructGrid();
    this.notify(SimulationActionEnum.DRAW_BALLS);
  }

  async updateCollisionHandler(
    newHandler: CollisionHandlerComponentBase<CollisionHandlerModelBase, ComponentUIBase>
  ) {
    this.subHandler.tearDown();
    this.subHandler = this.registerChild(newHandler);
    await newHandler.setup();
  }

  setupUIEvents(): void {}
}

// TODO
// Make this a lot less brittle by implementing another handlerselectcomponent
// to make this work I need to fix id assignment so they are unique in the whole DOM (right now
// the componentselect part of the handlerselect hyml has a duplicate id and this will probably
// be an issue for other components as well down the line)

// figure out how to generate a unique id while keeping the readability of having the ids in the
// html.
