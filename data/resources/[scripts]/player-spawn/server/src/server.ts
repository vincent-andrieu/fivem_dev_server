import { Player, PlayerIdentifiers } from "@shared/core";
import { initMongo, PlayersModel } from "@shared/server";

const playersModel = new PlayersModel();

async function main() {
    await initMongo();
}

on("playerJoining", async (source: string, _oldID: string) => {
    const player = await upsertPlayer(source);

    emitNet("player-spawn:init", source, player);
});

async function upsertPlayer(source: string): Promise<Player> {
    try {
        return await playersModel.getPlayerBySource(source);
    } catch (error) {
        if (typeof error === "string") {
            const identifiersList = getPlayerIdentifiers(source);
            const identifiers: Record<string, string> = {};

            identifiersList.forEach((rawIdentifier) => {
                const [type, identifier] = rawIdentifier.split(":");

                identifiers[type] = identifier;
            });

            return await playersModel.add(
                new Player({
                    position: { x: 0, y: 0, z: 75, heading: 0 },
                    identifiers: identifiers as PlayerIdentifiers
                })
            );
        }
        throw error;
    }
}

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
