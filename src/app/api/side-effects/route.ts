import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const logSchema = z.object({
    symptom: z.string().min(1).max(200),
    severity: z.number().min(1).max(10),
    notes: z.string().max(1000).optional(),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const logs = await prisma.sideEffectLog.findMany({
            where: { userId: session.user.id },
            orderBy: { loggedAt: "desc" },
            take: 100,
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("List side effects error:", error);
        return NextResponse.json(
            { error: "Failed to fetch logs" },
            { status: 500 }
        );
    }
}

// POST: Create side effect log
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validated = logSchema.parse(body);

        const log = await prisma.sideEffectLog.create({
            data: {
                userId: session.user.id,
                symptom: validated.symptom,
                severity: validated.severity,
                notes: validated.notes || null,
            },
        });

        return NextResponse.json({ log }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors?.[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Create side effect error:", error);
        return NextResponse.json(
            { error: "Failed to save log" },
            { status: 500 }
        );
    }
}
