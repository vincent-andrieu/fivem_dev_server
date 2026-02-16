import { Position } from "../utils";

export enum PlayerState {
    ON_FOOT = "on_foot",
    WALKING = "walking",
    RUNNING = "running",
    SPRINTING = "sprinting",
    SWIMMING = "swimming",
    DIVING = "diving",
    PARACHUTING = "parachuting",
    CLIMBING = "climbing",
    FALLING = "falling",
    IN_VEHICLE = "in_vehicle",
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
