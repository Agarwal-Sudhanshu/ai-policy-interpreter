import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";
import { PolicyRulesTable } from "@/components/PolicyRulesTable";
import {
  PageContainer,
  PageHeader,
  Section,
  ButtonLink,
} from "@/components/ui";

type Props = { params: Promise<{ policy_id: string }> };

export default async function PolicyWorkspacePage({ params }: Props) {
  const { policy_id } = await params;
  if (!policy_id?.trim()) notFound();

  const serverSupabase = await createServerSupabase();
  const { data: { user } } = await serverSupabase.auth.getUser();

  const [policyRes, docRes] = await Promise.all([
    supabase
      .from("policies")
      .select("id, name, is_demo, owner_user_id")
      .eq("id", policy_id.trim())
      .single(),
    supabase
      .from("documents")
      .select("id, uploaded_at, version")
      .eq("policy_id", policy_id.trim())
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const rulesRes =
    docRes.data?.id != null
      ? await supabase
          .from("policy_rules")
          .select("rule_type, rule_value, rule_condition")
          .eq("document_id", docRes.data.id)
          .order("rule_type")
      : { data: [] as { rule_type: string; rule_value: string; rule_condition: string | null }[] | null, error: null };

  if (policyRes.error || !policyRes.data) notFound();

  const policy = policyRes.data as typeof policyRes.data & {
    is_demo?: boolean;
    owner_user_id?: string | null;
  };
  const canView =
    policy.is_demo === true || (user?.id && policy.owner_user_id === user.id);
  if (!canView) notFound();

  const { is_demo: _d, owner_user_id: _o, ...policyDisplay } = policy;
  const uploadDate = docRes.data?.uploaded_at
    ? new Date(docRes.data.uploaded_at).toLocaleDateString()
    : null;
  const rules = rulesRes.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={policyDisplay.name}
        subtitle={uploadDate ? `Uploaded: ${uploadDate}` : undefined}
        back={{ href: "/policies", label: "← Back to Policies" }}
      />

      <Section title="Extracted Rules">
        <PolicyRulesTable rules={rules} />
      </Section>

      <div className="flex flex-wrap gap-4">
        <ButtonLink href={`/policies/${policy_id}/eligibility`}>
          Check Eligibility
        </ButtonLink>
        <ButtonLink href={`/policies/${policy_id}/ask`} variant="secondary">
          Ask Policy AI
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
