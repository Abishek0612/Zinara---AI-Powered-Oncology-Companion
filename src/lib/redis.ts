import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined | null;
};

// Only initialize Redis if REDIS_URL is provided
let redisInstance: Redis | null = null;

if (process.env.REDIS_URL) {
    try {
        redisInstance = globalForRedis.redis ?? new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) return null; // Stop retrying after 3 attempts
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            lazyConnect: true, // Don't connect immediately
        });

        // Suppress errors to prevent app crashes
        redisInstance.on('error', (err) => {
            console.warn('[Redis] Connection error (non-fatal):', err.message);
        });

        if (process.env.NODE_ENV !== "production") {
            globalForRedis.redis = redisInstance;
        }
    } catch (error) {
        console.warn('[Redis] Failed to initialize:', error);
        redisInstance = null;
    }
}

export const redis = redisInstance;

// Cache helper - gracefully handles Redis being unavailable
export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
): Promise<T> {
    // If Redis is not available, just fetch directly
    if (!redis) {
        return await fetcher();
    }

    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;

        const data = await fetcher();
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        return data;
    } catch (error) {
        // If Redis fails, fall back to direct fetch
        console.warn('[Redis] Cache operation failed, fetching directly:', error);
        return await fetcher();
    }
}

export async function invalidateCache(pattern: string): Promise<void> {
    if (!redis) return;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.warn('[Redis] Failed to invalidate cache:', error);
    }
}