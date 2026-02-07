"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Upload, Loader2, Eye, Brain, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Report {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  analysisStatus: string;
  aiAnalysis: { raw: string; analyzedAt: string } | null;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [uploadForm, setUploadForm] = useState({ fileName: "", content: "" });
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok) setReports(data.reports || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpload = async () => {
    if (!uploadForm.fileName.trim() || !uploadForm.content.trim()) {
      toast.error("Please provide both a name and report content");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadForm.fileName,
          content: uploadForm.content,
          fileType: "text",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to upload report");
        return;
      }

      toast.success("Report uploaded successfully!");
      setShowUploadDialog(false);
      setUploadForm({ fileName: "", content: "" });
      fetchReports();
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async (report: Report) => {
    setAnalyzingId(report.id);
    try {
      const res = await fetch(`/api/reports/${report.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText: report.fileUrl }),
      });

      if (!res.ok) {
        toast.error("Analysis failed. Please try again.");
        return;
      }

      toast.success("Report analyzed successfully!");
      fetchReports();
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Report deleted");
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analysis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload medical reports for AI-powered analysis
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-teal-500 text-white hover:bg-teal-600">
              <Upload className="h-4 w-4" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report Name</Label>
                <Input
                  placeholder="e.g., Blood Work Results - Jan 2025"
                  value={uploadForm.fileName}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, fileName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Report Content</Label>
                <Textarea
                  placeholder="Paste your report text here, or type key findings and values..."
                  value={uploadForm.content}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, content: e.target.value })
                  }
                  rows={8}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-teal-500 text-white hover:bg-teal-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Report"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-16 text-center">
          <FileText className="h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">
            No reports uploaded yet. Upload your first medical report for
            AI-powered analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-50 p-2.5">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {report.fileName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Uploaded {formatDate(report.createdAt)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      report.analysisStatus === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : report.analysisStatus === "ANALYZING"
                          ? "bg-blue-100 text-blue-700"
                          : report.analysisStatus === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {report.analysisStatus === "COMPLETED"
                      ? "Analyzed"
                      : report.analysisStatus === "ANALYZING"
                        ? "Analyzing..."
                        : report.analysisStatus === "FAILED"
                          ? "Failed"
                          : "Pending"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.analysisStatus === "COMPLETED" && report.aiAnalysis ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setViewingReport(report)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Analysis
                  </Button>
                ) : report.analysisStatus !== "ANALYZING" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleAnalyze(report)}
                    disabled={analyzingId === report.id}
                  >
                    {analyzingId === report.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Brain className="h-3.5 w-3.5" />
                    )}
                    Analyze
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(report.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Viewer Dialog */}
      <Dialog
        open={!!viewingReport}
        onOpenChange={() => setViewingReport(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingReport?.fileName} — AI Analysis</DialogTitle>
          </DialogHeader>
          {viewingReport?.aiAnalysis && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{viewingReport.aiAnalysis.raw}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
