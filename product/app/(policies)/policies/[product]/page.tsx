import Link from "next/link";

type Props = { params: Promise<{ product: string }> };

export default async function PolicyProductPage({ params }: Props) {
  const { product } = await params;
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Policy: {decodeURIComponent(product)}
      </h1>
      <p className="text-gray-600 mb-4">Explore this policy category.</p>
      <Link href="/policies" className="text-sm text-gray-600 hover:underline">← Explore</Link>
      {" · "}
      <Link href="/app/dashboard" className="text-sm text-gray-600 hover:underline">App</Link>
    </div>
  );
}
