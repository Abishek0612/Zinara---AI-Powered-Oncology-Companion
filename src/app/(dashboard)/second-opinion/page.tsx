"use client";

import { useState } from "react";
import { ClipboardCheck, Loader2, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

export default function SecondOpinionPage() {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast.error("Please describe your situation");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/second-opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate analysis");
        return;
      }

      setContent(data.analysis);
    } catch {
      toast.error("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          AI Second Opinion
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Get an AI-powered analysis of your diagnosis or treatment plan
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          This is an AI-generated analysis and should not replace professional
          medical advice. Always consult with qualified oncologists for a
          clinical second opinion.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <Label className="text-base font-semibold text-gray-900">
          Describe your situation
        </Label>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          Include your diagnosis, current treatment plan, and any specific
          questions or concerns you have.
        </p>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., I was diagnosed with Stage II breast cancer. My oncologist recommended chemotherapy followed by radiation. I'm wondering about alternative treatment sequences or newer therapies that might be available..."
          rows={6}
          className="border-gray-300"
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !query.trim()}
          className="mt-4 gap-2 bg-teal-500 text-white hover:bg-teal-600"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Get AI Analysis
        </Button>
      </div>

      {/* Result */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="mt-4 text-sm text-gray-500">
            Analyzing your case and reviewing latest medical literature...
          </p>
        </div>
      ) : content ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">AI Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </div>
  );
}
