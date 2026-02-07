import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const log = await prisma.sideEffectLog.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!log) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.sideEffectLog.delete({ where: { id } });

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Delete side effect error:", error);
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 }
        );
    }
}
