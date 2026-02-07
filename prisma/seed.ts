
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Clear existing data (order matters due to foreign keys)
    await prisma.onboardingResponse.deleteMany({}) // Clean responses first
    await prisma.onboardingQuestion.deleteMany({}) // Then questions

    const questions = [
        {
            stepNumber: 1,
            questionText: "Who is this profile for?",
            questionType: "dropdown",
            options: [
                { label: "Myself", value: "self" },
                { label: "My Partner / Spouse", value: "partner" },
                { label: "My Parent", value: "parent" },
                { label: "My Child", value: "child" },
                { label: "Other Family Member", value: "relative" },
                { label: "Friend", value: "friend" }
            ],
            isActive: true
        },
        {
            stepNumber: 2,
            questionText: "What type of cancer has been diagnosed?",
            questionType: "dropdown",
            options: [
                { label: "Breast Cancer", value: "breast_cancer" },
                { label: "Lung Cancer", value: "lung_cancer" },
                { label: "Prostate Cancer", value: "prostate_cancer" },
                { label: "Colorectal Cancer", value: "colorectal_cancer" },
                { label: "Melanoma", value: "melanoma" },
                { label: "Bladder Cancer", value: "bladder_cancer" },
                { label: "Non-Hodgkin Lymphoma", value: "nh_lymphoma" },
                { label: "Kidney Cancer", value: "kidney_cancer" },
                { label: "Leukemia", value: "leukemia" },
                { label: "Pancreatic Cancer", value: "pancreatic_cancer" },
                { label: "Thyroid Cancer", value: "thyroid_cancer" },
                { label: "Liver Cancer", value: "liver_cancer" },
                { label: "Other", value: "other" }
            ],
            isActive: true
        },
        {
            stepNumber: 3,
            questionText: "What is the current stage of the cancer?",
            questionType: "dropdown",
            options: [
                { label: "Stage 0 (Carcinoma in situ)", value: "stage_0" },
                { label: "Stage I", value: "stage_1" },
                { label: "Stage II", value: "stage_2" },
                { label: "Stage III", value: "stage_3" },
                { label: "Stage IV (Metastatic)", value: "stage_4" },
                { label: "Not Sure / Don't Know", value: "unknown" }
            ],
            isActive: true
        },
        {
            stepNumber: 4,
            questionText: "What is the primary goal of using Zinara?",
            questionType: "multi-select",
            options: [
                { label: "Understanding Treatment Options", value: "treatment_options" },
                { label: "Finding Clinical Trials", value: "clinical_trials" },
                { label: "Managing Side Effects", value: "side_effects" },
                { label: "Diet & Lifestyle Recommendations", value: "lifestyle" },
                { label: "Emotional Support", value: "emotional_support" },
                { label: "Getting a Second Opinion", value: "second_opinion" }
            ],
            isActive: true
        }
    ]

    for (const q of questions) {
        const question = await prisma.onboardingQuestion.create({
            data: q
        })
        console.log(`Created question with id: ${question.id}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
