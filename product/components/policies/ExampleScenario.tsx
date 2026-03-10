import Link from "next/link";

type Props = {
  title: string;
  inputs: { label: string; value: string }[];
  result: string;
  resultVariant?: "pass" | "fail" | "neutral";
  reasoning?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function ExampleScenario({
  title,
  inputs,
  result,
  resultVariant = "neutral",
  reasoning,
  ctaLabel,
  ctaHref,
}: Props) {
  const resultClass =
    resultVariant === "pass"
      ? "text-green-700 font-semibold"
      : resultVariant === "fail"
        ? "text-amber-700 font-semibold"
        : "text-slate-900 font-semibold";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Example inputs
        </p>
        <ul className="mt-2 space-y-1.5 text-slate-700">
          {inputs.map(({ label, value }) => (
            <li key={label}>
              {label}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Result
        </p>
        <p className={`mt-1.5 ${resultClass}`}>{result}</p>
        {reasoning && (
          <p className="mt-2 text-sm text-slate-600">{reasoning}</p>
        )}
      </div>
      {ctaLabel && ctaHref && (
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
