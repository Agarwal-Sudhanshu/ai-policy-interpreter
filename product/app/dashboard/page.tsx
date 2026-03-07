import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  Card,
  MetricCard,
  PageContainer,
  EmptyState,
} from "@/components/ui";
import { DashboardGuestUsage } from "./DashboardGuestUsage";

type PolicyWithProduct = {
  id: string;
  name: string;
  created_at: string;
  is_demo?: boolean;
  products: { name: string } | { name: string }[] | null;
};

async function getMetrics(userId: string | null) {
  let totalPolicies = 0;
  let totalQuestions = 0;
  let totalEligibility = 0;

  try {
    let policiesQuery = supabase
      .from("policies")
      .select("id", { count: "exact", head: true });
    if (userId) {
      policiesQuery = policiesQuery.or(`is_demo.eq.true,owner_user_id.eq.${userId}`);
    } else {
      policiesQuery = policiesQuery.eq("is_demo", true);
    }
    const policiesRes = await policiesQuery;
    totalPolicies = policiesRes.error ? 0 : policiesRes.count ?? 0;
  } catch {
    totalPolicies = 0;
  }

  try {
    const qRes = await supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "question_asked");
    totalQuestions = qRes.error ? 0 : qRes.count ?? 0;
    const eRes = await supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "eligibility_checked");
    totalEligibility = eRes.error ? 0 : eRes.count ?? 0;
  } catch {
    // usage_events table may not exist
  }

  return { totalPolicies, totalQuestions, totalEligibility };
}

async function getDemoPolicies(): Promise<PolicyWithProduct[]> {
  try {
    const { data, error } = await supabase
      .from("policies")
      .select("id, name, created_at, is_demo, products(name)")
      .eq("is_demo", true)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return [];
    return (data ?? []) as PolicyWithProduct[];
  } catch {
    return [];
  }
}

async function getYourPolicies(userId: string): Promise<PolicyWithProduct[]> {
  try {
    const { data, error } = await supabase
      .from("policies")
      .select("id, name, created_at, is_demo, products(name)")
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return [];
    return (data ?? []) as PolicyWithProduct[];
  } catch {
    return [];
  }
}

function PolicyList({
  policies,
  emptyMessage,
}: {
  policies: PolicyWithProduct[];
  emptyMessage: string;
}) {
  if (policies.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="divide-y divide-gray-200">
      {policies.map((p) => (
        <Link
          key={p.id}
          href={`/policies/${p.id}`}
          className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500">
              {Array.isArray(p.products)
                ? p.products[0]?.name ?? "—"
                : p.products?.name ?? "—"}{" "}
              · {new Date(p.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-600">View →</span>
        </Link>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const serverSupabase = await createServerSupabase();
  const { data: { user } } = await serverSupabase.auth.getUser();

  const [metrics, demoPolicies, yourPolicies] = await Promise.all([
    getMetrics(user?.id ?? null),
    getDemoPolicies(),
    user?.id ? getYourPolicies(user.id) : Promise.resolve([]),
  ]);

  return (
    <PageContainer>
      {!user && <DashboardGuestUsage />}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total Policies" value={metrics.totalPolicies} />
        <MetricCard
          label="Total Questions Asked"
          value={metrics.totalQuestions}
        />
        <MetricCard
          label="Total Eligibility Checks"
          value={metrics.totalEligibility}
        />
      </div>

      <Card title="Demo Policies" padding={false}>
        <PolicyList
          policies={demoPolicies}
          emptyMessage="No demo policies available yet."
        />
      </Card>

      {user && (
        <Card title="Your Policies" padding={false}>
          <PolicyList
            policies={yourPolicies}
            emptyMessage="No policies yet. Create one from Policies or upload a document."
          />
        </Card>
      )}
    </PageContainer>
  );
}
