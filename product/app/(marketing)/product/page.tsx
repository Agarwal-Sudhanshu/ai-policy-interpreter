import Link from "next/link";
import {
  Upload,
  FileSearch,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  FileText,
  BookOpen,
  BarChart3,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";

const ARCHITECTURE_STEPS = [
  {
    label: "Policy PDFs",
    description:
      "Upload lending policy documents and underwriting guidelines.",
    icon: FileText,
  },
  {
    label: "Clause extraction",
    description:
      "AI extracts key parameters such as LTV, FOIR, income thresholds, and property rules.",
    icon: Sparkles,
  },
  {
    label: "Structured rules",
    description: "Policy clauses are converted into structured decision rules.",
    icon: BookOpen,
  },
  {
    label: "Eligibility reasoning",
    description: "Loan scenarios are evaluated against extracted rules.",
    icon: CheckCircle2,
  },
  {
    label: "Decision outputs",
    description: "Return pass/fail results with clear policy reasoning.",
    icon: BarChart3,
  },
];

export default function ProductPage() {
  return (
    <>
      <MarketingPageHero
        title="AI Credit Policy Interpreter Platform"
        subtitle="Understand credit policies, extract rules, and evaluate loan eligibility using AI."
        decorationIcon={FileText}
      />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            What problem it solves
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Credit policies live in long documents and are difficult to
            interpret quickly during loan discussions.
          </p>
          <ul className="mt-8 space-y-4 text-slate-600">
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

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Architecture
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            From policy documents to loan decisions — all in one pipeline.
          </p>
          {/* Mobile: vertical stack */}
          <div className="mt-12 flex flex-col items-stretch gap-0 md:hidden">
            {ARCHITECTURE_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center">
                  <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <StepIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="mt-3 font-medium text-slate-900">
                      {step.label}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  {i < 4 && (
                    <div
                      className="flex h-8 w-full justify-center"
                      aria-hidden
                    >
                      <div className="h-8 w-px bg-slate-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Desktop: horizontal grid with connectors */}
          <div className="mt-12 hidden grid-cols-5 gap-6 md:grid md:items-stretch">
            {ARCHITECTURE_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="relative flex flex-col">
                  <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <StepIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="mt-3 font-medium text-slate-900">
                      {step.label}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  {i < 4 && (
                    <div
                      className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block"
                      aria-hidden
                    >
                      <ChevronRight className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-slate-300">
            From policy ingestion to AI-driven decision insights.
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold text-white">
            How the AI works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Policy ingestion</h3>
              <p className="mt-2 text-sm text-slate-200">
                Upload credit policy PDFs. The AI engine ingests documents and
                processes them in the background.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <FileSearch className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-white">AI reasoning</h3>
              <p className="mt-2 text-sm text-slate-200">
                AI extracts and structures underwriting rules (LTV, FOIR, income,
                CIBIL) for consistent reasoning.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Policy Q&A</h3>
              <p className="mt-2 text-sm text-slate-200">
                Ask questions in plain language. Get instant answers about LTV,
                FOIR, and eligibility criteria.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-white">Eligibility evaluation</h3>
              <p className="mt-2 text-sm text-slate-200">
                Evaluate loan cases against policy rules and get pass/fail
                guidance during customer calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Product capabilities
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <Upload className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Policy document ingestion
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Upload credit policy PDFs and build a searchable policy
                knowledge base.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <Sparkles className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Structured rule extraction
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Automatically extract rules like LTV, FOIR, income thresholds,
                and property conditions.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <MessageSquare className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Policy Q&A
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Ask questions about policies in plain language and get instant
                answers.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <CheckCircle2 className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Eligibility evaluation
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Evaluate loan cases and receive pass/fail results with
                explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            API Platform (Coming Soon)
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Integrate AI policy interpretation directly into your loan
            origination systems and underwriting workflows.
          </p>
          <p className="mt-2 max-w-2xl text-slate-600">
            Our upcoming APIs will allow fintech platforms and NBFCs to
            automate policy reasoning at scale.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <Upload className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Policy ingestion API
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Upload and process policy documents programmatically.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <CheckCircle2 className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Eligibility evaluation API
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Send loan scenarios and receive structured eligibility
                decisions.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <MessageSquare className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Policy Q&A API
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Query policies using natural language inside your systems.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
            >
              Join API Early Access
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Ready to try the platform?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Sign up to upload policies, run eligibility checks, and get
            instant policy answers.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
          >
            Try Free
          </Link>
        </div>
      </section>
    </>
  );
}
