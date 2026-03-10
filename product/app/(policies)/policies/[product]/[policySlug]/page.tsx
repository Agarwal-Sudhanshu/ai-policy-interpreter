import Link from "next/link";

type Props = { params: Promise<{ product: string; policySlug: string }> };

export default async function PolicySlugPage({ params }: Props) {
  const { product, policySlug } = await params;
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Product: {decodeURIComponent(product)}
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Policy: {decodeURIComponent(policySlug)}
      </p>
      <Link href={`/policies/${encodeURIComponent(product)}`} className="text-sm text-gray-600 hover:underline">← Product</Link>
      {" · "}
      <Link href="/policies" className="text-sm text-gray-600 hover:underline">Policies</Link>
      {" · "}
      <Link href="/app/dashboard" className="text-sm text-gray-600 hover:underline">App</Link>
    </div>
  );
}
