"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Organizations", href: "/organizations" },
  { label: "Products", href: "/products" },
  { label: "Policies", href: "/policies" },
  { label: "Upload Policy", href: "/upload-policy", guestsDisabled: true },
] as const;

const POLICY_ACTIONS = [
  { label: "Check Eligibility", slug: "eligibility" },
  { label: "Ask Policy AI", slug: "ask" },
] as const;

function getPolicyIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  if (segments[1] !== "policies" || !segments[2] || segments[2] === "create")
    return null;
  return segments[2];
}

type SidebarProps = { isGuest?: boolean };

export function Sidebar({ isGuest }: SidebarProps) {
  const pathname = usePathname();
  const policyId = getPolicyIdFromPath(pathname);

  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-sm font-semibold text-gray-900">
          AI Credit Policy Copilot
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => {
          const { label, href } = item;
          const guestsDisabled = "guestsDisabled" in item && item.guestsDisabled;
          const disabled = isGuest && guestsDisabled;
          const isActive =
            !disabled &&
            (pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href + "/")));
          if (disabled) {
            return (
              <span
                key={href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400"
                title="Sign in to upload policies"
              >
                {label}
              </span>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
        {policyId && (
          <div className="pt-3 mt-3 border-t border-gray-200">
            <p className="px-3 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Policy actions
            </p>
            {POLICY_ACTIONS.map(({ label, slug }) => {
              const href = `/policies/${policyId}/${slug}`;
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
