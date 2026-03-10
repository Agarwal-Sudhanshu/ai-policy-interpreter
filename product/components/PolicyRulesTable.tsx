import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

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
      <p className="px-6 py-8 text-center text-sm text-gray-500">
        No rules extracted yet. Upload and process a policy document first.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule Type</TableHead>
          <TableHead>Parameter</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium text-gray-900">
              {getLabel(r.rule_type)}
            </TableCell>
            <TableCell className="text-gray-600">
              {r.rule_condition ?? "—"}
            </TableCell>
            <TableCell className="text-gray-600">
              {formatValue(r.rule_type, r.rule_value)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
