export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;
const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHUNK_LENGTH = 800;

/** Split text into overlapping chunks. size 800, overlap 150. */
function chunkText(
  text: string,
  size: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < trimmed.length) {
    let end = Math.min(start + size, trimmed.length);
    let chunk = trimmed.slice(start, end);
    if (end < trimmed.length && chunk.includes(" ")) {
      const lastSpace = chunk.lastIndexOf(" ");
      if (lastSpace > size / 2) {
        end = start + lastSpace + 1;
        chunk = trimmed.slice(start, end);
      }
    }
    if (chunk.trim()) chunks.push(chunk.trim());
    start = end >= trimmed.length ? trimmed.length : end - overlap;
    if (start >= trimmed.length) break;
  }
  return chunks;
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
      .select("id, policy_id, text_content")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      console.error("Generate policy chunks: fetch document error", fetchError);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const textContent = doc.text_content;
    if (textContent == null || String(textContent).trim() === "") {
      return NextResponse.json({
        success: true,
        chunks_created: 0,
        message: "No text_content; skipping chunk generation",
      });
    }

    const policyId = doc.policy_id;
    if (!policyId) {
      return NextResponse.json(
        { error: "Document has no policy_id" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const chunksClient = supabaseAdmin ?? supabase;
    await chunksClient
      .from("policy_chunks")
      .delete()
      .eq("document_id", doc.id);

    const rawChunks = chunkText(String(textContent), CHUNK_SIZE, CHUNK_OVERLAP);
    let chunks = rawChunks.map((c) =>
      c.length > MAX_CHUNK_LENGTH ? c.slice(0, MAX_CHUNK_LENGTH) : c
    );

    if (chunks.length > 200) {
      console.log("Chunk limit exceeded, truncating", {
        document_id: doc.id,
        original: chunks.length,
      });
      chunks = chunks.slice(0, 200);
    }

    if (chunks.length === 0) {
      return NextResponse.json({
        success: true,
        chunks_created: 0,
      });
    }

    console.log("Generating policy chunks", {
      document_id: doc.id,
      chunk_count: chunks.length,
    });

    const openai = new OpenAI({ apiKey });
    let rows: { policy_id: string; document_id: string; chunk_index: number; chunk_text: string; embedding: number[] }[] = [];

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: chunks,
      });
      const data = response?.data ?? [];
      for (let i = 0; i < chunks.length; i++) {
        const vec = data[i]?.embedding;
        if (vec && Array.isArray(vec)) {
          rows.push({
            policy_id: policyId,
            document_id: doc.id,
            chunk_index: i,
            chunk_text: chunks[i],
            embedding: vec,
          });
        }
      }
      console.log("Embeddings generated", { document_id: doc.id });
    } catch (err) {
      console.error("Generate policy chunks: batch embedding failed", {
        document_id: doc.id,
        error: err,
      });
    }

    if (rows.length > 0) {
      if (!supabaseAdmin) {
        return NextResponse.json(
          {
            error:
              "SUPABASE_SERVICE_ROLE_KEY not set; required for policy_chunks insert (RLS). Set it in .env.local.",
          },
          { status: 500 }
        );
      }
      const { error: insertError } = await chunksClient
        .from("policy_chunks")
        .insert(rows);

      if (insertError) {
        console.error("Generate policy chunks: insert error", insertError);
        return NextResponse.json(
          { error: "Failed to insert chunks", details: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      chunks_created: rows.length,
      chunks_skipped: chunks.length - rows.length,
    });
  } catch (err) {
    console.error("Generate policy chunks API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
