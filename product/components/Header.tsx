"use client";

import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import type { User } from "@supabase/supabase-js";

type HeaderProps = {
  title?: string;
  user?: User | null;
};

export function Header({ title, user }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      {title && (
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <LogoutButton />
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-gray-200 bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
