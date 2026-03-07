import { inngest } from "./client";
import { supabase } from "@/lib/supabase";

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.APP_URL ?? "http://localhost:3000";
}

async function updateDocumentStatus(
  documentId: string,
  status: "processing" | "completed" | "failed",
  processingError?: string | null
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({
      status,
      ...(status === "failed" && processingError != null
        ? { processing_error: processingError }
        : status === "completed"
          ? { processing_error: null }
          : {}),
    })
    .eq("id", documentId);
  if (error) {
    console.error("Failed to update document status", { document_id: documentId, status, error });
  }
}

export const processUploadedDocument = inngest.createFunction(
  {
    id: "process-uploaded-document",
    retries: 2,
  },
  { event: "document/uploaded" },
  async ({ event, step }) => {
    const start = Date.now();
    const { document_id } = event.data as { document_id: string };
    if (!document_id?.trim()) {
      throw new Error("document_id is required");
    }

    const docId = document_id.trim();
    console.log("Starting policy processing", { document_id: docId });

    try {
      const baseUrl = getBaseUrl();
      const secret = process.env.INTERNAL_API_SECRET ?? "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(secret ? { "x-internal-secret": secret } : {}),
      };

      console.log("Extracting PDF text");
      await step.run("process-policy", async () => {
        const res = await fetch(`${baseUrl}/api/process-policy`, {
          method: "POST",
          headers,
          body: JSON.stringify({ document_id: docId }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`process-policy failed: ${res.status} ${text.slice(0, 200)}`);
        }
        return { ok: true };
      });
      console.log("Text extraction completed");

      console.log("Extracting policy rules");
      const extractResult = await step.run("extract-rules", async () => {
        const res = await fetch(`${baseUrl}/api/extract-rules`, {
          method: "POST",
          headers,
          body: JSON.stringify({ document_id: docId }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`extract-rules failed: ${res.status} ${text.slice(0, 200)}`);
        }
        const data = (await res.json().catch(() => ({}))) as { rules_created?: number };
        return { ok: true, rules_count: data.rules_created ?? null };
      });
      console.log("Policy rule extraction completed", {
        rules_count: extractResult?.rules_count ?? undefined,
      });

      console.log("Generating policy chunks for RAG");
      await step.run("generate-policy-chunks", async () => {
        const res = await fetch(`${baseUrl}/api/generate-policy-chunks`, {
          method: "POST",
          headers,
          body: JSON.stringify({ document_id: docId }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`generate-policy-chunks failed: ${res.status} ${text.slice(0, 200)}`);
        }
        const data = (await res.json().catch(() => ({}))) as { chunks_created?: number };
        return { ok: true, chunks_created: data.chunks_created ?? null };
      });
      console.log("Policy chunks generation completed");

      await updateDocumentStatus(docId, "completed");
      console.log("Policy processing completed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Policy processing failed", error);
      await updateDocumentStatus(docId, "failed", message);
      throw error;
    } finally {
      const duration_ms = Date.now() - start;
      console.log("Processing duration", { document_id: docId, duration_ms });
    }

    return { document_id: docId };
  }
);
