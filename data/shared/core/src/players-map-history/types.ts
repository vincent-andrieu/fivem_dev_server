import { Position } from "../utils";

export enum PlayerState {
    FOOT = "foot",
    WALKING = "walking",
    RUNNING = "running",
    SPRINTING = "sprinting",
    SWIMMING = "swimming",
    DIVING = "diving",
    PARACHUTING = "parachuting",
    CLIMBING = "climbing",
    FALLING = "falling",
    VEHICLE = "vehicle",
    RAGDOLL = "ragdoll",
    DEAD = "dead"
}

export interface ComponentData {
    componentId: number;
    drawable: number;
    texture: number;
}

export interface VehicleData {
    model: string;
    plate: string;
    seat: number;
}

export interface SnapshotPayload {
    coords: Position;
    playerState: PlayerState;
    vehicle?: VehicleData;
    skin?: ComponentData[];
    weapon?: string;
    isAiming?: boolean;
}
