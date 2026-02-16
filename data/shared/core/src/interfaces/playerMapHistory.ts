import { ComponentData, PlayerState, VehicleData } from "../players-map-history/types";
import { Position } from "../utils";
import Player from "./player";
import TemplateObject, { NonTemplateObjectFunctions } from "./templateObject";

export default class PlayersMapHistory extends TemplateObject {
    public player: string | Player;
    public sessionId: number;
    public coords: Position;
    public playerState: PlayerState;
    public vehicle?: VehicleData;
    public skin?: ComponentData[];
    public weapon?: string;
    public isAiming?: boolean;

    constructor(obj: NonTemplateObjectFunctions<PlayersMapHistory>) {
        super(obj);

        this.player = typeof obj.player === "string" ? obj.player : new Player(obj.player);
        this.sessionId = obj.sessionId;
        this.coords = {
            x: obj.coords.x,
            y: obj.coords.y,
            z: obj.coords.z,
            heading: obj.coords.heading
        };
        this.playerState = obj.playerState;

        if (obj.vehicle) {
            this.vehicle = {
                model: obj.vehicle.model,
                plate: obj.vehicle.plate,
                seat: obj.vehicle.seat
            };
        }
        if (obj.skin) {
            this.skin = obj.skin.map((component) => ({
                componentId: component.componentId,
                drawable: component.drawable,
                texture: component.texture
            }));
        }
        if (obj.weapon) {
            this.weapon = obj.weapon;
        }
        if (obj.isAiming !== undefined) {
            this.isAiming = obj.isAiming;
        }

        this._validation();
    }

    protected _validation(): void {
        if (typeof this.player !== "string" && typeof this.player !== "object") {
            throw new Error("Invalid player");
        }
        if (typeof this.player === "string" && this.player.length === 0) {
            throw new Error("Invalid player");
        }

        if (typeof this.sessionId !== "number" || !Number.isInteger(this.sessionId)) {
            throw new Error("Invalid sessionId");
        }

        if (
            typeof this.coords !== "object" ||
            typeof this.coords.x !== "number" ||
            typeof this.coords.y !== "number" ||
            typeof this.coords.z !== "number" ||
            typeof this.coords.heading !== "number"
        ) {
            throw new Error("Invalid coords");
        }

        if (!Object.values(PlayerState).includes(this.playerState)) {
            throw new Error("Invalid playerState");
        }

        if (this.vehicle && (typeof this.vehicle.model !== "string" || typeof this.vehicle.plate !== "string" || typeof this.vehicle.seat !== "number")) {
            throw new Error("Invalid vehicle");
        }

        if (
            this.skin &&
            (!Array.isArray(this.skin) ||
                this.skin.some((component) => typeof component.componentId !== "number" || typeof component.drawable !== "number" || typeof component.texture !== "number"))
        ) {
            throw new Error("Invalid skin");
        }

        if (this.weapon && typeof this.weapon !== "string") {
            throw new Error("Invalid weapon");
        }

        if (this.isAiming !== undefined && typeof this.isAiming !== "boolean") {
            throw new Error("Invalid isAiming");
        }
    }
}
