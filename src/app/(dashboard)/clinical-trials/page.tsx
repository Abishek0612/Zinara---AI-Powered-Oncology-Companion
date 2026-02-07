"use client";

import { useState } from "react";
import { FlaskConical, Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface Trial {
  id: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  description: string;
  url: string;
  location: string;
  lastUpdated: string;
}

export default function ClinicalTrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    status: "recruiting",
    phase: "",
  });

  const handleSearch = async () => {
    if (!filters.query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({
        query: filters.query,
        status: filters.status,
        ...(filters.phase && { phase: filters.phase }),
      });

      const res = await fetch(`/api/clinical-trials?${params}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to search clinical trials");
        return;
      }

      setTrials(data.trials || []);
    } catch {
      toast.error("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Trials</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find clinical trials that may be relevant to your diagnosis
        </p>
      </div>

      {/* Search Filters */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by cancer type, drug, or keyword..."
              value={filters.query}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-gray-300"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(val) => setFilters({ ...filters, status: val })}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="not_yet_recruiting">Not Yet Recruiting</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="gap-2 bg-teal-500 text-white hover:bg-teal-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="mt-4 text-sm text-gray-500">
            Searching clinical trials databases...
          </p>
        </div>
      ) : trials.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Found {trials.length} trial{trials.length !== 1 ? "s" : ""}
          </p>
          {trials.map((trial) => (
            <div
              key={trial.id}
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        trial.status === "Recruiting"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {trial.status}
                    </span>
                    {trial.phase && (
                      <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {trial.phase}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{trial.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {trial.description}
                  </p>
                  {trial.conditions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {trial.conditions.map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {trial.location && (
                    <p className="mt-2 text-xs text-gray-400">
                      📍 {trial.location}
                    </p>
                  )}
                </div>
                {trial.url && (
                  <a
                    href={trial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-16 text-center">
          <FlaskConical className="h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">
            No clinical trials found matching your search. Try different
            keywords or filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-16 text-center">
          <FlaskConical className="h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">
            Search for clinical trials by cancer type, drug name, or other
            keywords.
          </p>
        </div>
      )}
    </div>
  );
}
