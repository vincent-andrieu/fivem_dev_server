import { initMongo, PlayersModel } from "@shared/server";

async function main() {
    await initMongo();

    await new PlayersModel().add({
        position: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            heading: 0.0
        }
    });
}

on("playerJoining", (source: string, _oldID: string) => {
    const identifiers = getPlayerIdentifiers(source);
    console.log(`Player ${source} is joining`, identifiers);
});

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
