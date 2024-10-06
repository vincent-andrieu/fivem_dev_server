import TemplateObject from "./templateObject";
export default class Player extends TemplateObject {
    position;
    constructor(obj) {
        super(obj);
        this.position = {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
            heading: obj.position.heading
        };
        this._validation();
    }
    _validation() {
        if (typeof this.position !== "object" ||
            typeof this.position.x !== "number" ||
            typeof this.position.y !== "number" ||
            typeof this.position.z !== "number" ||
            typeof this.position.heading !== "number") {
            throw "Invalid position";
        }
    }
}
