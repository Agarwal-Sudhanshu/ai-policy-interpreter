import Link from "next/link";
import { Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            About
          </h1>
          <p className="mt-4 text-slate-200">
            AI Credit Policy Copilot simplifies credit policy understanding for
            loan professionals.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <Target className="h-10 w-10 text-blue-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Mission</h2>
            <p className="mt-4 text-slate-600">
              AI Credit Policy Copilot simplifies credit policy understanding
              for loan professionals. We turn long policy PDFs into instant
              answers and eligibility insights so agents and DSAs can focus on
              customers, not documents.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <Heart className="h-10 w-10 text-blue-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Goal</h2>
            <p className="mt-4 text-slate-600">
              Make loan eligibility decisions clear and instant. Whether you’re
              checking LTV, FOIR, or income rules, the copilot gives you
              policy-backed answers in seconds—built for loan agents and DSAs.
            </p>
          </div>
          <div className="mt-16 text-center">
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Free
            </Link>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
