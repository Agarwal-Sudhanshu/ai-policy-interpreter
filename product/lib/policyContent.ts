import type { PolicyIdKey } from "./policyMap";

export type EligibilityRow = { parameter: string; requirement: string };

export type PolicyRuleItem = {
  title: string;
  content: string | string[];
};

export type ProductPageContent = {
  slug: string;
  policyIdKey: PolicyIdKey;
  title: string;
  metaTitle: string;
  metaDescription: string;
  overview: string[];
  eligibilityRows: EligibilityRow[];
  ruleIntro?: string;
  ruleItems: PolicyRuleItem[];
  exampleInputs: { label: string; value: string }[];
  exampleResult: string;
  exampleResultVariant: "pass" | "fail" | "neutral";
  exampleReasoning: string;
};

const CONTENT: Record<string, ProductPageContent> = {
  "housing-loan": {
    slug: "housing-loan",
    policyIdKey: "housingLoan",
    title: "Housing Loan Credit Policy & Eligibility Rules",
    metaTitle: "Housing Loan Eligibility, LTV & FOIR Rules | AI Credit Policy Copilot",
    metaDescription:
      "Understand housing loan credit policy: LTV limits, FOIR, minimum income and CIBIL score requirements used by banks and NBFCs.",
    overview: [
      "Lenders evaluate home loan applications using credit policy parameters such as Loan to Value (LTV), Fixed Obligation to Income Ratio (FOIR), minimum income, CIBIL score and employment type.",
      "Eligibility is typically assessed on the primary applicant; some lenders allow co-applicants to improve FOIR or loan amount.",
      "Property type, location and valuation also affect the maximum loan amount and LTV cap.",
    ],
    eligibilityRows: [
      { parameter: "Minimum Income", requirement: "Varies by lender; often ₹15,000–₹25,000/month" },
      { parameter: "Minimum CIBIL Score", requirement: "Usually 650+ (some lenders 700+)" },
      { parameter: "FOIR limit", requirement: "Typically 50–60% of net income" },
      { parameter: "Maximum loan tenure", requirement: "Up to 30 years" },
      { parameter: "Employment type", requirement: "Salaried, self-employed (ITR/profit & loss)" },
    ],
    ruleIntro: "Key parameters used in housing loan underwriting.",
    ruleItems: [
      {
        title: "LTV (Loan to Value)",
        content: "Maximum LTV is often 80–90% of property value; lower for high-value or non-salaried. Regulator cap may apply.",
      },
      {
        title: "FOIR",
        content: "EMI of proposed loan plus existing obligations as a percentage of net monthly income. Usually capped at 50–60%.",
      },
      {
        title: "Income requirements",
        content: ["Minimum net income as per lender policy.", "Income proof: salary slips, Form 16, ITR, bank statements."],
      },
      {
        title: "Credit score rules",
        content: "CIBIL/Experian score used for pricing and approval. Lower score may mean higher rate or rejection.",
      },
    ],
    exampleInputs: [
      { label: "Income", value: "₹60,000" },
      { label: "Property value", value: "₹45L" },
      { label: "Loan amount", value: "₹35L" },
    ],
    exampleResult: "Eligible (subject to FOIR and other checks)",
    exampleResultVariant: "pass",
    exampleReasoning:
      "LTV = 35/45 ≈ 78%, within typical 80% cap. FOIR depends on existing EMIs and proposed tenure; verify with lender.",
  },
  "loan-against-property": {
    slug: "loan-against-property",
    policyIdKey: "loanAgainstProperty",
    title: "Loan Against Property Credit Policy & Eligibility Rules",
    metaTitle: "Loan Against Property Eligibility & LTV Rules | AI Credit Policy Copilot",
    metaDescription:
      "LAP eligibility, LTV limits, FOIR and documentation requirements for loan against property.",
    overview: [
      "Loan against property (LAP) is secured by residential or commercial property. Lenders cap LTV and assess repayment capacity via FOIR and income.",
      "Eligibility depends on property valuation, age of property, and borrower income and credit history.",
    ],
    eligibilityRows: [
      { parameter: "Minimum Income", requirement: "Varies; often ₹25,000+/month" },
      { parameter: "Minimum CIBIL Score", requirement: "Typically 650+" },
      { parameter: "FOIR limit", requirement: "Usually 50–65%" },
      { parameter: "Maximum loan tenure", requirement: "Up to 15–20 years" },
      { parameter: "Employment type", requirement: "Salaried or self-employed" },
    ],
    ruleIntro: "Common LAP underwriting parameters.",
    ruleItems: [
      { title: "LTV", content: "Often 50–70% of property value depending on lender and property type." },
      { title: "FOIR", content: "Total EMI to net income ratio; typical cap 50–65%." },
      { title: "Income requirements", content: "Stable income with proof; self-employed need ITR and financials." },
      { title: "Credit score rules", content: "CIBIL/Experian used for approval and pricing." },
    ],
    exampleInputs: [
      { label: "Property value", value: "₹1 Cr" },
      { label: "Loan required", value: "₹50L" },
      { label: "Income", value: "₹1.5L/month" },
    ],
    exampleResult: "LTV 50% – within typical range",
    exampleResultVariant: "pass",
    exampleReasoning: "LTV 50% is within common LAP limits. Final eligibility depends on FOIR and credit score.",
  },
  "personal-loan": {
    slug: "personal-loan",
    policyIdKey: "personalLoan",
    title: "Personal Loan Credit Policy & Eligibility Rules",
    metaTitle: "Personal Loan Eligibility, FOIR & CIBIL Rules | AI Credit Policy Copilot",
    metaDescription:
      "Personal loan eligibility: income, FOIR, CIBIL score and employment criteria used by banks and NBFCs.",
    overview: [
      "Personal loans are unsecured; lenders rely on income, FOIR and credit score. Minimum income and employment stability are key.",
      "FOIR caps ensure sufficient surplus after EMIs; CIBIL score affects approval and interest rate.",
    ],
    eligibilityRows: [
      { parameter: "Minimum Income", requirement: "Often ₹15,000–₹25,000/month" },
      { parameter: "Minimum CIBIL Score", requirement: "Usually 650–750+" },
      { parameter: "FOIR limit", requirement: "Typically 50–60%" },
      { parameter: "Maximum loan tenure", requirement: "1–5 years" },
      { parameter: "Employment type", requirement: "Salaried preferred; some self-employed" },
    ],
    ruleIntro: "Typical personal loan underwriting criteria.",
    ruleItems: [
      { title: "FOIR", content: "Proposed EMI + existing EMIs as % of net income; cap usually 50–60%." },
      { title: "Income requirements", content: "Minimum net salary/income; proof via salary slip and bank statement." },
      { title: "Credit score rules", content: "Higher score improves approval and rate; low score may mean rejection or high rate." },
      { title: "Tenure", content: "Shorter tenures (1–5 years) common for unsecured loans." },
    ],
    exampleInputs: [
      { label: "Income", value: "₹75,000/month" },
      { label: "Existing EMI", value: "₹10,000" },
      { label: "Loan amount", value: "₹5L" },
    ],
    exampleResult: "Eligibility depends on FOIR and tenure",
    exampleResultVariant: "neutral",
    exampleReasoning: "Check that proposed EMI + ₹10,000 stays within lender FOIR (e.g. 50–60% of ₹75,000).",
  },
  "business-loan": {
    slug: "business-loan",
    policyIdKey: "businessLoan",
    title: "Business Loan Credit Policy & Underwriting Rules",
    metaTitle: "Business Loan Eligibility & Underwriting Rules | AI Credit Policy Copilot",
    metaDescription:
      "Business loan underwriting: turnover, tenure, documentation and eligibility criteria.",
    overview: [
      "Business loans are assessed on turnover, profitability, vintage and collateral. Banks and NBFCs set minimum turnover and documentation norms.",
      "Eligibility may include debt service coverage ratio (DSCR), existing exposure and sector-specific rules.",
    ],
    eligibilityRows: [
      { parameter: "Minimum turnover", requirement: "Varies; often ₹10L–₹1Cr+ per year" },
      { parameter: "Minimum CIBIL Score", requirement: "Often 650+ for entity/director" },
      { parameter: "Business vintage", requirement: "Typically 2–3 years" },
      { parameter: "Maximum loan tenure", requirement: "1–10 years depending on purpose" },
      { parameter: "Documentation", requirement: "ITR, financials, bank statements, KYC" },
    ],
    ruleIntro: "Common business loan underwriting parameters.",
    ruleItems: [
      { title: "Turnover & income", content: "Minimum annual turnover and profit; stability over years." },
      { title: "DSCR / FOIR", content: "Debt service coverage or FOIR for repayment capacity." },
      { title: "Credit score", content: "CIBIL/Experian for entity and sometimes directors." },
      { title: "Collateral", content: "Secured vs unsecured; collateral type and value affect limit and rate." },
    ],
    exampleInputs: [
      { label: "Annual turnover", value: "₹50L" },
      { label: "Loan required", value: "₹15L" },
      { label: "Vintage", value: "4 years" },
    ],
    exampleResult: "Likely within eligibility for many lenders",
    exampleResultVariant: "pass",
    exampleReasoning: "Turnover and vintage meet typical thresholds; final approval depends on financials and DSCR.",
  },
  "vehicle-loan": {
    slug: "vehicle-loan",
    policyIdKey: "vehicleLoan",
    title: "Vehicle Loan Credit Policy & Eligibility Rules",
    metaTitle: "Vehicle Loan Eligibility, LTV & Tenure | AI Credit Policy Copilot",
    metaDescription:
      "Vehicle loan LTV, tenure, income and credit score requirements.",
    overview: [
      "Auto loans are secured by the vehicle. Lenders cap LTV (e.g. 80–90% of on-road price), and assess income and FOIR.",
      "New vs used vehicle and make/model may affect LTV and tenure.",
    ],
    eligibilityRows: [
      { parameter: "Minimum Income", requirement: "Often ₹15,000+/month" },
      { parameter: "Minimum CIBIL Score", requirement: "Typically 650+" },
      { parameter: "FOIR limit", requirement: "Usually 50–60%" },
      { parameter: "Maximum LTV", requirement: "Often 80–90% (new vehicle)" },
      { parameter: "Maximum tenure", requirement: "Up to 7 years" },
    ],
    ruleIntro: "Typical vehicle loan parameters.",
    ruleItems: [
      { title: "LTV", content: "Loan as % of on-road price; lower for used vehicles." },
      { title: "FOIR", content: "EMI to income ratio; typical cap 50–60%." },
      { title: "Income", content: "Stable income with salary slip or ITR." },
      { title: "Credit score", content: "CIBIL used for approval and pricing." },
    ],
    exampleInputs: [
      { label: "Vehicle price", value: "₹10L" },
      { label: "Loan amount", value: "₹8L" },
      { label: "Income", value: "₹45,000/month" },
    ],
    exampleResult: "LTV 80% – within typical cap",
    exampleResultVariant: "pass",
    exampleReasoning: "LTV 80% is standard. Confirm FOIR with proposed tenure.",
  },
  "gold-loan": {
    slug: "gold-loan",
    policyIdKey: "goldLoan",
    title: "Gold Loan Credit Policy & Eligibility Rules",
    metaTitle: "Gold Loan LTV & Eligibility Rules | AI Credit Policy Copilot",
    metaDescription:
      "Gold loan LTV, valuation and tenure norms used by banks and NBFCs.",
    overview: [
      "Gold loans are secured by gold ornaments or coins. LTV is set as a percentage of gold value (e.g. 75–90% as per RBI).",
      "Eligibility is largely asset-based; some lenders also check income for higher amounts.",
    ],
    eligibilityRows: [
      { parameter: "LTV (gold value)", requirement: "Typically 75–90% as per regulator/lender" },
      { parameter: "Valuation", requirement: "In-house or certified; purity and weight" },
      { parameter: "Maximum tenure", requirement: "Usually up to 12–24 months (renewable)" },
      { parameter: "Documentation", requirement: "ID, address proof; income proof for higher amounts" },
    ],
    ruleIntro: "Key gold loan parameters.",
    ruleItems: [
      { title: "LTV", content: "Loan amount as % of gold value; RBI cap applies." },
      { title: "Valuation", content: "Daily/weekly gold price and purity determine value." },
      { title: "Tenure", content: "Short tenures; rollover possible per lender policy." },
    ],
    exampleInputs: [
      { label: "Gold value", value: "₹2L" },
      { label: "LTV", value: "80%" },
      { label: "Loan required", value: "₹1.6L" },
    ],
    exampleResult: "Within LTV – eligible",
    exampleResultVariant: "pass",
    exampleReasoning: "80% LTV on ₹2L = ₹1.6L; within typical norms.",
  },
  "education-loan": {
    slug: "education-loan",
    policyIdKey: "educationLoan",
    title: "Education Loan Credit Policy & Eligibility Rules",
    metaTitle: "Education Loan Eligibility & Margin Rules | AI Credit Policy Copilot",
    metaDescription:
      "Education loan eligibility, margin, security and repayment rules.",
    overview: [
      "Education loans fund course fees and related expenses. Lenders set margin (borrower contribution), security for higher amounts and repayment terms.",
      "Eligibility depends on course, institution, and co-borrower income/collateral where applicable.",
    ],
    eligibilityRows: [
      { parameter: "Margin (borrower share)", requirement: "Varies; often 0% up to a limit, then 5–15%" },
      { parameter: "Security", requirement: "Required above certain loan amount (e.g. ₹7.5L+)" },
      { parameter: "Maximum tenure", requirement: "Course period + repayment up to 10–15 years" },
      { parameter: "Co-borrower", requirement: "Often required; income considered" },
    ],
    ruleIntro: "Typical education loan parameters.",
    ruleItems: [
      { title: "Margin", content: "Portion of expenses borne by borrower; rest financed." },
      { title: "Security", content: "Collateral or guarantor for larger loans per policy." },
      { title: "Income / co-borrower", content: "Repayment capacity via co-borrower income." },
    ],
    exampleInputs: [
      { label: "Course cost", value: "₹15L" },
      { label: "Loan required", value: "₹12L" },
      { label: "Margin", value: "20%" },
    ],
    exampleResult: "Within typical margin norms",
    exampleResultVariant: "pass",
    exampleReasoning: "20% margin on ₹15L = ₹3L own contribution; ₹12L loan. Confirm with lender.",
  },
  "msme-loan": {
    slug: "msme-loan",
    policyIdKey: "msmeLoan",
    title: "MSME Loan Credit Policy & Eligibility Rules",
    metaTitle: "MSME Loan Eligibility & Lending Criteria | AI Credit Policy Copilot",
    metaDescription:
      "MSME lending criteria, collateral and documentation requirements.",
    overview: [
      "MSME loans support working capital, machinery or term loans. Eligibility is based on turnover, vintage, sector and collateral.",
      "Banks and NBFCs use CGTMSE or other guarantee schemes; criteria vary by product.",
    ],
    eligibilityRows: [
      { parameter: "Turnover / size", requirement: "As per MSME definition and lender" },
      { parameter: "Vintage", requirement: "Typically 1–3 years" },
      { parameter: "CIBIL", requirement: "Often 650+ for entity/directors" },
      { parameter: "Collateral", requirement: "Unsecured up to limit; collateral for higher amounts" },
    ],
    ruleIntro: "Common MSME loan parameters.",
    ruleItems: [
      { title: "Eligibility", content: "MSME definition (investment/turnover); sector and vintage." },
      { title: "Credit score", content: "CIBIL for entity and promoters." },
      { title: "Collateral / guarantee", content: "CGTMSE or other schemes; security above threshold." },
    ],
    exampleInputs: [
      { label: "Turnover", value: "₹50L" },
      { label: "Loan type", value: "Working capital" },
      { label: "Vintage", value: "2 years" },
    ],
    exampleResult: "Eligibility depends on lender policy",
    exampleResultVariant: "neutral",
    exampleReasoning: "Many lenders serve this segment; check product-specific turnover and documentation.",
  },
  "construction-finance": {
    slug: "construction-finance",
    policyIdKey: "constructionFinance",
    title: "Construction Finance Credit Policy & Eligibility Rules",
    metaTitle: "Construction Finance Eligibility | AI Credit Policy Copilot",
    metaDescription:
      "Construction and project finance eligibility, LTV and disbursement norms.",
    overview: [
      "Construction finance funds project development. Lenders assess project viability, developer track record, LTV and phased disbursement.",
      "Eligibility includes land title, approvals and pre-sales or cash flow.",
    ],
    eligibilityRows: [
      { parameter: "LTV / LTC", requirement: "As per lender; often 60–75% of project cost" },
      { parameter: "Pre-sales / cash flow", requirement: "Often required for disbursement" },
      { parameter: "Approvals", requirement: "RERA, municipal and other clearances" },
      { parameter: "Developer vintage", requirement: "Track record and net worth" },
    ],
    ruleIntro: "Typical construction finance parameters.",
    ruleItems: [
      { title: "LTV/LTC", content: "Loan to cost/value; cap and disbursement linked to milestones." },
      { title: "Security", content: "Mortgage, assignment of receivables." },
      { title: "Eligibility", content: "Project approvals, developer profile and cash flow." },
    ],
    exampleInputs: [
      { label: "Project cost", value: "₹20 Cr" },
      { label: "Loan required", value: "₹12 Cr" },
      { label: "LTC", value: "60%" },
    ],
    exampleResult: "Within typical LTC range",
    exampleResultVariant: "pass",
    exampleReasoning: "60% LTC is common. Final terms depend on project and developer.",
  },
  "working-capital-loan": {
    slug: "working-capital-loan",
    policyIdKey: "workingCapital",
    title: "Working Capital Loan Credit Policy & Eligibility Rules",
    metaTitle: "Working Capital Loan Eligibility & Assessment | AI Credit Policy Copilot",
    metaDescription:
      "Working capital limits, assessment norms and documentation.",
    overview: [
      "Working capital loans fund day-to-day operations. Assessment is based on operating cycle, turnover and existing limits.",
      "Banks use MPBF or turnover-based methods; NBFCs may use different models.",
    ],
    eligibilityRows: [
      { parameter: "Turnover", requirement: "Minimum as per lender" },
      { parameter: "Operating cycle", requirement: "Assessment of receivables, inventory, payables" },
      { parameter: "Existing limits", requirement: "Existing WC and term debt considered" },
      { parameter: "Documentation", requirement: "Financials, stock statements, bank statements" },
    ],
    ruleIntro: "Common working capital parameters.",
    ruleItems: [
      { title: "Assessment", content: "MPBF or turnover-based; peak requirement and seasonality." },
      { title: "Eligibility", content: "Turnover, profitability and existing exposure." },
      { title: "Security", content: "Current assets, collateral as per policy." },
    ],
    exampleInputs: [
      { label: "Annual turnover", value: "₹2 Cr" },
      { label: "Peak requirement", value: "₹40L" },
      { label: "Existing WC", value: "₹25L" },
    ],
    exampleResult: "Assessment depends on lender method",
    exampleResultVariant: "neutral",
    exampleReasoning: "Lender will compute eligible limit from turnover and operating cycle.",
  },
};

