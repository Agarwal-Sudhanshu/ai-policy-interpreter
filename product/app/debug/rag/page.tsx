import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { PageContainer, PageHeader } from "@/components/ui";
import { DebugRagClient } from "./DebugRagClient";

export default async function DebugRagPage() {
  const serverSupabase = await createServerSupabase();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <PageContainer>
      <PageHeader
        title="RAG Debug"
        subtitle="Inspect vector and keyword retrieval results for policy Q&A (testing only)."
      />
      <DebugRagClient />
    </PageContainer>
  );
}
