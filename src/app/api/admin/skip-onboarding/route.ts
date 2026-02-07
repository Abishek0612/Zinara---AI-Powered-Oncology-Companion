import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { onboardingDone: true },
        });

        // Create a default medical profile
        await prisma.medicalProfile.upsert({
            where: { userId: session.user.id },
            update: {},
            create: {
                userId: session.user.id,
                cancerType: 'Not specified',
                cancerStage: 'Not specified',
                diagnosisDate: new Date(),
                currentTreatment: 'Not started',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully',
            redirect: '/'
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json(
            { error: 'Failed to complete onboarding', details: String(error) },
            { status: 500 }
        );
    }
}
