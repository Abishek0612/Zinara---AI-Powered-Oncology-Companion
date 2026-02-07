import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(req);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { ipAddress: ip },
        });

        return NextResponse.json({ success: true, ip });
    } catch (error) {
        console.error("Track IP error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
