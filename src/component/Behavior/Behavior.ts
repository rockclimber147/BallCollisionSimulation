import { PhysicsBall } from '../../ball_physics/Ball.js';
import { NumericSliderOptions } from '../TerminalComponents/NumericSlider/NumericSliderComponent.js';
import { SimpleBehaviorModel } from './SimpleBehaviorComponent/SimpleBehaviorComponent.js';

export class GravityBehaviorModel extends SimpleBehaviorModel {
  private gravity: number = 0;
  private readonly gravityFactor: number = 100;
  applyBehavior(ball: PhysicsBall, deltaTime: number): void {
    ball.vy += deltaTime * this.gravityFactor * this.gravity;
  }
  apply(sliderValue: number): void {
    this.gravity = sliderValue;
  }
  sliderOptions(): NumericSliderOptions {
    return {
      value: 0,
      min: -10,
      max: 10,
    };
  }
}

export class DragBehaviorModel extends SimpleBehaviorModel {
  dragCoefficient: number = 0;
  applyBehavior(ball: PhysicsBall, deltaTime: number): void {
    ball.velocity.scaleBy(1 - this.dragCoefficient * deltaTime);
  }
  apply(sliderValue: number): void {
    this.dragCoefficient = sliderValue;
  }
  sliderOptions(): NumericSliderOptions {
    return {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
    };
  }
}
