import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set in environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export function getGeminiModel(modelName: string = "gemini-2.0-flash") {
    return genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
    });
}

export const ONCOLOGY_SYSTEM_PROMPT = `You are Zinara AI, a physician-informed, AI-powered oncology assistant. 
You provide evidence-based information about cancer care, treatment options, clinical trials, 
diet and lifestyle recommendations, and side effect management.

IMPORTANT GUIDELINES:
- Always clarify you are an AI assistant and NOT a replacement for medical professionals.
- Provide evidence-based information with references when possible.
- Be empathetic and supportive in your responses.
- If a question is outside your scope, recommend consulting an oncologist.
- Never diagnose conditions or prescribe medications.
- Use clear, accessible language while being medically accurate.
- When discussing treatment options, always mention to discuss with their healthcare team.`;


function handleGeminiError(error: unknown, context: string): string {
    console.error(`❌ Gemini API Error (${context}):`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        return `### Service Notice: High Demand
        
The AI assistant is currently experiencing high request volume (Rate Limit Exceeded). 

**Please wait a minute before trying again.**

In the meantime, reliable sources for information include:
*   [National Cancer Institute](https://www.cancer.gov)
*   [American Cancer Society](https://www.cancer.org)

*Note: This is a limitation of the free tier API.*`;
    }
    throw error;
}

export async function chatWithGemini(
    messages: { role: string; content: string }[],
    patientContext?: {
        cancerType?: string;
        stage?: string;
        treatment?: string;
        interests?: string[];
    }
) {
    const model = getGeminiModel();

    let systemContext = ONCOLOGY_SYSTEM_PROMPT;
    if (patientContext) {
        systemContext += `\n\nPatient Context (use to personalize responses):
    - Cancer Type: ${patientContext.cancerType || "Not specified"}
    - Stage: ${patientContext.stage || "Not specified"}
    - Current Treatment: ${patientContext.treatment || "Not specified"}
    - Areas of Interest: ${patientContext.interests?.join(", ") || "General"}`;
    }

    try {
        if (messages.length === 1) {
            const prompt = `${systemContext}\n\nUser: ${messages[0].content}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        }

        const chat = model.startChat({
            history: messages.slice(0, -1).map((msg) => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
                topP: 0.9,
            },
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        return result.response.text();
    } catch (error) {
        return handleGeminiError(error, "chatWithGemini");
    }
}

export async function analyzeReport(
    reportText: string,
    patientContext?: { cancerType?: string; stage?: string }
) {
    const model = getGeminiModel();

    const prompt = `${ONCOLOGY_SYSTEM_PROMPT}

Analyze the following medical report and provide:
1. **Summary**: A clear, patient-friendly summary of the key findings
2. **Key Metrics**: Important values and what they mean
3. **Areas of Concern**: Any values or findings that may need attention
4. **Recommended Questions**: Questions the patient should ask their doctor
5. **Next Steps**: General recommended follow-up actions

${patientContext ? `Patient has ${patientContext.cancerType || "unknown"} cancer, stage ${patientContext.stage || "unknown"}.` : ""}

Report Content:
${reportText}

IMPORTANT: Remind the patient this is AI-assisted analysis and should be reviewed with their oncologist.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return handleGeminiError(error, "analyzeReport");
    }
}

export async function getDietRecommendations(
    cancerType: string,
    treatment: string,
    sideEffects: string[]
) {
    const model = getGeminiModel();

    const prompt = `${ONCOLOGY_SYSTEM_PROMPT}

Provide personalized diet and lifestyle recommendations for:
- Cancer Type: ${cancerType}
- Current Treatment: ${treatment}
- Current Side Effects: ${sideEffects.join(", ") || "None reported"}

Structure your response as:
1. **Recommended Foods**: Foods that may benefit during this treatment
2. **Foods to Avoid**: Foods that may interfere with treatment or worsen side effects
3. **Meal Plan Suggestions**: Simple meal ideas for the week
4. **Lifestyle Tips**: Exercise, sleep, and stress management recommendations
5. **Supplements to Discuss**: Supplements to ask their doctor about

Always emphasize consulting with their healthcare team before making dietary changes.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return handleGeminiError(error, "getDietRecommendations");
    }
}

export async function getTreatmentInfo(
    cancerType: string,
    stage: string,
    currentTreatment?: string
) {
    const model = getGeminiModel();

    const prompt = `${ONCOLOGY_SYSTEM_PROMPT}

Provide information about treatment options for:
- Cancer Type: ${cancerType}
- Stage: ${stage}
- Current Treatment: ${currentTreatment || "None yet"}

Structure your response as:
1. **Overview**: Brief overview of this cancer type and stage
2. **Standard Treatment Options**: Evidence-based treatment approaches
3. **Emerging Therapies**: Recent breakthroughs and newer options
4. **Clinical Trials**: Types of clinical trials that may be relevant
5. **Questions for Your Oncologist**: Important questions to ask at next appointment

CRITICAL: Emphasize that treatment decisions should always be made with their oncology team.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return handleGeminiError(error, "getTreatmentInfo");
    }
}