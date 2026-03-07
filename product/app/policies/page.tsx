"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PageContainer,
  PageHeader,
  Card,
  ButtonLink,
  EmptyState,
} from "@/components/ui";

type PolicyRow = {
  id: string;
  product_id: string;
  name: string;
  status: string;
  created_at: string;
  products: { name: string } | null;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/policies/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load policies");
        return res.json();
      })
      .then((data: PolicyRow[]) => {
        if (!cancelled) setPolicies(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer spacing={6}>
      <PageHeader
        title="All Policies"
        action={<ButtonLink href="/policies/create" variant="secondary">Create Policy</ButtonLink>}
      />

      <Card>
        {loading ? (
          <EmptyState message="Loading policies…" />
        ) : error ? (
          <EmptyState message={error} />
        ) : policies.length === 0 ? (
          <EmptyState
            message={
              <>
                No policies yet.{" "}
                <Link href="/policies/create" className="font-medium text-gray-900 underline">
                  Create one
                </Link>{" "}
                or{" "}
                <Link href="/upload-policy" className="font-medium text-gray-900 underline">
                  upload a policy document
                </Link>
                .
              </>
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Policy Name
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created Date
                </th>
                <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {p.products?.name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/policies/${p.id}`}
                      className="font-medium text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
