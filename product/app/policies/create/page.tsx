"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Select,
  Input,
  Button,
  Alert,
} from "@/components/ui";

type Organization = {
  id: string;
  name: string;
  type: string | null;
  created_at: string;
};

type Product = {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
};

type Policy = {
  id: string;
  product_id: string;
  name: string;
  status: string;
  created_at: string;
};

export default function CreatePolicyPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [policyName, setPolicyName] = useState("");
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [policiesError, setPoliciesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrgsError(err instanceof Error ? err.message : "Failed to load organizations");
      setOrganizations([]);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!selectedOrgId) {
      setProducts([]);
      setSelectedProductId("");
      setProductsError(null);
      return;
    }
    setProductsLoading(true);
    setProductsError(null);
    setSelectedProductId("");
    try {
      const res = await fetch(`/api/products?organization_id=${encodeURIComponent(selectedOrgId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      if (list.length > 0) setSelectedProductId(list[0].id);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
      setSelectedProductId("");
    } finally {
      setProductsLoading(false);
    }
  }, [selectedOrgId]);

  const fetchPolicies = useCallback(async () => {
    if (!selectedProductId) {
      setPolicies([]);
      setPoliciesError(null);
      return;
    }
    setPoliciesLoading(true);
    setPoliciesError(null);
    try {
      const res = await fetch(`/api/policies?product_id=${encodeURIComponent(selectedProductId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      setPoliciesError(err instanceof Error ? err.message : "Failed to load policies");
      setPolicies([]);
    } finally {
      setPoliciesLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (!orgsLoading && organizations.length > 0 && selectedOrgId === "") {
      setSelectedOrgId(organizations[0].id);
    }
  }, [orgsLoading, organizations, selectedOrgId]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const trimmedName = policyName.trim();
    if (!trimmedName) {
      setSubmitError("Policy name is required");
      return;
    }
    if (!selectedProductId) {
      setSubmitError("Please select a product");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, product_id: selectedProductId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      setPolicyName("");
      await fetchPolicies();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add policy");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create Policy"
        back={{ href: "/policies", label: "← Back to Policies" }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Section title="Select Organization">
            {orgsLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : orgsError ? (
              <Alert>{orgsError}</Alert>
            ) : organizations.length === 0 ? (
              <p className="text-sm text-gray-500">
                No organizations. <Link href="/organizations" className="underline">Add one</Link> first.
              </p>
            ) : (
              <Select
                label="Organization"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                options={[
                  { value: "", label: "Select organization…" },
                  ...organizations.map((org) => ({
                    value: org.id,
                    label: `${org.name}${org.type ? ` (${org.type})` : ""}`,
                  })),
                ]}
              />
            )}
          </Section>
        </Card>

        <Card>
          <Section title="Select Product">
            {!selectedOrgId ? (
              <p className="text-sm text-gray-500">Select an organization first.</p>
            ) : productsLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : productsError ? (
              <Alert>{productsError}</Alert>
            ) : products.length === 0 ? (
              <p className="text-sm text-gray-500">
                No products. <Link href="/products" className="underline">Add one</Link> first.
              </p>
            ) : (
              <Select
                label="Product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                options={[
                  { value: "", label: "Select product…" },
                  ...products.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            )}
          </Section>
        </Card>
      </div>

      <Card>
        <Section title="Add Policy">
          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <Input
              label="Policy Name"
              id="policy-name"
              type="text"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="e.g. Retail Housing Credit Policy"
              disabled={submitLoading || !selectedProductId}
            />
            {submitError && <Alert>{submitError}</Alert>}
            <Button type="submit" disabled={submitLoading || !selectedProductId}>
              {submitLoading ? "Adding…" : "Add Policy"}
            </Button>
          </form>
        </Section>
      </Card>

      {selectedProductId && (
        <Card>
          <Section title="Policies in this product">
            {policiesLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : policiesError ? (
              <Alert>{policiesError}</Alert>
            ) : policies.length === 0 ? (
              <p className="text-sm text-gray-500">No policies yet. Add one above.</p>
            ) : (
              <ul className="space-y-2">
                {policies.map((policy) => (
                  <li key={policy.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
                    <span className="font-medium text-gray-900">{policy.name}</span>
                    <Link
                      href={`/policies/${policy.id}`}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </Card>
      )}
    </PageContainer>
  );
}
