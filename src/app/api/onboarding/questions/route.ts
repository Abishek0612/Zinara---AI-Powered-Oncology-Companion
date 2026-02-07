import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const step = req.nextUrl.searchParams.get("step");

    if (!step) {
        return NextResponse.json({ error: "Step is required" }, { status: 400 });
    }

    try {
        const question = await prisma.onboardingQuestion.findUnique({
            where: { stepNumber: parseInt(step) },
        });

        if (!question) {
            return NextResponse.json(
                { error: "Question not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ question });
    } catch (error) {
        console.error("Fetch question error:", error);
        return NextResponse.json(
            { error: "Failed to fetch question" },
            { status: 500 }
        );
    }
}
