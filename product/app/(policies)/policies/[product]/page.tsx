import { notFound } from "next/navigation";
import Link from "next/link";
import {
  PolicyHero,
  PolicyCTA,
  EligibilityTable,
  PolicyRuleSection,
  ExampleScenario,
} from "@/components/policies";
import { POLICY_IDS } from "@/lib/policyMap";
import {
  getProductPageContent,
  getTopicPageContent,
  getAllProductSlugs,
  getAllTopicSlugs,
} from "@/lib/policyContent";

type Props = { params: Promise<{ product: string }> };

export async function generateStaticParams() {
  const products = getAllProductSlugs();
  const topics = getAllTopicSlugs();
  return [...products, ...topics].map((slug) => ({ product: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { product } = await params;
  const slug = product.toLowerCase().trim();
  const productContent = getProductPageContent(slug);
  const topicContent = getTopicPageContent(slug);
  if (productContent) {
    return {
      title: productContent.metaTitle,
      description: productContent.metaDescription,
    };
  }
  if (topicContent) {
    return {
      title: topicContent.metaTitle,
      description: topicContent.metaDescription,
    };
  }
  return { title: "Policy | AI Credit Policy Copilot" };
}

export default async function PolicyProductPage({ params }: Props) {
  const { product } = await params;
  const slug = product.toLowerCase().trim();
  const productContent = getProductPageContent(slug);
  const topicContent = getTopicPageContent(slug);

  if (topicContent) {
    return (
      <>
        <PolicyHero
          title={topicContent.title}
          subtitle={topicContent.metaDescription}
        />
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="prose prose-slate max-w-3xl">
              {topicContent.body.map((p, i) => (
                <p key={i} className="text-slate-700">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">
                Related policy guides
              </h2>
              <ul className="mt-4 flex flex-wrap gap-4">
                {topicContent.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!productContent) notFound();

  const policyId = POLICY_IDS[productContent.policyIdKey];
  const eligibilityHref = `/app/policies/${policyId}/eligibility`;
  const askHref = `/app/policies/${policyId}/ask`;

  return (
    <>
      {/* Section 1 — Hero (dark) */}
      <PolicyHero
        title={productContent.title}
        subtitle={productContent.metaDescription}
        primaryButton={{ label: "Check Eligibility", href: eligibilityHref }}
        secondaryButton={{ label: "Ask Policy Question", href: askHref }}
      />

      {/* Section 2 — Overview (slate) */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-slate-900">
            How lenders evaluate applications
          </h2>
          <div className="mt-4 space-y-3">
            {productContent.overview.map((p, i) => (
              <p key={i} className="text-slate-700">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Eligibility Table (white) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <EligibilityTable
            title="Eligibility at a glance"
            rows={productContent.eligibilityRows}
          />
        </div>
      </section>

      {/* Section 4 — Policy Rules (slate) */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <PolicyRuleSection
            title="Policy rules"
            intro={productContent.ruleIntro}
            items={productContent.ruleItems}
          />
        </div>
      </section>

      {/* Section 5 — Example Eligibility (white) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Example eligibility scenario
          </h2>
          <div className="mt-6 max-w-xl">
            <ExampleScenario
              title="Sample borrower"
              inputs={productContent.exampleInputs}
              result={productContent.exampleResult}
              resultVariant={productContent.exampleResultVariant}
              reasoning={productContent.exampleReasoning}
              ctaLabel="Check with AI"
              ctaHref={eligibilityHref}
            />
          </div>
        </div>
      </section>

      {/* Section 6 — AI CTA (dark) */}
      <PolicyCTA
        title="Check Loan Eligibility with AI"
        subtitle="Evaluate your scenario against policy rules in seconds using AI Credit Policy Copilot."
        primaryButton={{ label: "Check Eligibility", href: eligibilityHref }}
        secondaryButton={{ label: "Ask Policy Question", href: askHref }}
      />
    </>
  );
}
