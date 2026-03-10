import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-[#2563EB] text-white hover:bg-[#1d4ed8] px-4 py-2.5",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2.5",
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

type ButtonLinkProps = {
  variant?: keyof typeof variants;
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  href,
  children,
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
