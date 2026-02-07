const fs = require('fs');
const Redis = require('ioredis');

// Manually load .env since dotenv is not installed
try {
    const envConfig = fs.readFileSync('.env', 'utf8');
    envConfig.split('\n').forEach((line: string) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
} catch (e) {
    console.log("Could not load .env file manually:", e);
}

async function testRedis() {
    console.log("🔌 Connecting to Redis...");
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        console.error("❌ ERROR: REDIS_URL is missing in .env");
        return;
    }

    // Use ioredis
    const redis = new Redis(redisUrl);

    try {
        // Write
        await redis.set('test-ping', 'PONG 🏓');
        console.log("✅ Written key: 'test-ping'");

        // Read
        const value = await redis.get('test-ping');
        console.log(`✅ Read key 'test-ping': "${value}"`);

        if (value === 'PONG 🏓') {
            console.log("\n🚀 SUCCCESS: Redis is FULLY WORKING!");
        } else {
            console.log("\n⚠️ WARNING: Connected but value mismatch.");
        }

        redis.disconnect();

    } catch (error) {
        console.error("\n❌ CONNECTION FAILED:", error);
        redis.disconnect();
    }
}

testRedis();
