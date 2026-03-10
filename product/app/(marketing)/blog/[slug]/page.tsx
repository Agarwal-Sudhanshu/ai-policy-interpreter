import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Tag, Calculator } from "lucide-react";

const posts: Record<
  string,
  {
    title: string;
    description: string;
    category: string;
    readingTimeMinutes: number;
  }
> = {
  "what-is-ltv-in-home-loan": {
    title: "What is LTV in home loan",
    description:
      "Loan-to-Value (LTV) ratio is the percentage of the property value that a bank can finance. Learn how it affects your home loan eligibility.",
    category: "Eligibility",
    readingTimeMinutes: 4,
  },
  "what-is-foir-in-loan-eligibility": {
    title: "What is FOIR in loan eligibility",
    description:
      "FOIR (Fixed Obligation to Income Ratio) measures your existing EMI burden against income. Banks use it to decide how much loan you can service.",
    category: "Eligibility",
    readingTimeMinutes: 5,
  },
  "understanding-credit-policies": {
    title: "Understanding credit policies",
    description:
      "Credit policies define LTV, FOIR, income, and CIBIL rules. Here's how to read them and use an AI copilot to get instant answers.",
    category: "Policy basics",
    readingTimeMinutes: 4,
  },
};

const postSlugs = Object.keys(posts) as string[];

function getRelatedSlugs(currentSlug: string, limit = 2): string[] {
  return postSlugs.filter((s) => s !== currentSlug).slice(0, limit);
}

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = slug ? posts[slug] : null;
  if (!post) notFound();

  const relatedSlugs = getRelatedSlugs(slug);

  return (
    <>
      {/* Compact dark blog header */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <nav
            className="flex items-center gap-2 text-sm text-slate-300"
            aria-label="Breadcrumb"
          >
            <Link
              href="/blog"
              className="hover:text-white hover:underline"
            >
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-white">{post.title}</span>
          </nav>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              {post.readingTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4" aria-hidden />
              {post.category}
            </span>
          </div>
        </div>
      </section>

      <article className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          {/* 4. Main article content with improved typography */}
          <div className="prose prose-slate max-w-none space-y-6 leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h2]:first:mt-0 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:text-lg [&_p]:leading-relaxed [&_ul]:list-inside [&_ul]:space-y-2 [&_ul]:text-lg [&_ul]:leading-relaxed">
            <p className="text-lg leading-relaxed">{post.description}</p>

            <h2>Why it matters for lending</h2>
            <p>
              Banks and NBFCs use these metrics to keep risk within policy limits.
              Understanding LTV, FOIR, and how they interact helps you qualify
              customers faster and explain decisions clearly.
            </p>

            <h2>How policies define the rules</h2>
            <p>
              Credit policy documents spell out maximum LTV by segment, FOIR
              thresholds, minimum income, and CIBIL requirements. An AI policy
              copilot can read these documents and answer eligibility questions
              in plain language.
            </p>
          </div>

          {/* 5. Example block */}
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Example: LTV calculation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Property value ₹50L, loan ₹40L → LTV = 80%.
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 font-semibold text-slate-900">
                      Property value
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-900">
                      Loan amount
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-900">
                      LTV
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">₹50,00,000</td>
                    <td className="px-4 py-3">₹40,00,000</td>
                    <td className="px-4 py-3">80%</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">₹45,00,000</td>
                    <td className="px-4 py-3">₹35,00,000</td>
                    <td className="px-4 py-3">78%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">₹60,00,000</td>
                    <td className="px-4 py-3">₹50,00,000</td>
                    <td className="px-4 py-3">83%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. CTA block */}
          <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50/50 p-8 text-center">
            <Calculator className="mx-auto h-10 w-10 text-blue-600" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              Check your eligibility
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Use our eligibility calculator to see how LTV and FOIR apply to your
              scenario.
            </p>
            <Link
              href="/eligibility-calculator"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
            >
              Try Eligibility Calculator
            </Link>
          </div>

          {/* 7. Related articles */}
          <aside className="mt-14 border-t border-slate-200 pt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              Related articles
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {relatedSlugs.map((relatedSlug) => {
                const related = posts[relatedSlug];
                if (!related) return null;
                return (
                  <Link
                    key={relatedSlug}
                    href={`/blog/${relatedSlug}`}
                    className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
                  >
                    <span className="font-medium text-slate-900 group-hover:text-blue-600">
                      {related.title}
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {related.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
