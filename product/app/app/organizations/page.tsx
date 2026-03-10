"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type Organization = {
  id: string;
  name: string;
  type: string | null;
  created_at: string;
};

const ORG_TYPES = ["Bank", "NBFC", "Fintech"] as const;

export default function OrganizationsPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(ORG_TYPES[0]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSubmitError("Name is required");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, type: type || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      setName("");
      setType(ORG_TYPES[0]);
      await fetchOrganizations();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add organization");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Organizations
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
        </div>

        <section className="mb-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Add Organization
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="org-name"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Name
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                disabled={submitLoading}
              />
            </div>
            <div>
              <label
                htmlFor="org-type"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Type
              </label>
              <select
                id="org-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                disabled={submitLoading}
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {submitError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 py-2.5 px-4 font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {submitLoading ? "Adding…" : "Add Organization"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Organizations
          </h2>
          {loading ? (
            <p className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading…
            </p>
          ) : error ? (
            <p
              className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 text-center text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : organizations.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No organizations yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {organizations.map((org) => (
                <li
                  key={org.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {org.name}
                  </span>
                  {org.type && (
                    <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                      ({org.type})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
