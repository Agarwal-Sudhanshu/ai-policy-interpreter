/**
 * Rule engine for conditional credit policy rules.
 * Supports only these fields: property_value, loan_amount, income, occupation, age.
 * Unsupported condition fields are rejected (evaluateCondition returns false).
 * Operators: <, <=, >, >=, =, AND, OR.
 *
 * Test examples:
 * Example 1: input { property_value: 2500000 } with rules max_ltv 80% (condition: "property_value <= 3000000")
 *   → selectApplicableRule returns 80%. Expected LTV = 80%.
 * Example 2: input { property_value: 6000000 } with rules max_ltv 75% (condition: "property_value > 3000000 AND property_value <= 7500000")
 *   → selectApplicableRule returns 75%. Expected LTV = 75%.
 * Example 3: input { occupation: "self-employed" } with rules max_foir 55% (condition: "occupation = self-employed")
 *   → selectApplicableRule returns 55%. Expected FOIR = 55%.
 */

const ALLOWED_FIELDS = new Set([
  "property_value",
  "loan_amount",
  "income",
  "occupation",
  "age",
]);

export type RuleEngineInput = {
  property_value: number;
  loan_amount: number;
  income: number;
  occupation: string;
  age: number;
};

export type RuleRow = {
  rule_type: string;
  rule_value: string;
  rule_condition?: string | null;
};

function normalizeOccupationForCondition(s: string): string {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function parseConditionValue(valueStr: string, field: string): number | string | null {
  const v = valueStr.trim();
  if (field === "occupation") {
    return normalizeOccupationForCondition(v.replace(/^["']|["']$/g, ""));
  }
  const withL = v.replace(/\s*[lL]\s*$/, "").trim();
  if (withL !== v) {
    const n = Number(withL.replace(/[,\s]/g, ""));
    return Number.isFinite(n) ? n * 100_000 : null;
  }
  const n = Number(v.replace(/[%,\s₹]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function getInputValue(input: RuleEngineInput, field: string): number | string | null {
  switch (field) {
    case "property_value":
      return input.property_value;
    case "loan_amount":
      return input.loan_amount;
    case "income":
      return input.income;
    case "occupation":
      return normalizeOccupationForCondition(input.occupation);
    case "age":
      return input.age;
    default:
      return null;
  }
}

const OP_REGEX = /^\s*(\w+)\s*(<=|>=|<|>|=)\s*(.+)$/;

function evaluateClause(
  clause: string,
  input: RuleEngineInput
): boolean | "invalid" {
  const m = clause.trim().match(OP_REGEX);
  if (!m) return "invalid";
  const [, field, op, valueStr] = m;
  if (!field || !ALLOWED_FIELDS.has(field)) return "invalid";
  const left = getInputValue(input, field);
  const right = parseConditionValue(valueStr, field);
  if (left === null || right === null) return false;
  if (typeof left === "string" && typeof right === "string") {
    switch (op) {
      case "=":
        return left === right;
      default:
        return false;
    }
  }
  if (typeof left === "number" && typeof right === "number") {
    switch (op) {
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case ">":
        return left > right;
      case ">=":
        return left >= right;
      case "=":
        return left === right;
      default:
        return false;
    }
  }
  return false;
}

/**
 * Evaluate a single condition string against the given input.
 * Supports OR and AND: split by OR first; each OR block may contain AND clauses.
 * If any OR block evaluates true (all its AND clauses true), return true.
 * Only allowed fields may appear; unsupported fields cause the condition to be rejected (false).
 *
 * Examples:
 * - "occupation = salaried OR occupation = self-employed"
 * - "property_value <= 3000000 OR loan_amount <= 2000000"
 * - "property_value <= 3000000 AND income >= 25000"
 */
export function evaluateCondition(
  condition: string | null | undefined,
  input: RuleEngineInput
): boolean {
  if (condition == null || String(condition).trim() === "") return true;
  const orBlocks = String(condition)
    .split(/\s+OR\s+/i)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const block of orBlocks) {
    const andClauses = block.split(/\s+AND\s+/i).map((c) => c.trim()).filter(Boolean);
    let blockTrue = true;
    for (const clause of andClauses) {
      const result = evaluateClause(clause, input);
      if (result === "invalid") return false;
      if (!result) {
        blockTrue = false;
        break;
      }
    }
    if (blockTrue) return true;
  }
  return false;
}

/**
 * Count atomic clauses in a condition (same structure as evaluateCondition: OR blocks, AND within each).
 * Example: "property_value <= 3000000 AND occupation = salaried" → 2.
 */
function countClauses(condition: string | null | undefined): number {
  if (!condition?.trim()) return 0;
  const orBlocks = String(condition).split(/\s+OR\s+/i).map((b) => b.trim()).filter(Boolean);
  let count = 0;
  for (const block of orBlocks) {
    const andClauses = block.split(/\s+AND\s+/i).map((c) => c.trim()).filter(Boolean);
    count += andClauses.length;
  }
  return count;
}

/**
 * From a list of rules of the same type (e.g. all max_ltv), select the single applicable rule
 * for the given input. Prefers conditional rules over unconditional; among matching conditional
 * rules, prefers the most specific (highest clause count). Fallback to unconditional rule if no condition matches.
 */
export function selectApplicableRule(
  rules: RuleRow[],
  input: RuleEngineInput
): RuleRow | null {
  const withCondition: RuleRow[] = [];
  const withoutCondition: RuleRow[] = [];
  for (const r of rules) {
    const cond = r.rule_condition?.trim();
    if (!cond) {
      withoutCondition.push(r);
      continue;
    }
    if (evaluateCondition(cond, input)) withCondition.push(r);
  }
  if (withCondition.length > 0) {
    withCondition.sort(
      (a, b) => countClauses(b.rule_condition) - countClauses(a.rule_condition)
    );
    return withCondition[0];
  }
  if (withoutCondition.length > 0) return withoutCondition[0];
  return null;
}
