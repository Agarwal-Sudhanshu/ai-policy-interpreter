export const runtime = "nodejs";

/// <reference path="../../../pdf-parse.d.ts" />
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as unknown as { DOMMatrix: unknown }).DOMMatrix = class {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    static fromMatrix() {
      return new (this as unknown as new () => unknown)();
    }
  };
}

const BUCKET = "credit-policy-documents";
const MAX_TEXT_LENGTH = 100_000;

function cleanText(text: string): string {
  const trimmed = text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
  return trimmed.length > MAX_TEXT_LENGTH
    ? trimmed.slice(0, MAX_TEXT_LENGTH)
    : trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const documentId =
      typeof body.document_id === "string" ? body.document_id.trim() : "";

    if (!documentId) {
      return NextResponse.json(
        { error: "document_id is required" },
        { status: 400 }
      );
    }

    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("id, file_path, policy_id")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      console.error("Process policy: fetch document error", fetchError);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const filePath = doc.file_path;
    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json(
        { error: "Document has no file_path" },
        { status: 400 }
      );
    }

    const { data: blob, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(filePath);

    if (downloadError || !blob) {
      console.error("Process policy: storage download error", downloadError);
      return NextResponse.json(
        { error: "Failed to download file from storage" },
        { status: 500 }
      );
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfModule = await import("pdf-parse");
    const mod = pdfModule as { default?: (buf: Buffer) => Promise<{ text?: string }>; PDFParse?: new (opts: { data: Buffer }) => { getText: () => Promise<{ text?: string }>; destroy?: () => Promise<void> } };
    let rawText = "";
    if (typeof mod.default === "function") {
      const result = await mod.default(buffer);
      rawText = (result && typeof result.text === "string") ? result.text : "";
    } else if (typeof mod.PDFParse === "function") {
      const parser = new mod.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        rawText = (result && typeof result.text === "string") ? result.text : "";
      } finally {
        if (typeof parser.destroy === "function") await parser.destroy();
      }
    } else {
      return NextResponse.json(
        { error: "PDF parsing not available" },
        { status: 500 }
      );
    }
    const text = cleanText(rawText);

    const { error: updateError } = await supabase
      .from("documents")
      .update({ text_content: text })
      .eq("id", documentId);

    if (updateError) {
      console.error("Process policy: update document error", updateError);
      return NextResponse.json(
        { error: "Failed to update document", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      text_length: text.length,
    });
  } catch (err) {
    console.error("Process policy API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
