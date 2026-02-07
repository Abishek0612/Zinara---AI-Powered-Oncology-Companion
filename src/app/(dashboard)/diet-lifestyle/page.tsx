"use client";

import { useState } from "react";
import { Utensils, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const COMMON_SIDE_EFFECTS = [
  "Nausea",
  "Fatigue",
  "Loss of appetite",
  "Mouth sores",
  "Constipation",
  "Diarrhea",
  "Taste changes",
  "Weight loss",
  "Weight gain",
  "Difficulty swallowing",
];

export default function DietLifestylePage() {
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleEffect = (effect: string) => {
    setSelectedEffects((prev) =>
      prev.includes(effect)
        ? prev.filter((e) => e !== effect)
        : [...prev, effect]
    );
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sideEffects: selectedEffects }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate recommendations");
        return;
      }

      setContent(data.recommendations);
    } catch {
      toast.error("Failed to generate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Diet & Lifestyle Recommendations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-generated recommendations personalized to your treatment and
          symptoms
        </p>
      </div>

      {/* Side Effects Selector */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-900">
          Select current side effects (optional)
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          This helps us personalize your recommendations
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIDE_EFFECTS.map((effect) => (
            <Badge
              key={effect}
              variant={
                selectedEffects.includes(effect) ? "default" : "outline"
              }
              className={`cursor-pointer transition ${
                selectedEffects.includes(effect)
                  ? "border-teal-500 bg-teal-500 text-white hover:bg-teal-600"
                  : "hover:border-teal-300 hover:bg-teal-50"
              }`}
              onClick={() => toggleEffect(effect)}
            >
              {effect}
            </Badge>
          ))}
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-6 gap-2 bg-teal-500 text-white hover:bg-teal-600"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Utensils className="h-4 w-4" />
          )}
          Generate Recommendations
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          These are AI-generated suggestions. Always consult your healthcare
          team or a registered dietitian before making changes to your diet.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="mt-4 text-sm text-gray-500">
            Generating personalized recommendations...
          </p>
        </div>
      ) : content ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </div>
  );
}
