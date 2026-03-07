export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const ALLOWED_CONDITION_FIELDS = new Set([
  "property_value",
  "loan_amount",
  "income",
  "occupation",
  "age",
]);

const EXTRACTION_PROMPT = `Extract structured credit policy rules from the policy text below.

## Guidelines

Extract structured credit policy rules. When policies contain slabs, ranges, or different values by segment, create separate rules with conditions.

**Supported rule types:** loan_type, max_ltv, max_foir, min_income, min_cibil, age_min, age_max, eligible_occupations (snake_case).

**Conditions must reference only these fields:** property_value, loan_amount, income, occupation, age.

**Allowed operators in conditions:** <, <=, >, >=, =, AND, OR.

**Normalize numbers before output:**
- ₹25,000 → 25000
- ₹30 Lakhs or 30 Lakhs → 3000000
- ₹75 Lakhs or 75 Lakhs → 7500000
Use digits only in conditions and in numeric rule values (no ₹, no commas, no "Lakhs" text).

**Converting ranges to conditions:** When the policy contains ranges such as "between X and Y", "from X to Y", or "X to Y", convert them to conditional expressions using: field > X AND field <= Y (use digits for X and Y). Example: "Property value between ₹30 Lakhs and ₹75 Lakhs" → condition: "property_value > 3000000 AND property_value <= 7500000".

Return a JSON object with a single key "rules" that is an array of objects. Each object must have:
- "type": one of the supported rule types above
- "value": string (normalized: "80%", "25000", "700", "21", "60", "Housing Loan"). For eligible_occupations use comma-separated or single value.
- "condition": optional string. Use only the allowed field names and operators. Omit if the rule is unconditional.

## Common patterns to detect

- **LTV slabs:** Different max LTV by property value (e.g. up to ₹30L: 80%; above ₹30L up to ₹75L: 75%; above ₹75L: 70%).
- **FOIR by occupation:** Different max FOIR for salaried vs self-employed.
- **Income brackets / minimum income by occupation:** Different min income for salaried vs self-employed.
- **Age limits:** Different age ranges by segment if stated.
- **Loan amount tiers:** Different rules by loan amount bands.

## Full example – LTV slabs

Policy text: "Up to ₹30 Lakhs property value: Maximum LTV 80%. Above ₹30 Lakhs and up to ₹75 Lakhs: Maximum LTV 75%. Above ₹75 Lakhs: Maximum LTV 70%."

Output:
{"rules": [
  {"type": "max_ltv", "value": "80%", "condition": "property_value <= 3000000"},
  {"type": "max_ltv", "value": "75%", "condition": "property_value > 3000000 AND property_value <= 7500000"},
  {"type": "max_ltv", "value": "70%", "condition": "property_value > 7500000"}
]}

## Few-shot examples

Example 1 – LTV slab (single):
Policy: "Up to ₹30 Lakhs property value: LTV 80%"
Output: {"type":"max_ltv","value":"80%","condition":"property_value <= 3000000"}

Example 2 – FOIR by occupation:
Policy: "Maximum FOIR allowed: 50% for salaried applicants, 55% for self-employed applicants"
Output: {"type":"max_foir","value":"50%","condition":"occupation = salaried"}, {"type":"max_foir","value":"55%","condition":"occupation = self-employed"}

Example 3 – Income by occupation:
Policy: "Minimum income for salaried applicants: ₹25,000. Minimum income for self-employed applicants: ₹40,000."
Output: {"type":"min_income","value":"25000","condition":"occupation = salaried"}, {"type":"min_income","value":"40000","condition":"occupation = self-employed"}

Example 4 – Range ("between X and Y"):
Policy: "LTV allowed for properties between ₹30 Lakhs and ₹75 Lakhs is 75%"
Output: {"type":"max_ltv","value":"75%","condition":"property_value > 3000000 AND property_value <= 7500000"}

Only include rules that are present or can be inferred. Return only valid JSON. No markdown, no code fences.

Policy text:

`;

type RuleItem = { type: string; value: string; condition?: string | null };

/*
 * Inline test examples for range normalization:
 *
 * Example 1:
 *   Policy text: "Property value between ₹30L and ₹75L"
 *   Expected condition: property_value > 3000000 AND property_value <= 7500000
 *
 * Example 2:
 *   Policy text: "Loan amount from ₹5L to ₹20L"
 *   Expected condition: loan_amount > 500000 AND loan_amount <= 2000000
 */

