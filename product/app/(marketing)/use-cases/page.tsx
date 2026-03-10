import Link from "next/link";
import { UserCheck, MessageCircle, Layers, Users } from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";

export default function UseCasesPage() {
  return (
    <>
      <MarketingPageHero
        title="How Lending Teams Use AI Policy Copilot"
        subtitle="See how loan agents, underwriting teams, and fintech platforms interpret policies faster."
        decorationIcon={Users}
      />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <UserCheck className="h-10 w-10 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Loan sales teams
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Check eligibility during customer calls. During a call, a
                customer asks if they qualify for a housing loan. The agent
                opens the eligibility checker, enters income (₹75,000), property
                value (₹50L), loan amount (₹40L), and CIBIL. Within seconds the
                copilot returns: <strong>Eligible</strong> — LTV within limit,
                FOIR within threshold. The agent can confidently proceed without
                pausing to read the policy PDF.
              </p>
              <Link
                href="/eligibility-calculator"
                className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Try Eligibility Checker →
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-10 w-10 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Credit underwriting teams
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Quickly interpret policy rules. A DSA asks: &quot;What is maximum LTV
                for LAP in Tier 2?&quot; The copilot answers from the policy:
                &quot;Maximum LTV for LAP in Tier 2 is 70%.&quot; When the bank updates
                FOIR limits, the team uploads the revised PDF; everyone can ask
                &quot;What is the new max FOIR?&quot; and run eligibility against updated
                rules. No manual rule sheets to maintain.
              </p>
              <Link
                href="/product"
                className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                See how it works →
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Layers className="h-10 w-10 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Fintech platforms
                </h2>
              </div>
              <p className="mt-4 text-slate-600">
                Embed policy intelligence into loan flows. Upload your credit
                policies, expose AI Q&A and eligibility checks to your users or
                internal tools. We&apos;re building APIs so you can integrate
                policy reasoning and eligibility into your own origination and
                underwriting flows.
              </p>
              <Link
                href="/product"
                className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Explore the product →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
