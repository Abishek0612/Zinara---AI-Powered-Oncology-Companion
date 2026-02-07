"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Stethoscope, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// Lazy load ReactMarkdown
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <span className="animate-pulse block h-4 w-full bg-gray-200 rounded"></span>,
});

interface TreatmentViewProps {
  initialContent: string | null;
  initialError?: string | null;
}

export function TreatmentView({ initialContent, initialError }: TreatmentViewProps) {
  const [content, setContent] = useState<string | null>(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const fetchTreatment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/treatment");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load treatment information");
        return;
      }
      setContent(data.treatmentInfo);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialContent && !error && !isLoading) {
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treatment Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered treatment options personalized to your diagnosis
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchTreatment}
          disabled={isLoading}
          className="gap-2"
          aria-label="Refresh treatment plan"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          This information is AI-generated for educational purposes only. Always
          discuss treatment decisions with your oncology team before making any
          changes to your care plan.
        </p>
      </div>

      {/* Content */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="mt-4 text-sm text-gray-500">
              Analyzing your profile and generating personalized treatment
              information...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Stethoscope className="h-10 w-10 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">{error}</p>
            <Button onClick={fetchTreatment} className="mt-4 bg-teal-500 hover:bg-teal-600">
              Try Again
            </Button>
          </div>
        ) : content ? (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
             <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-gray-500">No treatment information available.</p>
             </div>
        )}
      </div>
    </div>
  );
}
