"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function SessionLoading() {
  const { loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!loading || isAuthPage) return null;

  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking session…</p>
    </div>
  );
}
