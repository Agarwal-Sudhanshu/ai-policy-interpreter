"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGuestSessionId } from "@/lib/guestSession";

type Usage = {
  questions_remaining: number;
  eligibility_remaining: number;
};

export function DashboardGuestUsage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guestId = getGuestSessionId();
    if (!guestId) {
      setLoading(false);
      return;
    }
    fetch(`/api/guest-usage?guest_session_id=${encodeURIComponent(guestId)}`)
      .then((res) => res.json())
      .then((data: Usage) => setUsage(data))
      .catch(() => setUsage(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !usage) return null;

  const limitReached =
    usage.questions_remaining <= 0 && usage.eligibility_remaining <= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-900">Guest mode</p>
      <p className="mt-1 text-sm text-gray-600">
        Questions remaining: {usage.questions_remaining} · Eligibility checks
        remaining: {usage.eligibility_remaining}
      </p>
      {limitReached && (
        <p className="mt-2 text-sm text-amber-700">
          <Link href="/signup" className="font-medium underline hover:no-underline">
            Create free account to continue
          </Link>
        </p>
      )}
    </div>
  );
}
