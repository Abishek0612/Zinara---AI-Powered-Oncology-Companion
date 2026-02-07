import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, invalidateCache } from "@/lib/redis";
import { z } from "zod";
import { getClientIp } from "@/lib/utils";

const responseSchema = z.object({
    questionId: z.string(),
    stepNumber: z.number().min(1).max(3),
    answer: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validated = responseSchema.parse(body);
        const ipAddress = getClientIp(req);

        const response = await prisma.onboardingResponse.upsert({
            where: {
                userId_stepNumber: {
                    userId: session.user.id,
                    stepNumber: validated.stepNumber,
                },
            },
            update: {
                answer: validated.answer,
                metadata: (validated.metadata as any) || undefined,
                ipAddress,
                questionId: validated.questionId,
            },
            create: {
                userId: session.user.id,
                questionId: validated.questionId,
                stepNumber: validated.stepNumber,
                answer: validated.answer,
                metadata: (validated.metadata as any) || undefined,
                ipAddress,
            },
        });

        if (validated.stepNumber === 3) {
            console.log("Processing final step (3) for user:", session.user.id);
            const allResponses = await prisma.onboardingResponse.findMany({
                where: { userId: session.user.id },
                orderBy: { stepNumber: "asc" },
            });
            console.log("Found responses count:", allResponses.length);

            const q1 = allResponses.find((r: { stepNumber: number; answer: string }) => r.stepNumber === 1);
            const q2 = allResponses.find((r: { stepNumber: number; answer: string }) => r.stepNumber === 2);
            const q3 = allResponses.find((r: { stepNumber: number; answer: string }) => r.stepNumber === 3);

            console.log("Answers found:", { q1: q1?.answer, q2: q2?.answer, q3: q3?.answer });

            let accessingFor: "SELF" | "LOVED_ONE" | "OTHER" = "SELF";
            if (q1?.answer === "loved_one") accessingFor = "LOVED_ONE";
            else if (q1?.answer === "friend") accessingFor = "OTHER";

            console.log("Updating profile with accessingFor:", accessingFor);

            // Create/update medical profile
            await prisma.medicalProfile.upsert({
                where: { userId: session.user.id },
                update: {
                    cancerType: q2?.answer || null,
                    cancerStage: q3?.answer || null,
                    accessingFor,
                    currentTreatment: "Not Started", // Default
                    interests: [],
                },
                create: {
                    userId: session.user.id,
                    cancerType: q2?.answer || null,
                    cancerStage: q3?.answer || null,
                    accessingFor,
                    currentTreatment: "Not Started", // Default
                    interests: [],
                },
            });
            console.log("Medical Profile updated successfully");

            // Mark onboarding complete
            const userUpdate = await prisma.user.update({
                where: { id: session.user.id },
                data: { onboardingDone: true },
            });
            console.log("User onboardingDone set to true:", userUpdate.onboardingDone);

            // Invalidate cache
            await invalidateCache(`patient:${session.user.id}:*`);
        }

        return NextResponse.json({ success: true, response });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Onboarding response error:", error);
        return NextResponse.json(
            { error: "Failed to save response" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const responses = await prisma.onboardingResponse.findMany({
            where: { userId: session.user.id },
            orderBy: { stepNumber: "asc" },
            include: { question: true },
        });

        return NextResponse.json({ responses });
    } catch (error) {
        console.error("Get responses error:", error);
        return NextResponse.json(
            { error: "Failed to fetch responses" },
            { status: 500 }
        );
    }
}
