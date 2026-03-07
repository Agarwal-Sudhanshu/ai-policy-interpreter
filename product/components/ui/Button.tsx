import Link from "next/link";

const base =
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 px-4 py-2.5",
  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2.5",
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
