import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
  children?: React.ReactNode;
};

export function PolicyCard({ title, description, href, children }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
    >
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
      {children}
    </Link>
  );
}
