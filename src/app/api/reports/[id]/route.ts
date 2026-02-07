import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Single report
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const report = await prisma.report.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json({ report });
    } catch (error) {
        console.error("Get report error:", error);
        return NextResponse.json(
            { error: "Failed to fetch report" },
            { status: 500 }
        );
    }
}

// DELETE: Delete report
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const report = await prisma.report.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        await prisma.report.delete({ where: { id } });

        return NextResponse.json({ message: "Report deleted" });
    } catch (error) {
        console.error("Delete report error:", error);
        return NextResponse.json(
            { error: "Failed to delete report" },
            { status: 500 }
        );
    }
}
