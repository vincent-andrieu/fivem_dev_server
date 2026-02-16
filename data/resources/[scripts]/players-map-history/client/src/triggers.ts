import { PlayerState, VehicleData, distance3D } from "@shared/core";
import { collectPlayerState, collectVehicle, collectWeapon } from "./collectors";
import { clientConfig } from "./config";

let lastState: PlayerState = PlayerState.ON_FOOT;
let lastVehicleKey = "";
let lastWeapon: string | undefined;
let lastAiming = false;

function getVehicleKey(vehicle?: VehicleData): string {
    if (!vehicle) {
        return "";
    }
    return `${vehicle.model}:${vehicle.plate}:${vehicle.seat}`;
}

export function checkTriggers(lastCoords: { x: number; y: number; z: number }): boolean {
    const ped = PlayerPedId();
    const [currentX, currentY, currentZ] = GetEntityCoords(ped, false);
    const currentCoords = { x: currentX, y: currentY, z: currentZ };
    const playerState = collectPlayerState();

    if (
        (clientConfig.triggerState.length > 0 && playerState !== lastState && clientConfig.triggerState.includes(playerState)) ||
        (clientConfig.triggerDistance > 0 && distance3D(currentCoords, lastCoords) >= clientConfig.triggerDistance) ||
        (clientConfig.triggerVehicle && getVehicleKey(collectVehicle()) !== lastVehicleKey) ||
        (clientConfig.triggerWeapon && collectWeapon() !== lastWeapon) ||
        (clientConfig.triggerAiming && IsPlayerFreeAiming(PlayerId()) !== lastAiming)
    ) {
        return true;
    }

    return false;
}

export function resetTriggerState(snapshot: { playerState: PlayerState; vehicle?: VehicleData; weapon?: string; isAiming?: boolean }): void {
    lastState = snapshot.playerState;
    lastVehicleKey = getVehicleKey(snapshot.vehicle);
    lastWeapon = snapshot.weapon;
    lastAiming = snapshot.isAiming ?? false;
}

export function hasStateChanged(snapshot: { playerState: PlayerState; vehicle?: VehicleData; weapon?: string; isAiming?: boolean }): boolean {
    return (
        snapshot.playerState !== lastState ||
        getVehicleKey(snapshot.vehicle) !== lastVehicleKey ||
        snapshot.weapon !== lastWeapon ||
        (snapshot.isAiming ?? false) !== lastAiming
    );
}
