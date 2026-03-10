import Link from "next/link";
import { Check, Zap, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";

export default function PricingPage() {
  return (
    <>
      <MarketingPageHero
        title="Simple Pricing for AI Policy Copilot"
        subtitle="Start free and upgrade as your policy knowledge base grows."
        decorationIcon={CreditCard}
      />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* FREE */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-md">
              <h2 className="text-xl font-bold text-slate-900">FREE</h2>
              <ul className="mt-6 space-y-3 text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 shrink-0 text-green-600" />
                  Demo policies
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 shrink-0 text-green-600" />
                  Limited AI queries
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 shrink-0 text-green-600" />
                  Eligibility calculator
                </li>
              </ul>
            <Link
              href="/signup"
              className="mt-8 inline-block w-full rounded-lg border border-slate-300 bg-white py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                Get started
            </Link>
          </div>

          {/* PRO */}
          <div className="relative rounded-xl border-2 border-blue-600 bg-white p-8 shadow-sm transition duration-200 hover:shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="primary">Most Popular</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">PRO</h2>
            </div>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                Upload custom policies
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                Unlimited AI queries
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                Eligibility reasoning
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                Policy knowledge base
              </li>
            </ul>
            <Link
              href="/signup"
              className="mt-8 inline-block w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
