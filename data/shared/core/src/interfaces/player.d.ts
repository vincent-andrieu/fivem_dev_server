import { Position } from "../utils";
import TemplateObject, { NonTemplateObjectFunctions } from "./templateObject";
export default class Player extends TemplateObject {
    position: Position;
    constructor(obj: NonTemplateObjectFunctions<Player>);
    protected _validation(): void;
}
