const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedQuestions() {
  console.log('🌱 Seeding onboarding questions...');

  const questions = [
    {
      id: 'clx1',
      stepNumber: 1,
      questionText: 'I am seeking care for:',
      questionType: 'dropdown',
      options: ['Myself', 'A Family Member', 'A Friend'],
      isActive: true,
    },
    {
      id: 'clx2',
      stepNumber: 2,
      questionText: 'What type of cancer?',
      questionType: 'text',
      options: [],
      isActive: true,
    },
    {
      id: 'clx3',
      stepNumber: 3,
      questionText: 'What is the cancer stage?',
      questionType: 'dropdown',
      options: ['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Not Sure'],
      isActive: true,
    },
    {
      id: 'clx4',
      stepNumber: 4,
      questionText: 'What treatments have been received?',
      questionType: 'multi-select',
      options: ['Surgery', 'Chemotherapy', 'Radiation', 'Immunotherapy', 'Hormone Therapy', 'Targeted Therapy', 'None Yet'],
      isActive: true,
    },
    {
      id: 'clx5',
      stepNumber: 5,
      questionText: 'When was the diagnosis?',
      questionType: 'text',
      options: [],
      isActive: true,
    },
  ];

  for (const q of questions) {
    await prisma.onboardingQuestion.upsert({
      where: { stepNumber: q.stepNumber },
      update: q,
      create: q,
    });
    console.log(`✅ Created question ${q.stepNumber}: ${q.questionText}`);
  }

  console.log('✅ Onboarding questions seeded successfully!');
}

seedQuestions()
  .catch((e) => {
    console.error('❌ Error seeding questions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
