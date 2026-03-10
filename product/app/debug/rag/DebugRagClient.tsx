"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";

type PolicyOption = { id: string; name: string };

type VectorRow = {
  chunk_text: string;
  document_id: string | null;
  chunk_index: number | null;
  similarity_score: number | null;
};

type KeywordRow = {
  chunk_text: string;
  document_id: string | null;
  chunk_index: number | null;
};

type MergedItem = {
  chunk_text: string;
  source: "vector" | "keyword";
  similarity_score: number | null;
  chunk_index: number | null;
};

type DebugResult = {
  question: string;
  vector_results: VectorRow[];
  keyword_results: KeywordRow[];
  merged_results: MergedItem[];
  top_chunks: MergedItem[];
  error?: string;
};

function ChunkTable({
  rows,
  showSource = false,
  showSimilarity = true,
}: {
  rows: (VectorRow | KeywordRow | MergedItem)[];
  showSource?: boolean;
  showSimilarity?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No chunks.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">chunk_index</th>
            {showSimilarity && (
              <th className="px-3 py-2 text-left font-medium text-gray-700">similarity score</th>
            )}
            {showSource && (
              <th className="px-3 py-2 text-left font-medium text-gray-700">source</th>
            )}
            <th className="px-3 py-2 text-left font-medium text-gray-700">chunk_text</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="px-3 py-2 text-gray-600">
                {"chunk_index" in r ? r.chunk_index ?? "—" : "—"}
              </td>
              {showSimilarity && (
                <td className="px-3 py-2 text-gray-600">
                  {"similarity_score" in r && r.similarity_score != null
                    ? r.similarity_score.toFixed(4)
                    : "—"}
                </td>
              )}
              {showSource && (
                <td className="px-3 py-2">
                  {"source" in r ? (
                    <span className={r.source === "vector" ? "text-blue-600" : "text-amber-600"}>
                      {r.source}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              )}
              <td className="px-3 py-2 text-gray-800 max-w-md truncate" title={r.chunk_text ?? ""}>
                {(r.chunk_text ?? "").slice(0, 200)}
                {((r.chunk_text ?? "").length > 200) ? "…" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DebugRagClient() {
  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const [policyId, setPolicyId] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/policies/all")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id?: string; name?: string }[]) => {
        setPolicies(
          (Array.isArray(data) ? data : []).map((p) => ({
            id: p.id ?? "",
            name: p.name ?? p.id ?? "",
          }))
        );
        if (data?.length && !policyId) {
          setPolicyId((data[0] as { id?: string }).id ?? "");
        }
      })
      .catch(() => setPolicies([]));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    fetch("/api/debug/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy_id: policyId, question }),
    })
      .then((res) => res.json())
      .then((data: DebugResult & { error?: string }) => {
        if (data.error && !data.vector_results) {
          setError(data.error);
        } else {
          setResult(data);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-6">
      <Card title="Run RAG Debug">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
          <div>
            <label htmlFor="debug-policy" className="mb-1 block text-sm font-medium text-gray-700">
              Policy
            </label>
            <select
              id="debug-policy"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Select policy</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="debug-question" className="mb-1 block text-sm font-medium text-gray-700">
              Question
            </label>
            <input
              id="debug-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the max LTV?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <Button type="submit" disabled={loading || !policyId.trim() || !question.trim()}>
            {loading ? "Running…" : "Run RAG Debug"}
          </Button>
        </form>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <Card title="Vector Results" padding={false}>
            <div className="p-4">
              <ChunkTable rows={result.vector_results} showSimilarity />
            </div>
          </Card>
          <Card title="Keyword Results" padding={false}>
            <div className="p-4">
              <ChunkTable rows={result.keyword_results} showSimilarity={false} />
            </div>
          </Card>
          <Card title="Merged Results" padding={false}>
            <div className="p-4">
              <ChunkTable
                rows={result.merged_results}
                showSource
                showSimilarity
              />
            </div>
          </Card>
          <Card title="Top Chunks Used for LLM" padding={false}>
            <div className="p-4">
              <ChunkTable
                rows={result.top_chunks}
                showSource
                showSimilarity
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
