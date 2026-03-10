"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const TITLES: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/policies": "Policies",
  "/app/organizations": "Organizations",
  "/app/products": "Products",
  "/app/upload": "Upload Policy",
  "/app/settings": "Settings",
};

function getTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/app/policies/") && pathname.includes("/eligibility"))
    return "Check Eligibility";
  if (pathname.startsWith("/app/policies/") && pathname.includes("/ask"))
    return "Ask Policy AI";
  if (pathname.startsWith("/app/policies/")) return "Policy Workspace";
  if (pathname.startsWith("/app/settings")) return "Settings";
  return "AI Credit Policy Copilot";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isGuest={!user} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header title={getTitle(pathname)} user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
