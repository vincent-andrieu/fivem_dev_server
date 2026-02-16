import { distance3D } from "@shared/core";
import { collectSnapshot } from "./collectors";
import { clientConfig } from "./config";
import { checkTriggers, hasStateChanged, resetTriggerState } from "./triggers";

let lastSnapshotCoords = { x: 0, y: 0, z: 0 };
let lastSnapshotTime = 0;
let lastChangeTime = Date.now();

function sendSnapshot(): void {
    const snapshot = collectSnapshot();
    TriggerServerEvent("players-map-history:snapshot", snapshot);
    lastSnapshotCoords = { x: snapshot.coords.x, y: snapshot.coords.y, z: snapshot.coords.z };
    lastSnapshotTime = Date.now();
    resetTriggerState(snapshot);
}

// Fast tick (~1s) — check instant triggers
setTick(async () => {
    const triggered = checkTriggers(lastSnapshotCoords);

    if (triggered) {
        sendSnapshot();
        lastChangeTime = Date.now();
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
});

// Periodic timer — guaranteed snapshot at configurable interval
setTick(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, clientConfig.defaultInterval));

    const now = Date.now();
    const timeSinceLastSnapshot = now - lastSnapshotTime;

    if (timeSinceLastSnapshot < clientConfig.defaultInterval) {
        return;
    }

    const snapshot = collectSnapshot();
    const ped = PlayerPedId();
    const [currentX, currentY, currentZ] = GetEntityCoords(ped, false);
    const currentCoords = { x: currentX, y: currentY, z: currentZ };

    const isImmobile = distance3D(currentCoords, lastSnapshotCoords) < 1;
    const stateChanged = hasStateChanged(snapshot);

    if (!isImmobile || stateChanged) {
        lastChangeTime = now;

        TriggerServerEvent("players-map-history:snapshot", snapshot);
        lastSnapshotCoords = { x: snapshot.coords.x, y: snapshot.coords.y, z: snapshot.coords.z };
        lastSnapshotTime = now;
        resetTriggerState(snapshot);
    } else {
        const timeSinceLastChange = now - lastChangeTime;

        if (timeSinceLastChange < clientConfig.idleTimeout) {
            return;
        }
    }
});
