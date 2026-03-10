"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

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

export default function ProductsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!orgsLoading && organizations.length > 0 && selectedOrgId === "") {
      setSelectedOrgId(organizations[0].id);
    }
  }, [orgsLoading, organizations, selectedOrgId]);

  const fetchProducts = useCallback(async () => {
    if (!selectedOrgId) {
      setProducts([]);
      setProductsError(null);
      return;
    }
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await fetch(`/api/products?organization_id=${encodeURIComponent(selectedOrgId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const trimmedName = productName.trim();
    if (!trimmedName) {
      setSubmitError("Product name is required");
      return;
    }
    if (!selectedOrgId) {
      setSubmitError("Please select an organization");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, organization_id: selectedOrgId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      setProductName("");
      await fetchProducts();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Products
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
        </div>

        {/* Step 1: Select Organization */}
        <section className="mb-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Step 1 — Select Organization
          </h2>
          {orgsLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading organizations…</p>
          ) : orgsError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {orgsError}
            </p>
          ) : organizations.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No organizations. <Link href="/app/organizations" className="underline">Add one</Link> first.
            </p>
          ) : (
            <label className="block">
              <span className="sr-only">Organization</span>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                <option value="">Select organization…</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                    {org.type ? ` (${org.type})` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        {/* Step 2: Add Product */}
        <section className="mb-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Step 2 — Add Product
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="product-name"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Product Name
              </label>
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Housing Loan"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                disabled={submitLoading || !selectedOrgId}
              />
            </div>
            {submitError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitLoading || !selectedOrgId}
              className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 py-2.5 px-4 font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {submitLoading ? "Adding…" : "Add Product"}
            </button>
          </form>
        </section>

        {/* Step 3: Products List */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Step 3 — Products
          </h2>
          {!selectedOrgId ? (
            <p className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Select an organization to view products.
            </p>
          ) : productsLoading ? (
            <p className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading products…
            </p>
          ) : productsError ? (
            <p
              className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 text-center text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {productsError}
            </p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No products yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
