-- Seed onboarding questions
INSERT INTO onboarding_questions (id, "stepNumber", "questionText", "questionType", options, "isActive", "createdAt") VALUES
('clx1', 1, 'I am seeking care for:', 'dropdown', '["Myself", "A Family Member", "A Friend"]', true, NOW()),
('clx2', 2, 'What type of cancer?', 'text', '[]', true, NOW()),
('clx3', 3, 'What is the cancer stage?', 'dropdown', '["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV", "Not Sure"]', true, NOW()),
('clx4', 4, 'What treatments have been received?', 'multi-select', '["Surgery", "Chemotherapy", "Radiation", "Immunotherapy", "Hormone Therapy", "Targeted Therapy", "None Yet"]', true, NOW()),
('clx5', 5, 'When was the diagnosis?', 'text', '[]', true, NOW())
ON CONFLICT ("stepNumber") DO NOTHING;
