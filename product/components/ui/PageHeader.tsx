import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Back link label; href required for back to show */
  back?: { href: string; label: string };
  /** Right-side action (e.g. button or link) */
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {back?.href && (
          <Link
            href={back.href}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {back.label}
          </Link>
        )}
        {action}
      </div>
    </div>
  );
}
