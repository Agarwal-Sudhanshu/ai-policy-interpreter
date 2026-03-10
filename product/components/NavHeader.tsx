"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { LogoutButton } from "./LogoutButton";

export function NavHeader() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link
            href="/app/organizations"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Organizations
          </Link>
          <Link
            href="/app/products"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Products
          </Link>
          <Link
            href="/app/policies"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Policies
          </Link>
          <Link
            href="/app/upload"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Upload Policy
          </Link>
        </div>
        <LogoutButton />
      </nav>
    </header>
  );
}
