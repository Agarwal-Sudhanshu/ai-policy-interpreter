"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Upload,
  CheckCircle2,
  MessageSquare,
  Settings,
  Building2,
  Package,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Policies", href: "/app/policies", icon: FileText },
  { label: "Organizations", href: "/app/organizations", icon: Building2 },
  { label: "Products", href: "/app/products", icon: Package },
  { label: "Upload Policy", href: "/app/upload", guestsDisabled: true, icon: Upload },
  { label: "Settings", href: "/app/settings", icon: Settings },
] as const;

const POLICY_ACTIONS = [
  { label: "Eligibility Checker", slug: "eligibility", icon: CheckCircle2 },
  { label: "Ask Policy AI", slug: "ask", icon: MessageSquare },
] as const;

function getPolicyIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  if (segments[1] === "app" && segments[2] === "policies" && segments[3] && segments[3] !== "create")
    return segments[3];
  return null;
}

type SidebarProps = { isGuest?: boolean };

export function Sidebar({ isGuest }: SidebarProps) {
  const pathname = usePathname();
  const policyId = getPolicyIdFromPath(pathname);

  return (
    <aside className="flex w-[240px] flex-col border-r border-gray-200 bg-white shrink-0">
      <div className="flex h-14 items-center border-b border-gray-200 px-5">
        <span className="text-sm font-semibold text-gray-900">
          AI Credit Policy Copilot
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const { label, href, icon: Icon } = item;
          const guestsDisabled = "guestsDisabled" in item && item.guestsDisabled;
          const disabled = isGuest && guestsDisabled;
          const isActive =
            !disabled &&
            (pathname === href ||
              (href !== "/app/dashboard" && pathname.startsWith(href + "/")));
          if (disabled) {
            return (
              <span
                key={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400"
                title="Sign in to upload policies"
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {label}
              </span>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {label}
            </Link>
          );
        })}
        {policyId && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Policy actions
            </p>
            <div className="space-y-1">
              {POLICY_ACTIONS.map(({ label, slug, icon: Icon }) => {
                const href = `/app/policies/${policyId}/${slug}`;
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
