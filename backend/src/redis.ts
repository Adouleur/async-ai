import { Redis } from "@upstash/redis";

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export async function setRecord(key: string, record: any, ttl = 600) {
    const str = JSON.stringify(record);

    await redis.setex(key, ttl, str);
}

export async function getRecord<T>(key: string): Promise<T | null> {
    const data = await redis.get<T>(key);
    if (!data) return null;
    return data;
}

