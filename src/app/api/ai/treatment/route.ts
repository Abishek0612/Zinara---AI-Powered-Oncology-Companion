import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTreatmentInfo } from "@/lib/gemini";
import { getCachedData } from "@/lib/redis";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.medicalProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile?.cancerType) {
            return NextResponse.json(
                { error: "Cancer type not specified in your profile" },
                { status: 400 }
            );
        }

        const cacheKey = `treatment:${profile.cancerType}:${profile.cancerStage}`;
        const treatmentInfo = await getCachedData(
            cacheKey,
            () =>
                getTreatmentInfo(
                    profile.cancerType!,
                    profile.cancerStage || "unknown",
                    profile.currentTreatment || undefined
                ),
            3600 // Cache for 1 hour
        );

        return NextResponse.json({ treatmentInfo });
    } catch (error) {
        console.error("Treatment info error:", error);
        return NextResponse.json(
            { error: "Failed to get treatment information" },
            { status: 500 }
        );
    }
}
