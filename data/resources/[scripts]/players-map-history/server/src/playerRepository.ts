import { PlayersModel } from "@shared/server";

const playersModel = new PlayersModel();
const playerCache = new Map<string, string>();

export async function resolvePlayerId(source: string): Promise<string> {
    const cached = playerCache.get(source);
    if (cached) {
        return cached;
    }

    const player = await playersModel.getPlayerBySource(source);
    if (!player._id) {
        throw new Error(`Player id not found for source ${source}`);
    }

    const playerId = String(player._id);
    playerCache.set(source, playerId);
    return playerId;
}

export function removePlayerSource(source: string): void {
    playerCache.delete(source);
}
