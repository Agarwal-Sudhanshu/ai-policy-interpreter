type RuleItem = {
  title: string;
  content: string | string[];
};

type Props = {
  title: string;
  intro?: string;
  items: RuleItem[];
};

export function PolicyRuleSection({ title, intro, items }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {intro && <p className="text-slate-600">{intro}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            {typeof item.content === "string" ? (
              <p className="mt-2 text-slate-600">{item.content}</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                {item.content.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
