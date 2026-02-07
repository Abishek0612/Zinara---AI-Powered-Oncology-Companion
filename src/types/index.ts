import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            patientId: string;
            onboardingDone: boolean;
            role: string;
        } & DefaultSession["user"];
    }
}




export interface OnboardingOption {
    value: string;
    label: string;
    hasPopup?: boolean;
    popupType?: "text" | "info";
    popupMessage?: string;
    popupFields?: string[];
    dynamicSubject?: boolean;
    dynamicLabel?: boolean;
}

export interface OnboardingQuestionData {
    id: string;
    stepNumber: number;
    questionText: string;
    questionType: string;
    options: OnboardingOption[];
    dependsOn: {
        questionStep?: number;
        transformSubject?: boolean;
        transformLabel?: boolean;
    } | null;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

export interface PatientProfile {
    id: string;
    patientId: string;
    name: string;
    email: string;
    cancerType?: string;
    cancerStage?: string;
    currentTreatment?: string;
    accessingFor: string;
    interests: string[];
    createdAt: string;
}