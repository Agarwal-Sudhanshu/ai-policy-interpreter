import Link from "next/link";
import {
  PolicyHero,
  PolicyCTA,
  PolicyCard,
} from "@/components/policies";
import {
  LOAN_PRODUCT_CATEGORIES,
  POLICY_TOPICS,
  POLICY_IDS,
  getPolicyIdBySlug,
} from "@/lib/policyMap";
import { Sparkles } from "lucide-react";

const POPULAR_SCENARIOS = [
  {
    title: "Home loan eligibility for ₹50k salary",
    policySlug: "housing-loan",
    description: "Check if a ₹50,000 monthly income meets typical home loan criteria.",
  },
  {
    title: "Loan against property eligibility",
    policySlug: "loan-against-property",
    description: "LAP eligibility based on property value and income.",
  },
  {
    title: "Business loan eligibility rules",
    policySlug: "business-loan",
    description: "Understand turnover and documentation requirements.",
  },
  {
    title: "Minimum salary for home loan",
    policySlug: "housing-loan",
    description: "Typical minimum income and FOIR limits for home loans.",
  },
];

const FEATURED_GUIDES = [
  { title: "Housing Loan Credit Policy Guide", slug: "housing-loan" },
  { title: "Loan Against Property Eligibility Guide", slug: "loan-against-property" },
  { title: "Personal Loan Credit Policy", slug: "personal-loan" },
  { title: "Business Loan Underwriting Rules", slug: "business-loan" },
];

export const metadata = {
  title: "Loan Credit Policies & Eligibility Rules | AI Credit Policy Copilot",
  description:
    "Explore lending policy rules used by banks and NBFCs: LTV limits, FOIR thresholds, CIBIL requirements and income eligibility. Check loan eligibility with AI.",
};

export default function PoliciesLandingPage() {
  return (
    <>
      {/* Section 1 — Hero (dark) */}
      <PolicyHero
        title="Loan Credit Policies & Eligibility Rules"
        subtitle="Explore lending policy rules used by banks and NBFCs including LTV limits, FOIR thresholds, credit score requirements and income eligibility."
        primaryButton={{ label: "Explore Policies", href: "#loan-policy-categories" }}
        secondaryButton={{ label: "Try AI Copilot", href: "/signup" }}
      />

      {/* Section 2 — Loan Policy Categories (slate) */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 id="loan-policy-categories" className="text-3xl font-bold text-slate-900">
            Loan Policy Categories
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Browse credit policy guides by loan product.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LOAN_PRODUCT_CATEGORIES.map((cat) => (
              <PolicyCard
                key={cat.slug}
                title={cat.title}
                description={cat.description}
                href={`/policies/${cat.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Common Credit Policy Topics (white) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Common Credit Policy Topics
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Key concepts and rules used in lending decisions.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {POLICY_TOPICS.map((topic) => (
              <PolicyCard
                key={topic.slug}
                title={topic.title}
                description={topic.description}
                href={`/policies/${topic.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Popular Eligibility Scenarios (slate) */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Popular Eligibility Scenarios
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Example borrower scenarios you can evaluate with the AI copilot.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {POPULAR_SCENARIOS.map((scenario) => {
              const policyId = getPolicyIdBySlug(scenario.policySlug) ?? POLICY_IDS.housingLoan;
              const eligibilityHref = `/app/policies/${policyId}/eligibility`;
              return (
                <div
                  key={scenario.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {scenario.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{scenario.description}</p>
                  <div className="mt-4">
                    <Link
                      href={eligibilityHref}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Sparkles className="h-4 w-4" />
                      Check with AI
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5 — Featured Policy Guides (white) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Featured Policy Guides
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            In-depth guides on eligibility and underwriting rules.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {FEATURED_GUIDES.map((guide) => (
              <PolicyCard
                key={guide.slug}
                title={guide.title}
                description="LTV, FOIR, income and credit score rules for this product."
                href={`/policies/${guide.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — AI Copilot CTA (dark) */}
      <PolicyCTA
        title="Check Loan Eligibility Instantly with AI"
        subtitle="Ask credit policy questions or evaluate loan eligibility scenarios in seconds using AI Credit Policy Copilot."
        primaryButton={{ label: "Check Eligibility", href: "/signup" }}
        secondaryButton={{ label: "Ask Policy Question", href: "/signup" }}
      />
    </>
  );
}
