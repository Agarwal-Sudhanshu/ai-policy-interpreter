import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  primaryButton?: { label: string; href: string };
  secondaryButton?: { label: string; href: string };
};

export function PolicyHero({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
}: Props) {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          {subtitle}
        </p>
        {(primaryButton || secondaryButton) && (
          <div className="mt-8 flex flex-wrap gap-4">
            {primaryButton && (
              <Link
                href={primaryButton.href}
                className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
              >
                {primaryButton.label}
              </Link>
            )}
            {secondaryButton && (
              <Link
                href={secondaryButton.href}
                className="inline-flex rounded-xl border border-white/60 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {secondaryButton.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
