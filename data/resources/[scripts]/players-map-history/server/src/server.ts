import { initRedis } from "@shared/server";

async function main() {
    await initRedis();
}

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
