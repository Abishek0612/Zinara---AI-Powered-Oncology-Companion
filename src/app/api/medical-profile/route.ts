import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.medicalProfile.findUnique({
            where: { userId: session.user.id },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Medical profile fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { cancerType, cancerStage, currentTreatment } = body;

        const profile = await prisma.medicalProfile.upsert({
            where: { userId: session.user.id },
            update: {
                cancerType: cancerType || null,
                cancerStage: cancerStage || null,
                currentTreatment: currentTreatment || null,
            },
            create: {
                userId: session.user.id,
                cancerType: cancerType || null,
                cancerStage: cancerStage || null,
                currentTreatment: currentTreatment || null,
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Medical profile update error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