/** Parse a bound string (e.g. "30L", "3000000", "₹30 Lakhs") to a number. */
function parseBoundToNumber(s: string): number | null {
  const raw = String(s).trim();
  const t = raw.replace(/[\s,₹]/g, "").replace(/\s*Lakhs?\s*$/i, "");
  const lakhMatch = t.match(/^(\d+(?:\.\d+)?)\s*[lL]?$/i);
  if (lakhMatch) {
    const n = Number(lakhMatch[1]);
    if (!Number.isFinite(n)) return null;
    const isLakhs = /[lL]$/i.test(t) || /\s*Lakhs?\s*$/i.test(raw);
    if (isLakhs) return Math.round(n * 100_000);
    return Math.round(n);
  }
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/**
 * Normalize range phrases in a condition: "field between X and Y" / "field from X to Y" → "field > X AND field <= Y".
 * Only allowed fields are used. If conversion fails or field is disallowed, returns original string.
 */
function normalizeRangeCondition(condition: string | null | undefined): string | null {
  if (condition == null || String(condition).trim() === "") return null;
  let c = String(condition).trim();
  const fields = [...ALLOWED_CONDITION_FIELDS].join("|");
  const betweenRe = new RegExp(
    `\\b(${fields})\\s+between\\s+(.+?)\\s+and\\s+(.+?)(?=\\s+AND|\\s+OR|$)`,
    "gi"
  );
  let match = betweenRe.exec(c);
  if (match) {
    const field = match[1].toLowerCase();
    const low = parseBoundToNumber(match[2].trim());
    const high = parseBoundToNumber(match[3].trim());
    if (low != null && high != null && ALLOWED_CONDITION_FIELDS.has(field)) {
      c = c.replace(match[0], `${field} > ${low} AND ${field} <= ${high}`);
      return normalizeRangeCondition(c);
    }
  }
  const fromToRe = new RegExp(
    `\\b(${fields})\\s+from\\s+(.+?)\\s+to\\s+(.+?)(?=\\s+AND|\\s+OR|$)`,
    "gi"
  );
  match = fromToRe.exec(c);
  if (match) {
    const field = match[1].toLowerCase();
    const low = parseBoundToNumber(match[2].trim());
    const high = parseBoundToNumber(match[3].trim());
    if (low != null && high != null && ALLOWED_CONDITION_FIELDS.has(field)) {
      c = c.replace(match[0], `${field} > ${low} AND ${field} <= ${high}`);
      return normalizeRangeCondition(c);
    }
  }
  return c;
}

/** Normalize numeric values: ₹25,000 → 25000, 30 Lakhs → 3000000. */
function normalizeRuleValue(ruleType: string, value: string): string {
  const v = String(value).trim();
  if (!v) return v;
  const numericTypes = new Set(["min_income", "min_cibil", "age_min", "age_max", "max_ltv", "max_foir"]);
  if (!numericTypes.has(ruleType)) return v;
  const stripped = v.replace(/^₹\s*|[\s,₹]/g, "").replace(/\s*Lakhs?\s*$/i, "").trim();
  const lakhMatch = stripped.match(/^(\d+(?:\.\d+)?)\s*[lL]?\s*$/);
  if (lakhMatch) {
    const num = Number(lakhMatch[1]);
    if (Number.isFinite(num)) {
      if (/[lL]$/.test(v) || /\s*[lL]akhs?\s*$/i.test(v)) return String(Math.round(num * 100_000));
      return String(Math.round(num));
    }
  }
  const num = Number(stripped.replace(/%/g, ""));
  if (Number.isFinite(num) && v.includes("%")) return `${num}%`;
  if (Number.isFinite(num)) return String(Math.round(num));
  return v;
}

/** If condition references only allowed fields, return it; otherwise return null (store as unconditional). */
function validateCondition(condition: string | null | undefined): string | null {
  if (condition == null || String(condition).trim() === "") return null;
  const c = String(condition).trim();
  const orBlocks = c.split(/\s+OR\s+/i);
  for (const block of orBlocks) {
    const clauses = block.split(/\s+AND\s+/i);
    for (const clause of clauses) {
      const match = clause.trim().match(/^\s*(\w+)\s*(<=|>=|<|>|=)\s*(.+)$/);
      if (match && !ALLOWED_CONDITION_FIELDS.has(match[1].toLowerCase())) return null;
    }
  }
  return c;
}

function ruleSourceText(ruleType: string): string {
  const labels: Record<string, string> = {
    loan_type: "Loan type rule extracted from policy text",
    max_ltv: "LTV rule extracted from policy text",
    max_foir: "FOIR rule extracted from policy text",
    min_income: "Minimum income rule extracted from policy text",
    min_cibil: "Credit score rule extracted from policy text",
    age_min: "Age minimum rule extracted from policy text",
    age_max: "Age maximum rule extracted from policy text",
    eligible_occupations: "Eligible occupations rule extracted from policy text",
  };
  return labels[ruleType] ?? `${ruleType} rule extracted from policy text`;
}

function parseRulesResponse(content: string | null | undefined): RuleItem[] {
  if (!content || typeof content !== "string") return [];
  try {
    const parsed = JSON.parse(content) as { rules?: unknown };
    if (!Array.isArray(parsed.rules)) return [];
    return (parsed.rules as unknown[]).filter((r): r is RuleItem => {
      if (!r || typeof r !== "object") return false;
      const o = r as Record<string, unknown>;
      return (
        typeof o.type === "string" &&
        o.type.trim() !== "" &&
        (typeof o.value === "string" || typeof o.value === "number")
      );
    }).map((r) => {
      const o = r as Record<string, unknown>;
      const type = String(o.type).trim();
      const rawValue = String(o.value);
      const rawCondition = o.condition != null && typeof o.condition === "string" && o.condition.trim() !== ""
        ? o.condition.trim()
        : null;
      const normalizedCondition = normalizeRangeCondition(rawCondition);
      const finalCondition = normalizedCondition ?? rawCondition;
      const hasUnconvertedRange = finalCondition != null && /between|from\s+.+\s+to/i.test(finalCondition);
      const conditionToValidate = hasUnconvertedRange && normalizedCondition === rawCondition ? null : finalCondition;
      return {
        type,
        value: normalizeRuleValue(type, rawValue),
        condition: validateCondition(conditionToValidate),
      };
    });
  } catch {
    return [];
  }
}

/** Deduplicate by type + value + condition; keep first occurrence. */
function deduplicateRules(rules: RuleItem[]): RuleItem[] {
  const seen = new Set<string>();
  return rules.filter((r) => {
    const key = `${r.type}|${r.value}|${r.condition ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const documentId =
      typeof body.document_id === "string" ? body.document_id.trim() : "";

    if (!documentId) {
      return NextResponse.json(
        { error: "document_id is required" },
        { status: 400 }
      );
    }

    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("id, policy_id, text_content")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      console.error("Extract rules: fetch document error", fetchError);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (doc.text_content == null || doc.text_content === "") {
      return NextResponse.json(
        { error: "Document has no text_content; process the policy first" },
        { status: 400 }
      );
    }

    const policyId = doc.policy_id;
    if (!policyId) {
      return NextResponse.json(
        { error: "Document has no policy_id" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract credit policy rules and respond only with valid JSON. No markdown, no code fences.",
        },
        {
          role: "user",
          content: EXTRACTION_PROMPT + String(doc.text_content).slice(0, 100_000),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    let rules = parseRulesResponse(content);
    rules = rules.filter((r) => r.value.trim() !== "");
    rules = deduplicateRules(rules);

    if (rules.length === 0) {
      return NextResponse.json({
        success: true,
        rules_created: 0,
      });
    }

    const rows = rules.map((r) => ({
      policy_id: policyId,
      document_id: doc.id,
      rule_type: r.type,
      rule_value: r.value,
      rule_condition: r.condition ?? null,
      source_text: ruleSourceText(r.type),
    }));
    await supabase
      .from("policy_rules")
      .delete()
      .eq("document_id", doc.id);
    const { error: insertError } = await supabase
      .from("policy_rules")
      .insert(rows);

    if (insertError) {
      console.error("Extract rules: insert policy_rules error", insertError);
      return NextResponse.json(
        { error: "Failed to save rules", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rules_created: rows.length,
    });
  } catch (err) {
    console.error("Extract rules API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
