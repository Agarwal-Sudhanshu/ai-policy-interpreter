"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PageContainer,
  PageHeader,
  Card,
  ButtonLink,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
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
        action={
          <ButtonLink href="/app/upload" variant="primary">
            Upload Policy
          </ButtonLink>
        }
      />

      <Card padding={false}>
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : policies.length === 0 ? (
          <EmptyState
            message="No policies yet."
            action={
              <ButtonLink href="/app/upload" variant="primary">
                Upload Policy
              </ButtonLink>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-gray-900">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {p.products?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ButtonLink
                        href={`/app/policies/${p.id}`}
                        variant="secondary"
                      >
                        View Policy
                      </ButtonLink>
                      <ButtonLink
                        href={`/app/policies/${p.id}/ask`}
                        variant="secondary"
                      >
                        Ask AI
                      </ButtonLink>
                      <ButtonLink
                        href={`/app/policies/${p.id}/eligibility`}
                        variant="secondary"
                      >
                        Check Eligibility
                      </ButtonLink>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}
