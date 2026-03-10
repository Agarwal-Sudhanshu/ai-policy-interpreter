import Link from "next/link";

const footerLinks = [
  { label: "Product", href: "/product" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Policies", href: "/policies" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 max-w-xl text-sm text-slate-600">
          AI assistant for understanding credit policies and checking loan eligibility.
        </p>
        <nav className="mb-8 flex flex-wrap gap-6">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-slate-500">
          © AI Credit Policy Copilot
        </p>
      </div>
    </footer>
  );
}
