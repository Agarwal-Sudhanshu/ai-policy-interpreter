import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/trackEvent";
import { inngest } from "@/lib/inngest/client";

const BUCKET = "credit-policy-documents";
const PDF_MIME = "application/pdf";

function isPdfFile(file: File): boolean {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type === PDF_MIME || name.endsWith(".pdf");
}

function trimUuid(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();

    const formData = await request.formData();
    const file = formData.get("file");
    const organizationId = trimUuid(formData.get("organization_id"));
    const productId = trimUuid(formData.get("product_id"));
    const policyId = trimUuid(formData.get("policy_id"));

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!isPdfFile(file)) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (!organizationId || !productId || !policyId) {
      return NextResponse.json(
        { error: "organization_id, product_id, and policy_id are required" },
        { status: 400 }
      );
    }

    const { data: maxVersionRow } = await supabase
      .from("documents")
      .select("version")
      .eq("policy_id", policyId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (maxVersionRow?.version != null ? Number(maxVersionRow.version) : 0) + 1;
    const filePath = `${organizationId}/${productId}/${policyId}/v${nextVersion}/policy.pdf`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: PDF_MIME,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed", details: uploadError.message },
        { status: 500 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        policy_id: policyId,
        file_path: filePath,
        version: nextVersion,
        original_filename: file.name,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError || !inserted?.id) {
      console.error("Supabase documents insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save document record", details: insertError?.message },
        { status: 500 }
      );
    }

    const documentId = inserted.id;

    await inngest.send({
      name: "document/uploaded",
      data: { document_id: documentId },
    });

    if (user?.id) {
      trackEvent({ userId: user.id, event: "policy_uploaded" }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: "processing",
    });
  } catch (err) {
    console.error("Upload policy API error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
