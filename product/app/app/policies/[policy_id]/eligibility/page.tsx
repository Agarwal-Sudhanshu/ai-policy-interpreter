"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getGuestSessionId } from "@/lib/guestSession";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  inputClass,
} from "@/components/ui";
import {
  selectApplicableRule,
  type RuleEngineInput,
  type RuleRow,
} from "@/lib/ruleEngine";

const TENURE_MIN_MONTHS = 6;
const TENURE_MAX_MONTHS = 480;

type EligibilityResult = {
  eligible: boolean;
  reasons: { passed: string[]; failed: string[] };
  /** When FOIR was calculated */
  calculatedEmi?: number;
  existingEmiUsed?: number;
  totalEmi?: number;
  foirPct?: number;
  /** When FOIR was skipped (missing inputs or invalid income) */
  foirSkippedMessage?: string;
  /** EMI > monthly income warning (display only, does not block eligibility) */
  emiExceedsIncomeWarning?: boolean;
};

function parseNumber(value: string): number | null {
  const n = Number(String(value).replace(/[%,\s₹]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatCurrencyIndian(value: number | null): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value < 0) return "";
  return value.toLocaleString("en-IN");
}

/** Safely parse currency from "₹25,000", "25,000", "25000", etc. */
function parseCurrency(raw: string): number | null {
  const digits = String(raw).replace(/\D/g, "");
  if (digits === "") return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

const parseCurrencyInput = parseCurrency;

function handleCurrencyChange(
  raw: string,
  setter: (formatted: string) => void
): void {
  const n = parseCurrencyInput(raw);
  setter(formatCurrencyIndian(n));
}

function parsePercentage(value: string): number | null {
  const s = String(value).trim();
  const n = parseNumber(s);
  if (n !== null) return n;
  const match = s.match(/^(\d+(?:\.\d+)?)\s*%?$/);
  return match ? Number(match[1]) : null;
}

/** EMI = P × r × (1+r)^n / ((1+r)^n - 1); r = monthly rate, n = months. Returns rounded integer. */
function calculateEMI(principal: number, annualRatePercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = (annualRatePercent / 12) / 100;
  const n = months;
  if (r === 0) return Math.round(principal / n);
  const factor = Math.pow(1 + r, n);
  const emi = principal * r * factor / (factor - 1);
  return Math.round(emi);
}

function normalizeOccupation(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function evaluateEligibility(
  rules: RuleRow[],
  input: {
    income: number;
    cibil: number;
    age: number;
    occupation: string;
    propertyValue: number;
    loanAmount: number;
    existingEmi?: number;
    tenureMonths?: number;
    interestRatePercent?: number;
  }
): EligibilityResult {
  const passed: string[] = [];
  const failed: string[] = [];
  let calculatedEmi: number | undefined;
  let existingEmiUsed: number | undefined;
  let totalEmi: number | undefined;
  let foirPct: number | undefined;
  let foirSkippedMessage: string | undefined;
  let emiExceedsIncomeWarning: boolean | undefined;

  const engineInput: RuleEngineInput = {
    property_value: input.propertyValue,
    loan_amount: input.loanAmount,
    income: input.income,
    occupation: input.occupation,
    age: input.age,
  };

  const groupedByType = rules.reduce<Record<string, RuleRow[]>>((acc, r) => {
    const t = r.rule_type?.trim() || "other";
    if (!acc[t]) acc[t] = [];
    if (String(r.rule_value ?? "").trim()) acc[t].push(r);
    return acc;
  }, {});

  const minIncomeRules = groupedByType.min_income ?? [];
  if (minIncomeRules.length > 0) {
    const selected = selectApplicableRule(minIncomeRules, engineInput);
    const required = selected ? parseNumber(selected.rule_value) : null;
    const fallbackValues = minIncomeRules.map((r) => parseNumber(r.rule_value)).filter((n): n is number => n !== null);
    const requiredVal = required ?? (fallbackValues.length > 0 ? Math.max(...fallbackValues) : null);
    if (requiredVal !== null) {
      if (input.income >= requiredVal) {
        passed.push("Income above minimum requirement");
      } else {
        failed.push("Income below minimum requirement");
      }
    }
  }

  const minCibilRules = groupedByType.min_cibil ?? [];
  if (minCibilRules.length > 0) {
    const selected = selectApplicableRule(minCibilRules, engineInput);
    const required = selected ? parseNumber(selected.rule_value) : null;
    const fallbackValues = minCibilRules.map((r) => parseNumber(r.rule_value)).filter((n): n is number => n !== null);
    const requiredVal = required ?? (fallbackValues.length > 0 ? Math.max(...fallbackValues) : null);
    if (requiredVal !== null) {
      if (input.cibil >= requiredVal) {
        passed.push("CIBIL above policy threshold");
      } else {
        failed.push("CIBIL below required score");
      }
    }
  }

  const ageMinRules = groupedByType.age_min ?? [];
  const ageMaxRules = groupedByType.age_max ?? [];
  if (ageMinRules.length > 0 || ageMaxRules.length > 0) {
    const selectedMin = selectApplicableRule(ageMinRules, engineInput);
    const selectedMax = selectApplicableRule(ageMaxRules, engineInput);
    const minVal = selectedMin ? parseNumber(selectedMin.rule_value) : null;
    const maxVal = selectedMax ? parseNumber(selectedMax.rule_value) : null;
    const fallbackMins = ageMinRules.map((r) => parseNumber(r.rule_value)).filter((n): n is number => n !== null);
    const fallbackMaxs = ageMaxRules.map((r) => parseNumber(r.rule_value)).filter((n): n is number => n !== null);
    const min = minVal ?? (fallbackMins.length > 0 ? Math.min(...fallbackMins) : null);
    const max = maxVal ?? (fallbackMaxs.length > 0 ? Math.max(...fallbackMaxs) : null);
    const ageOk = (min == null || input.age >= min) && (max == null || input.age <= max);
    if (min != null || max != null) {
      if (ageOk) {
        passed.push("Age within allowed range");
      } else {
        failed.push("Age outside allowed range");
      }
    }
  }

  const occupationRules = groupedByType.eligible_occupations ?? [];
  if (occupationRules.length > 0) {
    const selected = selectApplicableRule(occupationRules, engineInput);
    const rawList = selected ? selected.rule_value : occupationRules.map((r) => r.rule_value).join(",");
    const allowedOccupations = new Set(
      rawList.split(/[,;]/).map((o) => normalizeOccupation(o.trim())).filter(Boolean)
    );
    if (allowedOccupations.size > 0) {
      const userOcc = normalizeOccupation(input.occupation);
      const match = [...allowedOccupations].some(
        (a) => userOcc === a || userOcc.includes(a) || a.includes(userOcc)
      );
      if (match) {
        passed.push("Occupation is eligible");
      } else {
        failed.push("Occupation not in eligible list");
      }
    }
  }

  const maxLtvRules = groupedByType.max_ltv ?? [];
  if (maxLtvRules.length > 0 && input.propertyValue > 0) {
    const selected = selectApplicableRule(maxLtvRules, engineInput);
    const maxAllowedPct = selected ? parsePercentage(selected.rule_value) : null;
    const fallbackPcts = maxLtvRules.map((r) => parsePercentage(r.rule_value)).filter((n): n is number => n !== null);
    const maxAllowed = maxAllowedPct ?? (fallbackPcts.length > 0 ? Math.max(...fallbackPcts) : null);
    if (maxAllowed !== null) {
      const ltvPct = (input.loanAmount / input.propertyValue) * 100;
      const ltvDisplay = Math.round(ltvPct * 10) / 10;
      const maxDisplay = Math.round(maxAllowed * 10) / 10;
      if (ltvPct <= maxAllowed) {
        passed.push(`LTV ${ltvDisplay}% within allowed limit (max ${maxDisplay}%)`);
      } else {
        failed.push(`LTV ${ltvDisplay}% exceeds allowed limit (max ${maxDisplay}%)`);
      }
    }
  } else if (maxLtvRules.length > 0 && input.propertyValue <= 0) {
    failed.push("Property value required for LTV check");
  }

  const maxFoirRules = groupedByType.max_foir ?? [];
  const FOIR_RULE_MIN = 10;
  const FOIR_RULE_MAX = 80;
  const maxFoirParsed = maxFoirRules.map((r) => parsePercentage(r.rule_value)).filter((n): n is number => n !== null);
  const maxFoirValid = maxFoirParsed.filter((n) => n >= FOIR_RULE_MIN && n <= FOIR_RULE_MAX);
  const selectedFoir = selectApplicableRule(maxFoirRules, engineInput);
  const maxFoirAllowedPct = selectedFoir ? parsePercentage(selectedFoir.rule_value) : null;
  const maxFoirAllowedSanity =
    maxFoirAllowedPct != null && maxFoirAllowedPct >= FOIR_RULE_MIN && maxFoirAllowedPct <= FOIR_RULE_MAX
      ? maxFoirAllowedPct
      : null;
  const maxFoirAllowed = maxFoirAllowedSanity ?? (maxFoirValid.length > 0 ? Math.max(...maxFoirValid) : null);
  const hasMaxFoir = maxFoirAllowed != null;

  if (hasMaxFoir) {
    if (input.income <= 0) {
      foirSkippedMessage = "Income must be greater than 0 to calculate FOIR.";
    } else {
      const missing: string[] = [];
      if (input.loanAmount <= 0) missing.push("loan amount");
      const tenure = input.tenureMonths ?? 0;
      if (!Number.isFinite(tenure) || tenure <= 0) missing.push("tenure");

      if (missing.length > 0) {
        foirSkippedMessage = "FOIR could not be calculated due to missing inputs.";
      } else {
        const rate = Number.isFinite(input.interestRatePercent) && (input.interestRatePercent ?? 0) >= 0
          ? input.interestRatePercent!
          : 9;
        calculatedEmi = calculateEMI(input.loanAmount, rate, tenure);
        const existingEmi = Number.isFinite(input.existingEmi) && (input.existingEmi ?? 0) >= 0
          ? input.existingEmi!
          : 0;
        totalEmi = existingEmi + calculatedEmi;
        foirPct = (totalEmi / input.income) * 100;
        const foirDisplay = Math.round(foirPct * 10) / 10;
        const maxDisplay = Math.round((maxFoirAllowed ?? 0) * 10) / 10;
        if (foirPct <= (maxFoirAllowed ?? 0)) {
          passed.push(`FOIR within allowed limit (${foirDisplay}% ≤ ${maxDisplay}%)`);
        } else {
          failed.push(`FOIR exceeds allowed limit (${foirDisplay}% > ${maxDisplay}%)`);
        }
        existingEmiUsed = existingEmi;
        if (input.income > 0 && calculatedEmi > input.income) {
          emiExceedsIncomeWarning = true;
        }
      }
    }
  }

  const eligible = failed.length === 0;
  return {
    eligible,
    reasons: { passed, failed },
    ...(calculatedEmi !== undefined && { calculatedEmi }),
    ...(existingEmiUsed !== undefined && { existingEmiUsed }),
    ...(totalEmi !== undefined && { totalEmi }),
    ...(foirPct !== undefined && { foirPct }),
    ...(foirSkippedMessage && { foirSkippedMessage }),
    ...(emiExceedsIncomeWarning && { emiExceedsIncomeWarning }),
  };
}

const OCCUPATIONS = ["Salaried", "Self-employed"] as const;
const CITY_TIERS = ["Tier 1", "Tier 2", "Tier 3"] as const;

export default function EligibilityPage() {
  const params = useParams();
  const policyId = typeof params?.policy_id === "string" ? params.policy_id : "";
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [income, setIncome] = useState("");
  const [cibil, setCibil] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState<string>(OCCUPATIONS[0]);
  const [propertyValue, setPropertyValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [existingEmi, setExistingEmi] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [interestRate, setInterestRate] = useState("9");
  const [cityTier, setCityTier] = useState<string>(CITY_TIERS[0]);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!policyId) {
      setLoading(false);
      setFetchError("Missing policy ID");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetch(`/api/policies/${encodeURIComponent(policyId)}/rules`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load rules");
        return res.json();
      })
      .then((data: { rules?: RuleRow[] }) => {
        if (!cancelled) setRules(Array.isArray(data?.rules) ? data.rules : []);
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : "Failed to load rules");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [policyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setGuestLimitReached(false);

    if (!user?.id) {
      const guestSessionId = getGuestSessionId();
      const trackRes = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "eligibility_checked",
          guest_session_id: guestSessionId,
        }),
      });
      const trackData = await trackRes.json().catch(() => ({}));
      if (trackRes.status === 403 && trackData.limit_reached) {
        setGuestLimitReached(true);
        return;
      }
    }

    const incomeNum = parseCurrency(income) ?? 0;
    const cibilNum = Number(cibil);
    const ageNum = Number(age);
    const propertyNum = parseCurrency(propertyValue) ?? 0;
    const loanNum = parseCurrency(loanAmount) ?? 0;
    const existingEmiNum = parseCurrency(existingEmi) ?? 0;
    const tenureNum = tenureMonths.trim() === "" ? undefined : Number(tenureMonths);
    const rateNum = interestRate.trim() === "" ? 9 : Number(interestRate);
    if (!Number.isFinite(incomeNum) || !Number.isFinite(cibilNum) || !Number.isFinite(ageNum)) {
      setResult({
        eligible: false,
        reasons: { passed: [], failed: ["Please enter valid Income, CIBIL Score, and Age."] },
      });
      return;
    }
    if (Number.isFinite(tenureNum) && (tenureNum! < TENURE_MIN_MONTHS || tenureNum! > TENURE_MAX_MONTHS)) {
      setResult({
        eligible: false,
        reasons: {
          passed: [],
          failed: ["Loan tenure must be between 6 and 480 months."],
        },
      });
      return;
    }
    const evalResult = evaluateEligibility(rules, {
      income: incomeNum,
      cibil: cibilNum,
      age: ageNum,
      occupation,
      propertyValue: propertyNum,
      loanAmount: loanNum,
      existingEmi: Number.isFinite(existingEmiNum) ? existingEmiNum : undefined,
      tenureMonths: Number.isFinite(tenureNum) && (tenureNum ?? 0) >= TENURE_MIN_MONTHS && (tenureNum ?? 0) <= TENURE_MAX_MONTHS ? tenureNum : undefined,
      interestRatePercent: Number.isFinite(rateNum) && rateNum >= 0 ? rateNum : 9,
    });
    setResult(evalResult);
    if (user?.id) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "eligibility_checked" }),
      }).catch(() => {});
    }
  }

  return (
    <PageContainer spacing={6}>
      <PageHeader
        title="Check loan eligibility"
        back={
          policyId
            ? { href: `/app/policies/${policyId}`, label: "← Back to Policy" }
            : { href: "/app/policies", label: "← Back to Policies" }
        }
      />

      {loading && (
        <p className="text-sm text-gray-500">Loading policy rules…</p>
      )}

      {fetchError && (
        <p className="text-sm text-red-600" role="alert">
          {fetchError}
        </p>
      )}

      {guestLimitReached && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Create free account to continue</p>
          <p className="mt-1">
            You've used your 3 free eligibility checks.{" "}
            <a href="/signup" className="font-medium underline hover:no-underline">
              Sign up
            </a>{" "}
            for unlimited checks.
          </p>
        </div>
      )}

      {!loading && !fetchError && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Applicant details">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="income" className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Income
                </label>
                <input
                  id="income"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. ₹60,000"
                  value={income ? `₹${income}` : ""}
                  onChange={(e) => handleCurrencyChange(e.target.value, setIncome)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cibil" className="mb-1 block text-sm font-medium text-gray-700">
                  CIBIL Score
                </label>
                <input
                  id="cibil"
                  type="number"
                  min={300}
                  max={900}
                  placeholder="e.g. 750"
                  value={cibil}
                  onChange={(e) => setCibil(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
                  Borrower Age
                </label>
                <input
                  id="age"
                  type="number"
                  min={18}
                  max={120}
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="occupation" className="mb-1 block text-sm font-medium text-gray-700">
                  Employment Type
                </label>
                <select
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className={inputClass}
                >
                  {OCCUPATIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="propertyValue" className="mb-1 block text-sm font-medium text-gray-700">
                  Property Value
                </label>
                <input
                  id="propertyValue"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. ₹45,00,000"
                  value={propertyValue ? `₹${propertyValue}` : ""}
                  onChange={(e) => handleCurrencyChange(e.target.value, setPropertyValue)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="loanAmount" className="mb-1 block text-sm font-medium text-gray-700">
                  Loan Amount
                </label>
                <input
                  id="loanAmount"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. ₹40,00,000"
                  value={loanAmount ? `₹${loanAmount}` : ""}
                  onChange={(e) => handleCurrencyChange(e.target.value, setLoanAmount)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="existingEmi" className="mb-1 block text-sm font-medium text-gray-700">
                  Existing Monthly EMI
                </label>
                <input
                  id="existingEmi"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. ₹10,000"
                  value={existingEmi ? `₹${existingEmi}` : ""}
                  onChange={(e) => handleCurrencyChange(e.target.value, setExistingEmi)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="tenureMonths" className="mb-1 block text-sm font-medium text-gray-700">
                  Loan Tenure (months)
                </label>
                <input
                  id="tenureMonths"
                  type="number"
                  min={TENURE_MIN_MONTHS}
                  max={TENURE_MAX_MONTHS}
                  placeholder="e.g. 240"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="interestRate" className="mb-1 block text-sm font-medium text-gray-700">
                  Interest Rate (%) <span className="text-gray-500 font-normal">optional</span>
                </label>
                <input
                  id="interestRate"
                  type="text"
                  inputMode="decimal"
                  placeholder="9"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cityTier" className="mb-1 block text-sm font-medium text-gray-700">
                  City Tier
                </label>
                <select
                  id="cityTier"
                  value={cityTier}
                  onChange={(e) => setCityTier(e.target.value)}
                  className={inputClass}
                >
                  {CITY_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {(() => {
                const loan = parseCurrency(loanAmount);
                const tenure = tenureMonths.trim() === "" ? null : Number(tenureMonths);
                const rate = interestRate.trim() === "" ? 9 : Number(interestRate);
                const hasLoan = loan != null && loan > 0;
                const hasTenure = tenure != null && Number.isFinite(tenure) && tenure > 0;
                const hasRate = Number.isFinite(rate) && rate >= 0;
                const showPreview = hasLoan && hasTenure && hasRate;
                const estimatedEmi = showPreview ? calculateEMI(loan!, rate, tenure!) : 0;
                return showPreview ? (
                  <p className="text-sm text-gray-600">
                    Estimated EMI: ₹{formatCurrencyIndian(estimatedEmi)}
                  </p>
                ) : null;
              })()}
              <Button type="submit" className="w-full">
                Check Eligibility
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            {result && (
              <Card
                title={result.eligible ? "Eligible" : "Not Eligible"}
                className={result.eligible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50/50"}
              >
                <div role="status" className="space-y-4">
                  {(result.calculatedEmi !== undefined || result.foirPct !== undefined) && (
                    <div className="space-y-1 text-sm text-gray-700">
                      {result.existingEmiUsed !== undefined && (
                        <p>Existing EMI: ₹{formatCurrencyIndian(result.existingEmiUsed)}</p>
                      )}
                      {result.calculatedEmi !== undefined && (
                        <p>New EMI: ₹{formatCurrencyIndian(result.calculatedEmi)}</p>
                      )}
                      {result.totalEmi !== undefined && (
                        <p>Total EMI: ₹{formatCurrencyIndian(result.totalEmi)}</p>
                      )}
                      {result.foirPct !== undefined && (
                        <p>FOIR: {Number(result.foirPct).toFixed(1)}%</p>
                      )}
                    </div>
                  )}
                  {result.emiExceedsIncomeWarning && (
                    <p className="text-sm text-amber-800">
                      Loan EMI exceeds monthly income. This loan may not be serviceable.
                    </p>
                  )}
                  {result.foirSkippedMessage && (
                    <p className="text-sm text-amber-800">{result.foirSkippedMessage}</p>
                  )}
                  <ul className="space-y-2 text-sm">
                    {result.reasons.passed.map((r) => (
                      <li key={r} className="text-[#10B981]">✓ {r}</li>
                    ))}
                    {result.reasons.failed.map((r) => (
                      <li key={r} className="text-red-700">✗ {r}</li>
                    ))}
                  </ul>
                  {result.reasons.passed.length === 0 && result.reasons.failed.length === 0 && (
                    <p className="text-sm text-gray-600">No policy rules available to evaluate.</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
