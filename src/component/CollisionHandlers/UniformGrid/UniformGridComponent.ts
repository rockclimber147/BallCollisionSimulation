import { ComponentUIBase } from '../../BaseComponent.js';
import {
  BallCollisionPair,
  CollisionHandlerComponentBase,
  CollisionHandlerModelBase,
  SimulationBounds,
} from '../CollisionHandler.js';
import { SimulationHandler } from '../../Simulation/SimulationEnums.js';
import { Ball, PhysicsBall } from '../../../ball_physics/Ball.js';
import { Drawable, Line } from '../../../display/Drawable.js';
import { NumericSliderComponent } from '../../TerminalComponents/NumericSlider/NumericSliderComponent.js';
import { SimulationActionEnum } from '../../Simulation/SimulationComponent.js';

class UniformGridUI extends ComponentUIBase {
  model: UniformGridModel;

  constructor(model: UniformGridModel) {
    super();
    this.model = model;
  }

  async setup(): Promise<void> {
    this.container = await this.loadTemplate(import.meta.url);
  }
}

class UniformGridModel extends CollisionHandlerModelBase {
  xCells: number = 2;
  yCells: number = 2;
  grid: Grid;

  constructor() {
    super(SimulationHandler.UNIFORM_GRID);
    this.grid = this.constructGrid();
  }

  constructGrid(): Grid {
    return new Grid(this.xCells, this.yCells, this.collisionBounds);
  }

  getAllPotentialCollisions(balls: PhysicsBall[]): BallCollisionPair[] {
    const collisions: BallCollisionPair[] = [];
    balls.forEach((ball) => this.grid.addBall(ball));
    return collisions;
  }

  getCollisionRepresentation(balls: PhysicsBall[] = []): Drawable[] {
    const representation: Drawable[] = [];
    representation.push(...this.getGridLines());
    return representation;
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

class Grid {
  xCells: number;
  yCells: number;
  cellWidth: number;
  cellHeight: number;
  cells: Cell[][];

  constructor(xCells: number, yCells: number, bounds: SimulationBounds) {
    this.xCells = xCells;
    this.yCells = yCells;
    this.cellWidth = this.xCells / bounds.width;
    this.cellHeight = this.yCells / bounds.height;

    this.cells = this.constructGrid();
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

  addBall(ball: Ball) {}

  getCells(): Cell[] {
    return this.cells.reduce((acc, row) => acc.concat(row), []);
  }
}

class Cell {
  balls: PhysicsBall[];
  bounds: SimulationBounds;

  constructor(x: number, y: number, width: number, height: number) {
    this.balls = [];
    this.bounds = new SimulationBounds(x, y, width, height);
  }
}

export class UniformGridComponent extends CollisionHandlerComponentBase<
  UniformGridModel,
  UniformGridUI
> {
  xCellsSlider: NumericSliderComponent;
  yCellsSlider: NumericSliderComponent;
  constructor(targetId: string) {
    const model = new UniformGridModel();
    super(model, new UniformGridUI(model), targetId);
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
  }

  setupChildActions(): void {
    this.addAction(this.xCellsSlider.getID(), () => {
      this.model.xCells = this.xCellsSlider.getValue();
      this.refresh();
    });
    this.addAction(this.yCellsSlider.getID(), () => {
      this.model.yCells = this.yCellsSlider.getValue();
      this.refresh();
    });
  }

  refresh() {
    this.model.constructGrid();
    this.notify(SimulationActionEnum.DRAW_BALLS);
  }

  setupUIEvents(): void {}
}
