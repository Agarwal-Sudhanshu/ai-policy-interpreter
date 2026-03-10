import Link from "next/link";
import { Calculator } from "lucide-react";
import { Card } from "@/components/ui";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";

export const metadata = {
  title: "Loan Eligibility Calculator | AI Credit Policy Copilot",
  description:
    "Check loan eligibility using income, CIBIL score, property value, loan amount, and FOIR. Understand how LTV and policy rules drive eligibility reasoning for home loans and LAP.",
};

export default function EligibilityCalculatorPage() {
  return (
    <>
      <MarketingPageHero
        title="Loan Eligibility Calculator"
        subtitle="Use income, property value, loan amount, existing EMI, and occupation to see how eligibility works. FOIR and LTV from your policy drive the result."
        decorationIcon={Calculator}
      />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
          <Card title="Your inputs">
            <p className="mb-4 text-sm text-slate-600">
              Eligibility reasoning uses your monthly income, property value
              (for LTV), loan amount, existing EMI (for FOIR), and occupation.
              Enter your details to see an example result.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><strong className="text-slate-900">Income</strong> — Monthly income</li>
              <li><strong className="text-slate-900">CIBIL</strong> — Credit score</li>
              <li><strong className="text-slate-900">Property Value</strong> — For LTV</li>
              <li><strong className="text-slate-900">Loan Amount</strong> — Required loan</li>
              <li><strong className="text-slate-900">Existing EMI</strong> — Current obligations</li>
              <li><strong className="text-slate-900">Occupation</strong> — Salaried / Self-employed</li>
            </ul>
            <p className="mt-6 text-sm text-slate-600">
              The full calculator with policy rules runs inside the app. Sign up
              to check eligibility against real credit policies.
            </p>
          </Card>

          <Card title="Example output">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Eligibility result</p>
                <p className="font-semibold text-green-600">Eligible</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">FOIR calculation</p>
                <p className="text-slate-900">38% (within policy limit)</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Maximum loan possible</p>
                <p className="text-slate-900">₹42,00,000 (based on income & FOIR)</p>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                <li>✓ LTV within limit</li>
                <li>✓ FOIR within threshold</li>
                <li>✓ Income above minimum</li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try AI Copilot
            </Link>
          </Card>
          </div>
        </div>
      </section>
    </>
  );
}
