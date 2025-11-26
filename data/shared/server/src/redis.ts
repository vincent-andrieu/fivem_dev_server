import redis from "redis";

const REDIS_URL = GetConvar("REDIS_URL", "redis://localhost:6379");

export type RedisClient = ReturnType<typeof redis.createClient>;

export async function initRedis(): Promise<RedisClient> {
    const url = getRedisUrl();

    const client = redis.createClient({
        url
    });

    client.on("error", (error) => console.error("Redis client error:", error));
    await client.connect();

    console.info("Redis successfully connected : \n\t- Address : " + client.options?.url + "\n\t- Database : " + client.options?.database);
    return client;
}

function getRedisUrl(): string {
    if (REDIS_URL) {
        return REDIS_URL;
    }
    throw new Error("Missing Redis configuration");
}
