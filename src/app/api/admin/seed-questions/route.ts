import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const questions = [
            {
                id: 'clx1',
                stepNumber: 1,
                questionText: 'I am seeking care for:',
                questionType: 'dropdown',
                options: [
                    { value: 'myself', label: 'Myself' },
                    { value: 'family', label: 'A Family Member' },
                    { value: 'friend', label: 'A Friend' }
                ],
                isActive: true,
            },
            {
                id: 'clx2',
                stepNumber: 2,
                questionText: 'What type of cancer does {subject} have?',
                questionType: 'dropdown',
                options: [
                    { value: 'breast', label: 'Breast Cancer', dynamicSubject: true },
                    { value: 'lung', label: 'Lung Cancer', dynamicSubject: true },
                    { value: 'prostate', label: 'Prostate Cancer', dynamicSubject: true },
                    { value: 'colorectal', label: 'Colorectal Cancer', dynamicSubject: true },
                    { value: 'other', label: 'Other', dynamicSubject: true }
                ],
                dependsOn: { questionStep: 1, transformSubject: true },
                isActive: true,
            },
            {
                id: 'clx3',
                stepNumber: 3,
                questionText: 'What is {possessive} cancer stage?',
                questionType: 'dropdown',
                options: [
                    { value: 'stage0', label: 'Stage 0', dynamicSubject: true },
                    { value: 'stage1', label: 'Stage I', dynamicSubject: true },
                    { value: 'stage2', label: 'Stage II', dynamicSubject: true },
                    { value: 'stage3', label: 'Stage III', dynamicSubject: true },
                    { value: 'stage4', label: 'Stage IV', dynamicSubject: true },
                    { value: 'unsure', label: 'Not Sure', dynamicSubject: true }
                ],
                dependsOn: { questionStep: 1, transformSubject: true },
                isActive: true,
            },
        ];

        // Delete old questions 
        await prisma.onboardingQuestion.deleteMany({});

        // Create new questions
        for (const q of questions) {
            await prisma.onboardingQuestion.create({
                data: q,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Onboarding questions seeded successfully',
            count: questions.length
        });
    } catch (error) {
        console.error('Error seeding questions:', error);
        return NextResponse.json(
            { error: 'Failed to seed questions', details: String(error) },
            { status: 500 }
        );
    }
}
