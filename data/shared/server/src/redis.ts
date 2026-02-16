import redis from "redis";

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
    const url = GetConvar("REDIS_URL", "redis://localhost:6379");
    if (url) {
        return url;
    }
    throw new Error("Missing Redis configuration");
}
