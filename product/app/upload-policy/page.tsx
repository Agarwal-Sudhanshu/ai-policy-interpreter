"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Select,
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

export default function UploadPolicyPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [policiesError, setPoliciesError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [uploadStatusVariant, setUploadStatusVariant] = useState<"success" | "warning" | "error" | "info">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getUploadStatus(data: {
    success?: boolean;
    status?: string;
    text_extracted?: boolean;
    rules_extracted?: boolean;
  }): { message: string; variant: "success" | "warning" | "error" | "info" } {
    if (data.status === "processing") {
      return {
        message: "Policy uploaded. Processing policy and extracting rules in the background.",
        variant: "info",
      };
    }
    if (data.text_extracted === true && data.rules_extracted === true) {
      return {
        message: "Policy uploaded and processed successfully. Rules extracted.",
        variant: "success",
      };
    }
    if (data.text_extracted === true && data.rules_extracted === false) {
      return {
        message: "Policy uploaded and text extracted, but rule extraction failed.",
        variant: "warning",
      };
    }
    if (data.text_extracted === false) {
      return {
        message: "Policy uploaded but text extraction failed.",
        variant: "error",
      };
    }
    return {
      message: "Policy uploaded. Processing policy and extracting rules in the background.",
      variant: "info",
    };
  }

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
      setSelectedPolicyId("");
      setPoliciesError(null);
      return;
    }
    setPoliciesLoading(true);
    setPoliciesError(null);
    setSelectedPolicyId("");
    try {
      const res = await fetch(`/api/policies?product_id=${encodeURIComponent(selectedProductId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.details ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setPolicies(list);
      if (list.length > 0) setSelectedPolicyId(list[0].id);
    } catch (err) {
      setPoliciesError(err instanceof Error ? err.message : "Failed to load policies");
      setPolicies([]);
      setSelectedPolicyId("");
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
    setUploadError(null);
    setUploadSuccess(false);
    setUploadStatusMessage(null);
    setUploadStatusVariant("info");
    if (!file) {
      setUploadError("Please choose a PDF file");
      return;
    }
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed");
      return;
    }
    if (!selectedOrgId || !selectedProductId || !selectedPolicyId) {
      setUploadError("Please select organization, product, and policy");
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("organization_id", selectedOrgId);
      formData.append("product_id", selectedProductId);
      formData.append("policy_id", selectedPolicyId);
      const res = await fetch("/api/upload-policy", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? data.details ?? `Upload failed: ${res.status}`);
      }
      setUploadSuccess(true);
      const status = getUploadStatus(data);
      setUploadStatusMessage(status.message);
      setUploadStatusVariant(status.variant);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Upload Policy Document"
        back={{ href: "/", label: "← Home" }}
      />

      <Card>
        <Section title="Step 1 — Select Organization">
          {orgsLoading ? (
            <p className="text-sm text-gray-500">Loading organizations…</p>
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
        <Section title="Step 2 — Select Product">
          {!selectedOrgId ? (
            <p className="text-sm text-gray-500">Select an organization first.</p>
          ) : productsLoading ? (
            <p className="text-sm text-gray-500">Loading products…</p>
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

      <Card>
        <Section title="Step 3 — Select Policy">
          {!selectedProductId ? (
            <p className="text-sm text-gray-500">Select a product first.</p>
          ) : policiesLoading ? (
            <p className="text-sm text-gray-500">Loading policies…</p>
          ) : policiesError ? (
            <Alert>{policiesError}</Alert>
          ) : policies.length === 0 ? (
            <p className="text-sm text-gray-500">
              No policies. <Link href="/policies" className="underline">Add one</Link> first.
            </p>
          ) : (
            <Select
              label="Policy"
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              options={[
                { value: "", label: "Select policy…" },
                ...policies.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          )}
        </Section>
      </Card>

      <Card>
        <Section title="Step 4 — Upload Policy PDF">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="policy-file"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Policy document (PDF only)
              </label>
              <input
                ref={fileInputRef}
                id="policy-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
                disabled={uploadLoading || !selectedPolicyId}
              />
              {file && (
                <p className="mt-1 text-xs text-gray-500">Selected: {file.name}</p>
              )}
            </div>
            {uploadError && <Alert>{uploadError}</Alert>}
            <Button
              type="submit"
              disabled={uploadLoading || !selectedPolicyId || !file}
              className="w-full"
            >
              {uploadLoading ? "Uploading…" : "Upload"}
            </Button>
          </form>
          {uploadSuccess && uploadStatusMessage && (
            <div
              className={
                uploadStatusVariant === "success"
                  ? "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                  : uploadStatusVariant === "warning"
                    ? "mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                    : uploadStatusVariant === "error"
                      ? "mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                      : "mt-4 rounded-lg border border-gray-200 bg-gray-100 p-4 text-sm text-gray-800"
              }
              role="status"
            >
              {uploadStatusMessage}
            </div>
          )}
        </Section>
      </Card>
    </PageContainer>
  );
}
