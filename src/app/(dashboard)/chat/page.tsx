"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

// Lazy load ReactMarkdown to reduce initial bundle size
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <span className="animate-pulse block h-4 w-full bg-gray-200 rounded"></span>,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to get response");
        return;
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast.error("Failed to connect to AI assistant");
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-teal-100 p-2">
            <Bot className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Zinara AI Assistant</h2>
            <p className="text-xs text-gray-500">
              Physician-informed • Personalized to your profile
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-teal-50 p-4">
              <Bot className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              How can I help you today?
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Ask me about treatment options, side effects, diet recommendations,
              clinical trials, or anything related to your care.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "What are my treatment options?",
                "Tell me about clinical trials",
                "Side effects of chemotherapy",
                "Diet recommendations",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-full border px-4 py-2 text-xs text-gray-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-6 flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 self-start rounded-full bg-teal-100 p-1.5">
                <Bot className="h-4 w-4 text-teal-700" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[70%] ${
                msg.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 self-start rounded-full bg-gray-200 p-1.5">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="mb-6 flex gap-3">
            <div className="mt-1 rounded-full bg-teal-100 p-1.5">
              <Bot className="h-4 w-4 text-teal-700" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your treatment, side effects, diet..."
            aria-label="Chat input"
            rows={1}
            className="max-h-32 min-h-[44px] resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-teal-500 px-4 text-white hover:bg-teal-600"
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          Zinara AI provides information only. Always consult your healthcare
          team for medical decisions.
        </p>
      </div>
    </div>
  );
}
