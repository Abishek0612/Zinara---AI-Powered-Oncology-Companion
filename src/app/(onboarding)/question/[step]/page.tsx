"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuestionOption {
  value: string;
  label: string;
  hasPopup?: boolean;
  popupType?: string;
  popupMessage?: string;
  popupFields?: string[];
  dynamicSubject?: boolean;
}

interface QuestionData {
  id: string;
  stepNumber: number;
  questionText: string;
  options: QuestionOption[];
  dependsOn: { questionStep?: number; transformSubject?: boolean } | null;
}

export default function OnboardingQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, update } = useSession();
  const step = parseInt(params.step as string);

  useEffect(() => {
    if (session?.user?.onboardingDone) {
      router.replace("/");
    }
  }, [session, router]);

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupOption, setPopupOption] = useState<QuestionOption | null>(null);
  const [previousAnswers, setPreviousAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchQuestion = useCallback(async () => {
    try {
      // Fetch question definition
      const qRes = await fetch(`/api/onboarding/questions?step=${step}`);
      const qData = await qRes.json();
      setQuestion(qData.question);

      // Fetch existing responses
      const rRes = await fetch("/api/onboarding/responses");
      const rData = await rRes.json();

      const prevAnswers: Record<number, string> = {};
      rData.responses?.forEach(
        (r: { stepNumber: number; answer: string }) => {
          prevAnswers[r.stepNumber] = r.answer;
        }
      );
      setPreviousAnswers(prevAnswers);

      // If this step was already answered, pre-fill
      const existing = rData.responses?.find(
        (r: { stepNumber: number }) => r.stepNumber === step
      );
      if (existing) {
        setSelectedAnswer(existing.answer);
        if (existing.metadata) setMetadata(existing.metadata);
      }
    } catch {
      toast.error("Failed to load question");
    } finally {
      setIsLoading(false);
    }
  }, [step]);

  useEffect(() => {
    if (step < 1 || step > 3) {
      router.push("/question/1");
      return;
    }
    fetchQuestion();
  }, [step, router, fetchQuestion]);

  // Track IP address on first load 
  useEffect(() => {
    fetch("/api/auth/track-ip", { method: "POST" }).catch(() => {});
  }, []);

const transformLabel = (label: string): string => {
  const accessingFor = previousAnswers[1];
  if (accessingFor === "myself") {
    return label
      .replace(/{subject}/g, "I")
      .replace(/{possessive}/g, "my")
      .replace(/{verb}/g, "have");
  }
  return label
    .replace(/{subject}/g, "My loved one")
    .replace(/{possessive}/g, "their")
    .replace(/{verb}/g, "has");
};

  const handleOptionSelect = (value: string) => {
    setSelectedAnswer(value);
    const option = question?.options.find((o) => o.value === value);

    if (option?.hasPopup) {
      setPopupOption(option);
      setShowPopup(true);
    }
  };

  const handleNext = async () => {
    if (!selectedAnswer || !question) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/onboarding/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          stepNumber: step,
          answer: selectedAnswer,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save response");
        return;
      }

      if (step < 3) {
        router.push(`/question/${step + 1}`);
      } else {
        await update({ onboardingDone: true });
        router.push("/");
        toast.success("Welcome to Zinara! Your profile is set up.");
      }
    } catch {
      toast.error("Failed to save response");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!question) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-400">
            <span>Question {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-gray-700/50 bg-gray-800/80 p-6 shadow-2xl backdrop-blur md:p-10">
          <div className="mb-2 inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
            Just 3 questions to help us personalize Zinara for you
          </div>

         <h2 className="mb-8 mt-4 text-xl font-semibold text-white md:text-2xl">
  {transformLabel(question.questionText)}
</h2>

          <Select value={selectedAnswer} onValueChange={handleOptionSelect}>
            <SelectTrigger className="w-full border-gray-600 bg-gray-700/50 text-white">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent className="border-gray-600 bg-gray-800 text-white">
              {question.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="focus:bg-teal-500/20 focus:text-white"
                >
                  {option.dynamicSubject
                    ? transformLabel(option.label)
                    : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Video section */}
          <div className="mt-8 rounded-xl bg-gray-700/30 p-4">
            <p className="mb-2 text-xs font-medium text-teal-400">
              🎥 Watch Live
            </p>
            <p className="text-sm text-gray-400">
              How Zinara can personalize your care
            </p>
            <div className="mt-3 aspect-video rounded-lg bg-gray-700/50 flex items-center justify-center">
              <span className="text-4xl">▶️</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(`/question/${step - 1}`)}
              disabled={step === 1}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer || isSaving}
              className="bg-teal-500 px-8 text-white hover:bg-teal-600"
            >
              {isSaving ? "Saving..." : step === 3 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>

        {/* Popup Dialog */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="border-gray-700 bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>
                {popupOption?.popupType === "info"
                  ? "Information"
                  : "Tell us more"}
              </DialogTitle>
            </DialogHeader>

            {popupOption?.popupType === "info" ? (
              <div className="rounded-lg bg-amber-500/10 p-4 text-sm text-amber-300">
                {popupOption.popupMessage}
              </div>
            ) : popupOption?.popupType === "text" ? (
              <div>
                <Label className="text-gray-300">Please describe</Label>
                <Input
                  className="mt-2 border-gray-600 bg-gray-700/50 text-white"
                  placeholder="Type your answer..."
                  value={metadata.description || ""}
                  onChange={(e) =>
                    setMetadata({ ...metadata, description: e.target.value })
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                {popupOption?.popupFields?.map((field) => (
                  <div key={field}>
                    <Label className="text-gray-300 capitalize">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      className="mt-1 border-gray-600 bg-gray-700/50 text-white"
                      placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                      value={metadata[field] || ""}
                      onChange={(e) =>
                        setMetadata({ ...metadata, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => setShowPopup(false)}
              className="mt-4 w-full bg-teal-500 text-white hover:bg-teal-600"
            >
              Continue
            </Button>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
