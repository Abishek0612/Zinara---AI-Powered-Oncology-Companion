const fs = require('fs');
const Redis = require('ioredis');

try {
  const envConfig = fs.readFileSync('.env', 'utf8');
  envConfig.split('\n').filter(line => line.trim()).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
  console.log(" Config loaded from .env");
} catch (e) {
  console.log(" Could not load .env file manually:", e.message);
}

async function testRedis() {
  console.log("🔌 Connecting to Redis...");
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.error(" ERROR: REDIS_URL is missing in .env");
    return;
  }

  console.log(` Trying URL: ${redisUrl.substring(0, 20)}...`);
  
  const redis = new Redis(redisUrl);

  try {
    await redis.set('test-ping', 'PONG 🏓');
    console.log(" Written key: 'test-ping'");

    const value = await redis.get('test-ping');
    console.log(` Read key 'test-ping': "${value}"`);

    if (value === 'PONG ') {
      console.log("\n SUCCESS: Redis is FULLY WORKING!");
      console.log("   (Connected to Upstash)");
    } else {
      console.log("\n WARNING: Connected but value mismatch.");
    }

    redis.disconnect();

  } catch (error) {
    console.error("\n CONNECTION FAILED:", error);
    redis.disconnect();
  }
}

testRedis();
