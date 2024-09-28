import "./polyfill";

import { initMongo } from "./mongo";

async function main() {
    await initMongo();
}

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
