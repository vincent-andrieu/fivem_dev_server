import { Position } from "../utils";
import TemplateObject, { NonTemplateObjectFunctions } from "./templateObject";

export type PlayerIdentifiers = {
    license: string;
    discord: string;
    fivem?: string;
    license2: string;
    ip: string;
};

export default class Player extends TemplateObject {
    public position: Position;
    public identifiers: PlayerIdentifiers;
    public name?: string;

    constructor(obj: NonTemplateObjectFunctions<Player>) {
        super(obj);

        this.position = {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
            heading: obj.position.heading
        };

        this.identifiers = {
            license: obj.identifiers.license,
            discord: obj.identifiers.discord,
            license2: obj.identifiers.license2,
            ip: obj.identifiers.ip
        };
        if (obj.identifiers.fivem) {
            this.identifiers.fivem = obj.identifiers.fivem;
        }

        if (obj.name) {
            this.name = obj.name;
        }

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

        if (
            typeof this.identifiers !== "object" ||
            typeof this.identifiers.license !== "string" ||
            typeof this.identifiers.discord !== "string" ||
            typeof this.identifiers.license2 !== "string" ||
            typeof this.identifiers.ip !== "string" ||
            (this.identifiers.fivem && typeof this.identifiers.fivem !== "string")
        ) {
            throw "Invalid identifiers";
        }
    }
}
