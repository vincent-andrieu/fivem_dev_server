import { Player } from "core";
import "./polyfill";

import { initMongo } from "./mongo";

async function main() {
    console.log(
        "Player",
        new Player({
            position: {
                x: 0,
                y: 0,
                z: 0,
                heading: 0
            }
        })
    );

    await initMongo();
}

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
