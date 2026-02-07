import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDietRecommendations } from "@/lib/gemini";
import { getCachedData } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sideEffects = [] } = await req.json();

        const profile = await prisma.medicalProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile?.cancerType) {
            return NextResponse.json(
                { error: "Cancer type not specified" },
                { status: 400 }
            );
        }

        const cacheKey = `diet:${profile.cancerType}:${profile.currentTreatment}:${sideEffects.sort().join(",")}`;
        const recommendations = await getCachedData(
            cacheKey,
            () =>
                getDietRecommendations(
                    profile.cancerType!,
                    profile.currentTreatment || "Not specified",
                    sideEffects
                ),
            1800
        );

        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error("Diet recommendations error:", error);
        return NextResponse.json(
            { error: "Failed to get diet recommendations" },
            { status: 500 }
        );
    }
}
