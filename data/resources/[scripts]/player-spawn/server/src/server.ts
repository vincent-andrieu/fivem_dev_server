import { Player, PlayerIdentifiers } from "@shared/core";
import { initMongo, PlayersModel } from "@shared/server";

const playersModel = new PlayersModel();

async function main() {
    await initMongo();
}

on("playerJoining", (source: string, _oldID: string) => {
    const player = upsertPlayer(source);
});

async function upsertPlayer(source: string) {
    try {
        return playersModel.getPlayerBySource(source);
    } catch (error) {
        if (typeof error === "string") {
            const identifiersList = getPlayerIdentifiers(source);
            const identifiers: Record<string, string> = {};

            identifiersList.forEach((rawIdentifier) => {
                const [type, identifier] = rawIdentifier.split(":");

                identifiers[type] = identifier;
            });

            await playersModel.add(
                new Player({
                    position: { x: 0, y: 0, z: 0, heading: 0 },
                    identifiers: identifiers as PlayerIdentifiers
                })
            );
        }
    }
}

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
