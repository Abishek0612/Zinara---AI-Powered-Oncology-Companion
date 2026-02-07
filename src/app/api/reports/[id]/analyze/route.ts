import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeReport } from "@/lib/gemini";

export async function POST(
    req: NextRequest,
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

        // Update status
        await prisma.report.update({
            where: { id },
            data: { analysisStatus: "ANALYZING" },
        });

        // Get patient context
        const profile = await prisma.medicalProfile.findUnique({
            where: { userId: session.user.id },
        });

        const { reportText } = await req.json();

        const analysis = await analyzeReport(reportText, {
            cancerType: profile?.cancerType || undefined,
            stage: profile?.cancerStage || undefined,
        });

        const updatedReport = await prisma.report.update({
            where: { id },
            data: {
                aiAnalysis: { raw: analysis, analyzedAt: new Date().toISOString() },
                analysisStatus: "COMPLETED",
            },
        });

        return NextResponse.json({ report: updatedReport, analysis });
    } catch (error) {
        console.error("Report analysis error:", error);
        const { id } = await params;
        await prisma.report.update({
            where: { id },
            data: { analysisStatus: "FAILED" },
        });
        return NextResponse.json(
            { error: "Failed to analyze report" },
            { status: 500 }
        );
    }
}
