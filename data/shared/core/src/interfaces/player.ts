import { Position } from "../utils";
import TemplateObject, { NonTemplateObjectFunctions } from "./templateObject";

export default class Player extends TemplateObject {
    public position: Position;

    constructor(obj: NonTemplateObjectFunctions<Player>) {
        super(obj);

        this.position = {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
            heading: obj.position.heading
        };

        this._validation();
    }

    protected _validation(): void {
        if (
            typeof this.position !== "object" ||
            typeof this.position.x !== "number" ||
            typeof this.position.y !== "number" ||
            typeof this.position.z !== "number" ||
            typeof this.position.heading !== "number"
        ) {
            throw "Invalid position";
        }
    }
}
