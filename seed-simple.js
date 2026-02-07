const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding onboarding questions...');

  // Delete existing questions
  await prisma.onboardingQuestion.deleteMany({});

  // Create questions
  const questions = [
    {
      question: "What type of cancer have you been diagnosed with?",
      questionType: "TEXT",
      order: 1,
      isRequired: true,
    },
    {
      question: "When were you diagnosed?",
      questionType: "DATE",
      order: 2,
      isRequired: true,
    },
    {
      question: "What stage is your cancer?",
      questionType: "SELECT",
      order: 3,
      isRequired: true,
      options: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV", "Not sure"],
    },
    {
      question: "Are you currently undergoing treatment?",
      questionType: "SELECT",
      order: 4,
      isRequired: true,
      options: ["Yes", "No", "Treatment completed"],
    },
    {
      question: "What treatment(s) have you received or are you receiving?",
      questionType: "MULTI_SELECT",
      order: 5,
      isRequired: false,
      options: ["Surgery", "Chemotherapy", "Radiation", "Immunotherapy", "Hormone therapy", "Targeted therapy", "Other"],
    },
  ];

  for (const q of questions) {
    await prisma.onboardingQuestion.create({
      data: q,
    });
  }

  console.log(' Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
