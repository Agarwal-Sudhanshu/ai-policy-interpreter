"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/policies": "Policies",
  "/organizations": "Organizations",
  "/products": "Products",
  "/upload-policy": "Upload Policy",
};

function getTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/policies/") && pathname.includes("/eligibility"))
    return "Check Eligibility";
  if (pathname.startsWith("/policies/") && pathname.includes("/ask"))
    return "Ask Policy AI";
  if (pathname.startsWith("/policies/")) return "Policy Workspace";
  return "AI Credit Policy Copilot";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isGuest={!user} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header title={getTitle(pathname)} user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
