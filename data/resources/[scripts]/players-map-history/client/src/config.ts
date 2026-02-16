import { PlayerState } from "@shared/core";

function parseStateList(value: string): PlayerState[] {
    if (!value.trim()) {
        return [];
    }
    return value
        .split(",")
        .map((state) => state.trim())
        .filter(Boolean) as PlayerState[];
}

export const clientConfig = {
    defaultInterval: Math.max(GetConvarInt("pmh_default_interval", 30000), 1000),
    idleTimeout: GetConvarInt("pmh_idle_timeout", 5 * 60 * 1000),

    triggerDistance: GetConvarInt("pmh_trigger_distance", 50),
    triggerState: parseStateList(GetConvar("pmh_trigger_state", "dead, ragdoll, parachuting, swimming, diving, climbing, falling, in_vehicle")),
    triggerVehicle: GetConvar("pmh_trigger_vehicle", "true") === "true",
    triggerWeapon: GetConvar("pmh_trigger_weapon", "true") === "true",
    triggerAiming: GetConvar("pmh_trigger_aiming", "true") === "true"
};
