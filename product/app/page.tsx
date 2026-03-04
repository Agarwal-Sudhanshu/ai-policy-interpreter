"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a PDF file.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
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
      const data = await res.json().catch(() => ({}));
      setMessage(data.message ?? "Analysis complete.");
      setStatus("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <main className="w-full max-w-md flex flex-col items-center justify-center gap-8 py-12">
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
      </main>
    </div>
  );
}
