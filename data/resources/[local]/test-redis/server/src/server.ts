import initRedis from "./redis";

async function main() {
    await initRedis();
}

try {
    main().catch(console.error);
} catch (error) {
    console.error(error);
}
