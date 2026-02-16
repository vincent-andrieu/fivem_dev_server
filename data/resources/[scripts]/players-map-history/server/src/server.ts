import { NonTemplateObjectFunctions, PlayersMapHistory, SnapshotPayload } from "@shared/core";
import { initMongo, PlayersMapHistoryModel } from "@shared/server";
import { removePlayerSource, resolvePlayerId } from "./playerRepository";

const playersMapHistoryModel = new PlayersMapHistoryModel();

async function main() {
    await initMongo();
    console.log("[players-map-history] Server started");
}

onNet("players-map-history:snapshot", async (payload: SnapshotPayload) => {
    const source = (global as any).source as string;

    try {
        const playerId = await resolvePlayerId(source);

        const document: NonTemplateObjectFunctions<PlayersMapHistory> = {
            player: playerId,
            sessionId: parseInt(source, 10),
            coords: payload.coords,
            playerState: payload.playerState
        };

        if (payload.vehicle) {
            document.vehicle = payload.vehicle;
        }
        if (payload.skin) {
            document.skin = payload.skin;
        }
        if (payload.weapon) {
            document.weapon = payload.weapon;
        }
        if (payload.isAiming) {
            document.isAiming = payload.isAiming;
        }

        await playersMapHistoryModel.add(document);
    } catch (error) {
        console.error(`[players-map-history] Failed to save snapshot for source ${source}:`, error);
    }
});

on("playerDropped", () => {
    const source = (global as any).source as string;

    removePlayerSource(source);
});

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
