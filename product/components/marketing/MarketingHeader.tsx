"use client";

import Link from "next/link";

const nav = [
  { label: "Product", href: "/product" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Policies", href: "/policies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0">
          <span className="block text-lg font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            PolicyCopilot
          </span>
          <span className="block text-xs text-slate-500">
            AI Credit Policy Copilot
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
