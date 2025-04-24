import { ComponentUIBase, ComponentModelBase, ComponentBase } from "./component/component.js"
import { MovingBall } from "./ball_physics/Ball.js";

export class SimulationModel extends ComponentModelBase {
    balls: MovingBall[] = []
    fps: number = 60;
    get BallCount(): number { return this.balls.length; }

    constructor() {
        super()
    }
}

export class SimulationUI extends ComponentUIBase<SimulationModel> {
    canvas?: HTMLCanvasElement;
    context?: CanvasRenderingContext2D;
    
    setup(): void {
        this.container = document.createElement("div");
        this.canvas = document.createElement("canvas")

        const context = this.canvas.getContext("2d")

        if (!context) {
            throw new Error("Unable to get 2D context");
        }

        this.context = context;
    }

    tearDown(): void {
        throw new Error("Method not implemented.");
    }

    draw() {

    }
}

export class SimulationComponent extends ComponentBase<SimulationModel, SimulationUI> {

}