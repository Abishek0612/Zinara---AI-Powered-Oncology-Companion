import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const uploadSchema = z.object({
    fileName: z.string().min(1).max(255),
    content: z.string().min(1),
    fileType: z.string().default("text"),
});

// GET: List reports for current user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reports = await prisma.report.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileType: true,
                analysisStatus: true,
                aiAnalysis: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("List reports error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validated = uploadSchema.parse(body);

        const report = await prisma.report.create({
            data: {
                userId: session.user.id,
                fileName: validated.fileName,
                fileUrl: validated.content,
                fileType: validated.fileType,
                analysisStatus: "PENDING",
            },
        });

        return NextResponse.json({ report }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors?.[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Upload report error:", error);
        return NextResponse.json(
            { error: "Failed to upload report" },
            { status: 500 }
        );
    }
}
