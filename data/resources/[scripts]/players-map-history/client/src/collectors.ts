import { ComponentData, PlayerState, Position, SnapshotPayload, VehicleData } from "@shared/core";

const WEAPON_UNARMED = 0xa2719263;

function collectCoords(): Position {
    const ped = PlayerPedId();
    const [x, y, z] = GetEntityCoords(ped, false);
    const heading = GetEntityHeading(ped);

    return { x, y, z, heading };
}

export function collectPlayerState(): PlayerState {
    const ped = PlayerPedId();

    if (IsPedDeadOrDying(ped, false)) return PlayerState.DEAD;
    if (IsPedRagdoll(ped)) return PlayerState.RAGDOLL;
    if (IsPedInParachuteFreeFall(ped)) return PlayerState.PARACHUTING;
    if (IsPedSwimmingUnderWater(ped)) return PlayerState.DIVING;
    if (IsPedSwimming(ped)) return PlayerState.SWIMMING;
    if (IsPedClimbing(ped)) return PlayerState.CLIMBING;
    if (IsPedFalling(ped)) return PlayerState.FALLING;
    if (IsPedInAnyVehicle(ped, false)) return PlayerState.VEHICLE;
    if (IsPedSprinting(ped)) return PlayerState.SPRINTING;
    if (IsPedRunning(ped)) return PlayerState.RUNNING;
    if (IsPedWalking(ped)) return PlayerState.WALKING;

    return PlayerState.FOOT;
}

function getPedVehicleSeat(ped: number, vehicle: number): number {
    if (GetPedInVehicleSeat(vehicle, -1) === ped) {
        return -1;
    }

    const maxPassengers = GetVehicleMaxNumberOfPassengers(vehicle);

    for (let seat = 0; seat < maxPassengers; seat++) {
        if (GetPedInVehicleSeat(vehicle, seat) === ped) {
            return seat;
        }
    }
    return -1;
}

export function collectVehicle(): VehicleData | undefined {
    const ped = PlayerPedId();
    const vehicle = GetVehiclePedIsIn(ped, false);

    if (vehicle === 0) {
        return undefined;
    }

    const modelHash = GetEntityModel(vehicle);
    const model = GetDisplayNameFromVehicleModel(modelHash);
    const plate = GetVehicleNumberPlateText(vehicle).trim();
    const seat = getPedVehicleSeat(ped, vehicle);

    return { model, plate, seat };
}

export function collectWeapon(): string | undefined {
    const ped = PlayerPedId();
    const weaponHash = GetSelectedPedWeapon(ped) >>> 0;

    if (weaponHash === WEAPON_UNARMED) {
        return undefined;
    }
    return weaponHash.toString();
}

export function collectAiming(): boolean | undefined {
    const isAiming = IsPlayerFreeAiming(PlayerId());

    return isAiming || undefined;
}

export function collectSkin(): ComponentData[] {
    const ped = PlayerPedId();
    const components: ComponentData[] = [];

    for (let componentId = 0; componentId <= 11; componentId++) {
        const drawable = GetPedDrawableVariation(ped, componentId);
        const texture = GetPedTextureVariation(ped, componentId);

        components.push({ componentId, drawable, texture });
    }

    return components;
}

export function collectSnapshot(): SnapshotPayload {
    const coords = collectCoords();
    const playerState = collectPlayerState();
    const vehicle = collectVehicle();
    const weapon = collectWeapon();
    const isAiming = collectAiming();
    const skin = collectSkin();

    const snapshot: SnapshotPayload = {
        coords,
        playerState
    };

    if (vehicle) {
        snapshot.vehicle = vehicle;
    }
    if (weapon) {
        snapshot.weapon = weapon;
    }
    if (isAiming) {
        snapshot.isAiming = isAiming;
    }
    if (skin.length > 0) {
        snapshot.skin = skin;
    }

    return snapshot;
}
