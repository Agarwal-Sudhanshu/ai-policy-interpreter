/**
 * Policy IDs used for app routes: /app/policies/[policy_id]/eligibility and /ask
 * Replace "replace-id" with actual policy IDs from your database.
 */
export const POLICY_IDS = {
  housingLoan: "replace-id",
  loanAgainstProperty: "replace-id",
  personalLoan: "replace-id",
  businessLoan: "replace-id",
  vehicleLoan: "replace-id",
  goldLoan: "replace-id",
  educationLoan: "replace-id",
  msmeLoan: "replace-id",
  constructionFinance: "replace-id",
  workingCapital: "replace-id",
} as const;

export type PolicyIdKey = keyof typeof POLICY_IDS;

/** Slug to policy ID key for app links */
export const SLUG_TO_POLICY_ID_KEY: Record<string, PolicyIdKey> = {
  "housing-loan": "housingLoan",
  "loan-against-property": "loanAgainstProperty",
  "personal-loan": "personalLoan",
  "business-loan": "businessLoan",
  "vehicle-loan": "vehicleLoan",
  "gold-loan": "goldLoan",
  "education-loan": "educationLoan",
  "msme-loan": "msmeLoan",
  "construction-finance": "constructionFinance",
  "working-capital-loan": "workingCapital",
};

export function getPolicyIdBySlug(slug: string): string | null {
  const key = SLUG_TO_POLICY_ID_KEY[slug];
  if (!key) return null;
  return POLICY_IDS[key] ?? null;
}

/** Loan product categories for the policies hub */
export const LOAN_PRODUCT_CATEGORIES = [
  { slug: "housing-loan", title: "Housing Loan", description: "Home loan LTV, FOIR, income and property eligibility rules used by banks and NBFCs." },
  { slug: "loan-against-property", title: "Loan Against Property", description: "LAP eligibility, LTV limits and documentation requirements." },
  { slug: "personal-loan", title: "Personal Loan", description: "Income, FOIR and credit score criteria for unsecured personal loans." },
  { slug: "business-loan", title: "Business Loan", description: "Business loan underwriting, turnover and tenure rules." },
  { slug: "vehicle-loan", title: "Vehicle Loan", description: "Auto loan LTV, tenure and income eligibility." },
  { slug: "gold-loan", title: "Gold Loan", description: "Gold loan LTV, valuation and tenure norms." },
  { slug: "education-loan", title: "Education Loan", description: "Education loan eligibility and margin rules." },
  { slug: "msme-loan", title: "MSME Loan", description: "MSME lending criteria and collateral requirements." },
  { slug: "construction-finance", title: "Construction Finance", description: "Construction and project finance eligibility." },
  { slug: "working-capital-loan", title: "Working Capital Loan", description: "Working capital limits and assessment norms." },
] as const;

/** Common credit policy topic slugs and labels */
export const POLICY_TOPICS = [
  { slug: "ltv", title: "Loan to Value (LTV)", description: "LTV limits and how they affect loan eligibility." },
  { slug: "foir", title: "FOIR meaning", description: "Fixed Obligation to Income Ratio and typical limits." },
  { slug: "cibil-score", title: "Minimum CIBIL score", description: "Credit score requirements across loan products." },
  { slug: "income-requirements", title: "Income requirements", description: "Minimum income and documentation norms." },
  { slug: "loan-tenure-rules", title: "Loan tenure rules", description: "Maximum tenure and age criteria." },
  { slug: "property-eligibility", title: "Property eligibility", description: "Property types and location norms." },
] as const;
