import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithGemini } from "@/lib/gemini";
import { z } from "zod";

const chatSchema = z.object({
    message: z.string().min(1).max(5000),
    sessionId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log('[Chat] Request body:', body);
        const validated = chatSchema.parse(body);
        console.log('[Chat] Validated:', validated);

        let chatSession;
        if (validated.sessionId) {
            chatSession = await prisma.chatSession.findUnique({
                where: { id: validated.sessionId, userId: session.user.id },
                include: {
                    messages: { orderBy: { createdAt: "asc" }, take: 50 },
                },
            });
        }

        if (!chatSession) {
            chatSession = await prisma.chatSession.create({
                data: {
                    userId: session.user.id,
                    title: validated.message.substring(0, 50) + (validated.message.length > 50 ? "..." : ""),
                },
                include: { messages: true },
            });
        }

        const medicalProfile = await prisma.medicalProfile.findUnique({
            where: { userId: session.user.id },
        });

        const messageHistory = chatSession.messages.map((msg: { role: string; content: string }) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        }));
        messageHistory.push({ role: "user", content: validated.message });

        await prisma.chatMessage.create({
            data: {
                sessionId: chatSession.id,
                role: "user",
                content: validated.message,
            },
        });

        console.log('[Chat] Calling Gemini API...');
        const aiResponse = await chatWithGemini(messageHistory, {
            cancerType: medicalProfile?.cancerType || undefined,
            stage: medicalProfile?.cancerStage || undefined,
            treatment: medicalProfile?.currentTreatment || undefined,
            interests: (medicalProfile?.interests as string[]) || undefined,
        });
        console.log('[Chat] Success');

        const savedMessage = await prisma.chatMessage.create({
            data: {
                sessionId: chatSession.id,
                role: "assistant",
                content: aiResponse,
            },
        });

        return NextResponse.json({
            sessionId: chatSession.id,
            message: {
                id: savedMessage.id,
                role: "assistant",
                content: aiResponse,
                createdAt: savedMessage.createdAt,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors?.[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("❌ Chat API error:", error);
        return NextResponse.json(
            { error: `AI service error: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
        );
    }
}
