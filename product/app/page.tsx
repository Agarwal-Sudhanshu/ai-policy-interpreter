"use client";

import { useState } from "react";

type InterpretedPolicy = {
  loan_type: string;
  max_ltv: string;
  foir: string;
  minimum_income: string;
  age_range: string;
  eligible_occupations: string[];
  required_documents: string[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [interpretedPolicy, setInterpretedPolicy] = useState<InterpretedPolicy | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a PDF file.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");
    setExtractedText("");
    setInterpretedPolicy(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = await res.json();

      setMessage(data.message ?? "Analysis complete.");
      setExtractedText(data.extracted_text ?? "");
      setInterpretedPolicy(data.interpreted_policy ?? null);
      setStatus("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const policyFields: { key: keyof InterpretedPolicy; label: string; isList?: boolean }[] = [
    { key: "loan_type", label: "Loan type" },
    { key: "max_ltv", label: "Max LTV" },
    { key: "foir", label: "FOIR" },
    { key: "minimum_income", label: "Minimum income" },
    { key: "age_range", label: "Age range" },
    { key: "eligible_occupations", label: "Eligible occupations", isList: true },
    { key: "required_documents", label: "Required documents", isList: true },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <main className="w-full max-w-3xl flex flex-col items-center justify-center gap-8 py-12">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Credit Policy Interpreter
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Upload a credit policy PDF and extract rules using AI.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-4"
        >
          <label className="w-full">
            <span className="sr-only">Select PDF</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f ?? null);
                setStatus("idle");
                setMessage("");
                setExtractedText("");
                setInterpretedPolicy(null);
              }}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-200 file:text-zinc-800 dark:file:bg-zinc-700 dark:file:text-zinc-200 hover:file:bg-zinc-300 dark:hover:file:bg-zinc-600"
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-2.5 px-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {status === "loading" ? "Analyzing…" : "Analyze Policy"}
          </button>
        </form>

        {message && (
          <p
            role="alert"
            className={`text-sm text-center max-w-md ${
              status === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {message}
          </p>
        )}

        {extractedText && (
          <section className="w-full mt-2 space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Section 1: Extracted Policy Text
            </h2>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 max-h-80 overflow-auto text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {extractedText}
            </div>
          </section>
        )}

        {interpretedPolicy && (
          <section className="w-full mt-4 space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Section 2: AI Interpreted Credit Policy
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {policyFields.map(({ key, label, isList }) => {
                const value = interpretedPolicy[key];
                const display =
                  isList && Array.isArray(value)
                    ? value.length
                      ? value.join(", ")
                      : "—"
                    : typeof value === "string"
                      ? value || "—"
                      : "—";
                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      {label}
                    </dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-100">
                      {display}
                    </dd>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
