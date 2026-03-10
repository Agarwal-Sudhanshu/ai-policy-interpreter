"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type RuleRow = { rule_type: string; rule_value: string };

const RULE_LABELS: Record<string, string> = {
  loan_type: "Loan Type",
  max_ltv: "Maximum LTV",
  max_foir: "Maximum FOIR",
  min_income: "Minimum Income",
  min_cibil: "Minimum CIBIL",
  age_min: "Age Min",
  age_max: "Age Max",
  eligible_occupations: "Eligible Occupations",
};

const CURRENCY_RULE_TYPES = new Set<string>([
  "min_income",
]);

function getLabel(type: string): string {
  return RULE_LABELS[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRuleValue(ruleType: string, value: string): string {
  if (!CURRENCY_RULE_TYPES.has(ruleType)) return value;
  const num = Number(String(value).replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(num)) return value;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function PolicySummaryPage() {
  const params = useParams();
  const policyId = typeof params?.policy_id === "string" ? params.policy_id : "";
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!policyId) {
      setLoading(false);
      setError("Missing policy ID");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/policies/${encodeURIComponent(policyId)}/rules`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load rules");
        return res.json();
      })
      .then((data: { rules?: RuleRow[] }) => {
        if (!cancelled) setRules(Array.isArray(data?.rules) ? data.rules : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load rules");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [policyId]);

  const grouped = rules.reduce<Record<string, string[]>>((acc, r) => {
    const t = r.rule_type?.trim() || "other";
    if (!acc[t]) acc[t] = [];
    const v = String(r.rule_value ?? "").trim();
    if (v && !acc[t].includes(v)) acc[t].push(v);
    return acc;
  }, {});

  const ageMin = grouped.age_min ?? [];
  const ageMax = grouped.age_max ?? [];
  const hasAgeRange = ageMin.length > 0 || ageMax.length > 0;
  const ageRangeValues: string[] = [];
  if (hasAgeRange) {
    const seen = new Set<string>();
    const maxLen = Math.max(ageMin.length, ageMax.length);
    for (let i = 0; i < maxLen; i++) {
      const min = ageMin[i] ?? ageMin[0];
      const max = ageMax[i] ?? ageMax[0];
      let s: string;
      if (min && max && min !== max) s = `${min}–${max}`;
      else if (min) s = min;
      else if (max) s = max;
      else continue;
      if (!seen.has(s)) {
        seen.add(s);
        ageRangeValues.push(s);
      }
    }
  }

  const displayEntries: { label: string; values: string[]; ruleType: string }[] = [];
  const skipTypes = new Set(["age_min", "age_max"]);
  if (hasAgeRange && ageRangeValues.length > 0) {
    displayEntries.push({ label: "Age Range", values: ageRangeValues, ruleType: "age_range" });
  }
  Object.entries(grouped).forEach(([type, values]) => {
    if (skipTypes.has(type)) return;
    if (values.length === 0) return;
    displayEntries.push({ label: getLabel(type), values, ruleType: type });
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Policy rules summary
          </h1>
          <Link
            href="/app/policies"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to policies
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading rules…</p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && rules.length === 0 && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              No rules found for this policy. Extract rules from a processed document first.
            </p>
          </div>
        )}

        {!loading && !error && displayEntries.length > 0 && (
          <div className="space-y-4">
            {displayEntries.map(({ label, values, ruleType }) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm"
              >
                <h2 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {label}
                </h2>
                <p className="text-zinc-900 dark:text-zinc-50">
                  {values.map((v) => formatRuleValue(ruleType, v)).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