export function getProductPageContent(slug: string): ProductPageContent | null {
  return CONTENT[slug] ?? null;
}

export function getAllProductSlugs(): string[] {
  return Object.keys(CONTENT);
}

/** Minimal content for topic-only pages (ltv, foir, cibil-score, etc.) */
export type TopicPageContent = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  body: string[];
  relatedLinks: { label: string; href: string }[];
};

const TOPIC_CONTENT: Record<string, TopicPageContent> = {
  ltv: {
    slug: "ltv",
    title: "Loan to Value (LTV)",
    metaTitle: "LTV Meaning & Limits for Home Loans | AI Credit Policy Copilot",
    metaDescription: "What is LTV? How LTV limits affect home loan and LAP eligibility.",
    body: [
      "Loan to Value (LTV) is the ratio of the loan amount to the value of the asset (e.g. property or vehicle).",
      "Lenders cap LTV to limit risk. For example, 80% LTV on a ₹50L property means maximum loan ₹40L.",
      "Higher LTV may mean higher interest rate or additional insurance. LTV caps vary by product and borrower segment.",
    ],
    relatedLinks: [
      { label: "Housing Loan Policy", href: "/policies/housing-loan" },
      { label: "Loan Against Property", href: "/policies/loan-against-property" },
    ],
  },
  foir: {
    slug: "foir",
    title: "FOIR meaning",
    metaTitle: "FOIR – Fixed Obligation to Income Ratio | AI Credit Policy Copilot",
    metaDescription: "What is FOIR? How lenders use FOIR to assess loan eligibility.",
    body: [
      "FOIR (Fixed Obligation to Income Ratio) is the percentage of your net monthly income that goes toward existing and proposed EMIs.",
      "Lenders typically cap FOIR at 50–60%. So if your net income is ₹1L and FOIR cap is 50%, total EMI (existing + new) should not exceed ₹50,000.",
      "Lower FOIR leaves more surplus for living expenses and is preferred by lenders.",
    ],
    relatedLinks: [
      { label: "Housing Loan Policy", href: "/policies/housing-loan" },
      { label: "Personal Loan Policy", href: "/policies/personal-loan" },
    ],
  },
  "cibil-score": {
    slug: "cibil-score",
    title: "Minimum CIBIL score",
    metaTitle: "Minimum CIBIL Score for Loans | AI Credit Policy Copilot",
    metaDescription: "CIBIL score requirements for home loan, personal loan and other products.",
    body: [
      "CIBIL (and other bureaus) provide a credit score (300–900). Lenders use it to approve or reject and to set interest rates.",
      "Minimum score varies by product: home loans often 650–700+, personal loans 700+ for best rates.",
      "A higher score improves approval chances and can get you a lower rate.",
    ],
    relatedLinks: [
      { label: "Housing Loan Policy", href: "/policies/housing-loan" },
      { label: "Personal Loan Policy", href: "/policies/personal-loan" },
    ],
  },
  "income-requirements": {
    slug: "income-requirements",
    title: "Income requirements",
    metaTitle: "Minimum Income for Loans | AI Credit Policy Copilot",
    metaDescription: "Minimum income and documentation for home loan, personal loan and LAP.",
    body: [
      "Lenders set minimum net income (after tax) for each product. It varies by lender and city.",
      "Income proof: salary slips, Form 16, ITR, bank statements. Self-employed need ITR and profit & loss.",
      "Co-applicant income can be included to improve eligibility or FOIR.",
    ],
    relatedLinks: [
      { label: "Housing Loan Policy", href: "/policies/housing-loan" },
      { label: "Personal Loan Policy", href: "/policies/personal-loan" },
    ],
  },
  "loan-tenure-rules": {
    slug: "loan-tenure-rules",
    title: "Loan tenure rules",
    metaTitle: "Maximum Loan Tenure & Age Rules | AI Credit Policy Copilot",
    metaDescription: "Maximum tenure and age criteria for home loan, personal loan and others.",
    body: [
      "Maximum tenure varies by product: home loans up to 25–30 years, personal loans 1–5 years, LAP 15–20 years.",
      "Retirement age or age at maturity is often considered: some lenders require loan to close by 60–70 years of age.",
      "Longer tenure means lower EMI but higher total interest.",
    ],
    relatedLinks: [
      { label: "Housing Loan Policy", href: "/policies/housing-loan" },
      { label: "Vehicle Loan Policy", href: "/policies/vehicle-loan" },
    ],
  },
  "property-eligibility": {
    slug: "property-eligibility",
    title: "Property eligibility",
    metaTitle: "Property Eligibility for Home Loan & LAP | AI Credit Policy Copilot",
    metaDescription: "Property types, location and documentation for home loan and LAP.",
    body: [
      "Lenders approve loans for certain property types: ready, under-construction, resale; some restrict plot or commercial.",
      "Location (city, area) and builder/developer may affect LTV and approval.",
      "Valuation and legal clearance are required; lender may have an approved list of projects.",
    ],
    relatedLinks: [
      { label: "Housing Loan Policy", href: "/policies/housing-loan" },
      { label: "Loan Against Property", href: "/policies/loan-against-property" },
    ],
  },
};

export function getTopicPageContent(slug: string): TopicPageContent | null {
  return TOPIC_CONTENT[slug] ?? null;
}

export function getAllTopicSlugs(): string[] {
  return Object.keys(TOPIC_CONTENT);
}
