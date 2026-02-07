import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
    const checks: Record<string, string> = {};

    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = "healthy";
    } catch {
        checks.database = "unhealthy";
    }

    try {
        await redis.ping();
        checks.redis = "healthy";
    } catch {
        checks.redis = "unhealthy";
    }

    const allHealthy = Object.values(checks).every((v) => v === "healthy");

    return NextResponse.json(
        { status: allHealthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
        { status: allHealthy ? 200 : 503 }
    );
}
