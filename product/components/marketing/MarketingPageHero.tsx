import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  decorationIcon?: LucideIcon;
};

export function MarketingPageHero({
  title,
  subtitle,
  decorationIcon: DecorationIcon,
}: Props) {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">
              {subtitle}
            </p>
          </div>
          {DecorationIcon && (
            <div
              className="flex shrink-0 items-center justify-end"
              aria-hidden
            >
              <DecorationIcon className="h-32 w-32 text-white opacity-10 md:h-40 md:w-40" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
