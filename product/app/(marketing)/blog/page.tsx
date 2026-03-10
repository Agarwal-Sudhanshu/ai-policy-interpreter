import Link from "next/link";
import { BookOpen, Clock, Tag } from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";

const posts = [
  {
    slug: "what-is-ltv-in-home-loan",
    title: "What is LTV in home loan",
    description:
      "Loan-to-Value (LTV) ratio is the percentage of the property value that a bank can finance. Learn how it affects your home loan eligibility.",
    category: "Eligibility",
    readingTimeMinutes: 4,
  },
  {
    slug: "what-is-foir-in-loan-eligibility",
    title: "What is FOIR in loan eligibility",
    description:
      "FOIR (Fixed Obligation to Income Ratio) measures your existing EMI burden against income. Banks use it to decide how much loan you can service.",
    category: "Eligibility",
    readingTimeMinutes: 5,
  },
  {
    slug: "understanding-credit-policies",
    title: "Understanding credit policies",
    description:
      "Credit policies define LTV, FOIR, income, and CIBIL rules. Here’s how to read them and use an AI copilot to get instant answers.",
    category: "Loan Policy Guide",
    readingTimeMinutes: 4,
  },
];

export default function BlogPage() {
  return (
    <>
      <MarketingPageHero
        title="Credit Policy Insights"
        subtitle="Guides on LTV, FOIR, and loan eligibility for lending professionals."
        decorationIcon={BookOpen}
      />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg"
              >
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {post.readingTimeMinutes} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" aria-hidden />
                    {post.category}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{post.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline">
                  Read more
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-12 text-center text-slate-500">
            More credit policy guides coming soon.
          </p>
        </div>
      </section>
    </>
  );
}
