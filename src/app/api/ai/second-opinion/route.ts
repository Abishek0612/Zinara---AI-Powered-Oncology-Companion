import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGeminiModel, ONCOLOGY_SYSTEM_PROMPT } from "@/lib/gemini";
import { redis } from "@/lib/redis";
import { z } from "zod";

const schema = z.object({
    query: z.string().min(10, "Please provide more detail").max(5000),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit
        if (redis) {
            const rateLimitKey = `ratelimit:second-opinion:${session.user.id}`;
            const count = await redis.incr(rateLimitKey);
            if (count === 1) await redis.expire(rateLimitKey, 3600);
            if (count > 5) {
                return NextResponse.json(
                    { error: "Rate limit reached. Please try again in an hour." },
                    { status: 429 }
                );
            }
        }

        const body = await req.json();
        const validated = schema.parse(body);

        const profile = await prisma.medicalProfile.findUnique({
            where: { userId: session.user.id },
        });

        const model = getGeminiModel("gemini-1.5-pro");

        const prompt = `${ONCOLOGY_SYSTEM_PROMPT}

You are providing an AI-generated second opinion analysis. This is NOT a clinical diagnosis.

Patient context:
- Cancer Type: ${profile?.cancerType || "Not specified"}
- Stage: ${profile?.cancerStage || "Not specified"}
- Current Treatment: ${profile?.currentTreatment || "Not specified"}

Patient's Question/Situation:
${validated.query}

Provide a thorough analysis with the following structure:
1. **Understanding of Your Situation**: Summarize what you understand
2. **Analysis of Current Approach**: Evaluate the current treatment plan
3. **Alternative Considerations**: Other approaches worth discussing with their oncologist
4. **Latest Research & Evidence**: Recent developments relevant to their case
5. **Questions to Ask Your Doctor**: Specific questions to bring to their next appointment
6. **Important Considerations**: Factors that might influence treatment decisions

CRITICAL DISCLAIMER: This is AI-generated educational information only. A proper second opinion requires a full review of medical records by a qualified oncologist. Always discuss any changes with your healthcare team.`;

        const result = await model.generateContent(prompt);
        const analysis = result.response.text();

        return NextResponse.json({ analysis });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors?.[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Second opinion error:", error);
        return NextResponse.json(
            { error: "Failed to generate analysis" },
            { status: 500 }
        );
    }
}
