import Link from "next/link";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Explore policies</h1>
      <p className="text-gray-600 mb-4">Browse policy categories and loan products.</p>
      <Link href="/" className="text-sm text-gray-600 hover:underline">← Home</Link>
      {" · "}
      <Link href="/app/dashboard" className="text-sm text-gray-600 hover:underline">App</Link>
    </div>
  );
}
