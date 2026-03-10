import Link from "next/link";
import {
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Calculator,
  AlertCircle,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const HOW_IT_WORKS_STEPS = [
  {
    label: "Policy documents",
    description: "Upload credit policy PDFs for processing.",
    icon: FileText,
  },
  {
    label: "AI clause extraction",
    description: "AI extracts key clauses and rules from documents.",
    icon: Sparkles,
  },
  {
    label: "Policy rule understanding",
    description: "Structured rules for LTV, FOIR, and eligibility.",
    icon: BookOpen,
  },
  {
    label: "Eligibility insights",
    description: "Instant pass/fail and reasoning for loan scenarios.",
    icon: CheckCircle2,
  },
  {
    label: "Loan decision guidance",
    description: "Clear recommendations for agents and underwriters.",
    icon: BarChart3,
  },
];

export default function MarketingHomePage() {
  return (
    <>
      {/* Hero - dark section */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              AI Credit Policy Interpreter
            </h1>
            <p className="mt-6 text-lg text-slate-200">
              Turn credit policies and underwriting rules into structured
              decision insights and AI-powered eligibility evaluation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
              >
                Try Policy Copilot
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex rounded-xl border border-white/60 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                View How It Works
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Credit Policy PDFs</span>
              </div>
              <div className="ml-5 h-4 w-px bg-white/30" aria-hidden />
              <div className="flex items-center gap-3 text-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">AI clause extraction</span>
              </div>
              <div className="ml-5 h-4 w-px bg-white/30" aria-hidden />
              <div className="flex items-center gap-3 text-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Policy rule understanding</span>
              </div>
              <div className="ml-5 h-4 w-px bg-white/30" aria-hidden />
              <div className="flex items-center gap-3 text-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Eligibility insights</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Credit Policies Are Hard to Use
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-slate-600">
          Credit policies live in long documents and are difficult to interpret
          quickly during loan discussions.
        </p>
        <ul className="mx-auto mt-12 max-w-3xl space-y-4 text-slate-600">
          <li className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <span>Policies scattered across documents</span>
          </li>
          <li className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <span>Manual interpretation slows deals</span>
          </li>
          <li className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <span>Agents depend on credit managers</span>
          </li>
          <li className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <span>Policy understanding varies across teams</span>
          </li>
        </ul>
        </div>
      </section>

      {/* Solution */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mx-auto max-w-3xl text-center text-xl font-medium text-slate-900">
            AI Policy Interpreter converts credit policies into structured
            decision insights that loan teams can use instantly.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Upload policy PDFs, ask questions in plain language, and evaluate
            eligibility in seconds—without digging through documents.
          </p>
        </div>
      </section>

      {/* How it works - dark section */}
      <section
        id="how-it-works"
        className="bg-gradient-to-br from-slate-900 to-blue-900 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-white">
            How It Works
          </h2>
          {/* Mobile: vertical stack */}
          <div className="mt-12 flex flex-col items-stretch gap-0 md:hidden">
            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.label}
                  className="flex flex-col items-center"
                >
                  <div className="w-full rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                      <StepIcon className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-3 font-medium text-white">{step.label}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      {step.description}
                    </p>
                  </div>
                  {i < 4 && (
                    <div
                      className="flex h-8 w-full justify-center"
                      aria-hidden
                    >
                      <div className="h-8 w-px bg-white/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Desktop: horizontal grid with connectors */}
          <div className="mt-12 hidden grid-cols-5 gap-4 md:grid md:items-stretch">
            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="relative flex flex-col">
                  <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                      <StepIcon className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-3 font-medium text-white">{step.label}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      {step.description}
                    </p>
                  </div>
                  {i < 4 && (
                    <div
                      className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 md:block"
                      aria-hidden
                    >
                      <ChevronRight className="h-6 w-6 text-white/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Example decision / Eligibility */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Example loan decisions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            See how the copilot evaluates scenarios in seconds.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scenario
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                <li>Income: ₹60,000</li>
                <li>Property: ₹45L</li>
                <li>Loan: ₹35L</li>
              </ul>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Result
              </h3>
              <p className="mt-1.5 font-semibold text-green-700">Eligible</p>
              <p className="mt-2 text-sm text-slate-600">
                LTV within 80%, FOIR within limit, income above minimum
                threshold.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scenario
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                <li>Income: ₹85,000</li>
                <li>Property: ₹80L</li>
                <li>Loan: ₹55L</li>
              </ul>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Result
              </h3>
              <p className="mt-1.5 font-semibold text-green-700">Eligible</p>
              <p className="mt-2 text-sm text-slate-600">
                LTV 69%, FOIR well within policy. Strong income for requested
                loan.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scenario
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                <li>Income: ₹45,000</li>
                <li>Property: ₹35L</li>
                <li>Loan: ₹32L</li>
              </ul>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Result
              </h3>
              <p className="mt-1.5 font-semibold text-amber-700">
                Not eligible
              </p>
              <p className="mt-2 text-sm text-slate-600">
                LTV exceeds 80% for this segment. Lower loan amount or higher
                down payment required.
              </p>
            </div>
          </div>
          <p className="mt-8 text-center">
            <Link
              href="/eligibility-calculator"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Try Eligibility Calculator →
            </Link>
          </p>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Capabilities
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-blue-100 p-3">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              AI Policy Q&A
            </h3>
            <p className="mt-2 text-slate-600">
              Ask questions about credit policies in plain language.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-blue-100 p-3">
              <Calculator className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Loan Eligibility Check
            </h3>
            <p className="mt-2 text-slate-600">
              Evaluate loan scenarios instantly.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-blue-100 p-3">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Policy Rule Extraction
            </h3>
            <p className="mt-2 text-slate-600">
              AI understands rules from policy documents.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-blue-100 p-3">
              <Sparkles className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Policy Intelligence
            </h3>
            <p className="mt-2 text-slate-600">
              Understand limits like LTV, FOIR, and income rules quickly.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Start Using AI Policy Copilot
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Understand credit policies and evaluate loan eligibility in seconds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
            >
              Try Free
            </Link>
            <Link
              href="/policies"
              className="inline-flex rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Explore Policies
            </Link>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
