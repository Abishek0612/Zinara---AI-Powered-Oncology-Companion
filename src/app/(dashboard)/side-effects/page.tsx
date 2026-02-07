"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface SideEffectLog {
  id: string;
  symptom: string;
  severity: number;
  notes: string | null;
  loggedAt: string;
}

export default function SideEffectsPage() {
  const [logs, setLogs] = useState<SideEffectLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    symptom: "",
    severity: 5,
    notes: "",
  });

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/side-effects");
      const data = await res.json();
      if (res.ok) setLogs(data.logs || []);
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async () => {
    if (!form.symptom.trim()) {
      toast.error("Please enter a symptom");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/side-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        toast.error("Failed to save");
        return;
      }

      toast.success("Side effect logged!");
      setShowDialog(false);
      setForm({ symptom: "", severity: 5, notes: "" });
      fetchLogs();
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/side-effects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
        toast.success("Deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-green-100 text-green-700";
    if (severity <= 6) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return "Mild";
    if (severity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Side Effects Tracker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your treatment side effects over time
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-teal-500 text-white hover:bg-teal-600">
              <Plus className="h-4 w-4" />
              Log Side Effect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a Side Effect</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Symptom</Label>
                <Input
                  placeholder="e.g., Nausea, Fatigue, Joint pain..."
                  value={form.symptom}
                  onChange={(e) =>
                    setForm({ ...form, symptom: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>
                  Severity: {form.severity}/10 —{" "}
                  {getSeverityLabel(form.severity)}
                </Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: parseInt(e.target.value) })
                  }
                  className="mt-2 w-full accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Any additional details..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full bg-teal-500 text-white hover:bg-teal-600"
              >
                {isSaving ? "Saving..." : "Log Side Effect"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Logs */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-16 text-center">
          <Activity className="h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">
            No side effects logged yet. Start tracking to help manage your
            symptoms.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getSeverityColor(log.severity)}`}
                >
                  {log.severity}/10
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{log.symptom}</h4>
                  {log.notes && (
                    <p className="mt-1 text-sm text-gray-500">{log.notes}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(log.loggedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500"
                onClick={() => handleDelete(log.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
