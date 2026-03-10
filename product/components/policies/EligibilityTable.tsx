type Row = { parameter: string; requirement: string };

type Props = {
  rows: Row[];
  title?: string;
};

export function EligibilityTable({ rows, title = "Eligibility at a glance" }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {title && (
        <h3 className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-lg font-semibold text-slate-900">
          {title}
        </h3>
      )}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-sm font-semibold text-slate-700">
              Parameter
            </th>
            <th className="px-6 py-3 text-sm font-semibold text-slate-700">
              Typical Requirement
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.parameter}
              className={
                i < rows.length - 1
                  ? "border-b border-slate-100"
                  : ""
              }
            >
              <td className="px-6 py-4 text-slate-700">{row.parameter}</td>
              <td className="px-6 py-4 text-slate-900 font-medium">
                {row.requirement}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
