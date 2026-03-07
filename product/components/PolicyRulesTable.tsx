type Rule = {
  rule_type: string;
  rule_value: string;
  rule_condition?: string | null;
};

const RULE_LABELS: Record<string, string> = {
  loan_type: "Loan Type",
  max_ltv: "Maximum LTV",
  max_foir: "Maximum FOIR",
  min_income: "Minimum Income",
  min_cibil: "Minimum CIBIL",
  age_min: "Age Min",
  age_max: "Age Max",
  eligible_occupations: "Eligible Occupations",
};

function getLabel(type: string): string {
  return (
    RULE_LABELS[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatValue(type: string, value: string): string {
  if (type === "min_income") {
    const n = Number(String(value).replace(/[₹,\s]/g, ""));
    if (Number.isFinite(n)) return `₹${n.toLocaleString("en-IN")}`;
  }
  return value;
}

type PolicyRulesTableProps = {
  rules: Rule[];
};

export function PolicyRulesTable({ rules }: PolicyRulesTableProps) {
  if (rules.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500">
        No rules extracted yet. Upload and process a policy document first.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Rule Type
            </th>
            <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Parameter
            </th>
            <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rules.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {getLabel(r.rule_type)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {r.rule_condition ?? "—"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {formatValue(r.rule_type, r.rule_value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
