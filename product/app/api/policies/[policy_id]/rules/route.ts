import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ policy_id: string }> }
) {
  try {
    const { policy_id } = await params;
    if (!policy_id?.trim()) {
      return NextResponse.json(
        { error: "policy_id is required" },
        { status: 400 }
      );
    }

    const policyId = policy_id.trim();

    const { data: latestDoc } = await supabase
      .from("documents")
      .select("id")
      .eq("policy_id", policyId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestDoc?.id) {
      return NextResponse.json({ rules: [] });
    }

    const { data, error } = await supabase
      .from("policy_rules")
      .select("rule_type, rule_value, rule_condition, source_text")
      .eq("document_id", latestDoc.id)
      .order("rule_type");

    if (error) {
      console.error("Supabase GET policy_rules error:", error);
      return NextResponse.json(
        { error: "Failed to fetch rules", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ rules: data ?? [] });
  } catch (err) {
    console.error("Policy rules API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
