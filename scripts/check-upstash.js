const Redis = require("ioredis");

const redisUrl = "rediss://default:AYLVAAIncDJmMTJiZjkzZGZmZjA0NDI5YmMzYjNlOGFhNWU1YWM3ZHAyMzM0OTM@epic-tadpole-33493.upstash.io:6379";
console.log(`Connecting to Upstash Redis...`);

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
});

redis.set("zinara_test_key", "Redis is working! ")
    .then(() => {
        console.log(" Written to cache successfully");
        return redis.get("zinara_test_key");
    })
    .then((result) => {
        console.log(` Read from cache: "${result}"`);
        console.log(" REDIS CONNECTION SUCCESSFUL!");
        redis.quit();
    })
    .catch((err) => {
        console.error(" Redis Error:", err.message);
        redis.quit();
    });
