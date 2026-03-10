import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHUNKS_RETRIEVED = 10;
const CHUNKS_AFTER_RERANK = 5;

const MIN_KEYWORD_LENGTH = 3;
const STOP_WORDS = new Set(["the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "has", "his", "how", "its", "may", "who", "did", "does", "this", "that", "with", "from", "what", "when", "where", "which", "will", "your", "than", "then", "them", "they", "been", "have", "into", "more", "some", "such", "only", "just", "about", "does", "each", "there", "their"]);

function rerankChunks(question: string, chunks: string[], topN: number): string[] {
  const q = question.toLowerCase().trim();
  const keywords = q
    .split(/\s+/)
    .map((w) => w.replace(/\W/g, ""))
    .filter((w) => w.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.has(w));
  const keywordSet = new Set(keywords);
  if (keywordSet.size === 0) return chunks.slice(0, topN);
  const scored = chunks.map((chunk) => {
    const lower = chunk.toLowerCase();
    let score = 0;
    for (const kw of keywordSet) {
      if (lower.includes(kw)) score += 1;
    }
    return { chunk, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.chunk);
}

type VectorRow = { chunk_text: string | null; document_id: string | null; chunk_index: number | null; similarity: number };
type KeywordRow = { chunk_text: string | null; document_id: string | null; chunk_index: number | null };
type MergedItem = { chunk_text: string; source: "vector" | "keyword"; similarity_score: number | null; chunk_index: number | null };

export async function POST(request: Request) {
  const serverSupabase = await createServerSupabase();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const policyId = typeof body.policy_id === "string" ? body.policy_id.trim() : "";
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!policyId || !question) {
      return NextResponse.json(
        { error: "policy_id and question are required" },
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

    const embeddingRes = await new OpenAI({ apiKey }).embeddings.create({
      model: EMBEDDING_MODEL,
      input: question,
    });
    const queryEmbedding = embeddingRes?.data?.[0]?.embedding;
    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      return NextResponse.json(
        { error: "Failed to generate question embedding" },
        { status: 500 }
      );
    }

    const { data: latestDoc, error: docError } = await supabase
      .from("documents")
      .select("id")
      .eq("policy_id", policyId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (docError || !latestDoc?.id) {
      return NextResponse.json({
        question,
        vector_results: [],
        keyword_results: [],
        merged_results: [],
        top_chunks: [],
        error: "No document found for this policy",
      });
    }

    const latest_document_id = latestDoc.id;

    const { data: vectorData } = await supabase.rpc("debug_match_policy_chunks_by_document", {
      p_document_id: latest_document_id,
      p_query_embedding: queryEmbedding,
      p_limit: MAX_CHUNKS_RETRIEVED,
    });
    const vector_results = (Array.isArray(vectorData) ? vectorData : []) as VectorRow[];

    const { data: keywordData } = await supabase.rpc("debug_search_policy_chunks_fts_by_document", {
      p_document_id: latest_document_id,
      p_query: question,
      p_limit: MAX_CHUNKS_RETRIEVED,
    });
    const keyword_results = (Array.isArray(keywordData) ? keywordData : []) as KeywordRow[];

    const toMerged = (
      r: VectorRow | KeywordRow,
      source: "vector" | "keyword",
      similarity: number | null
    ): MergedItem => ({
      chunk_text: r.chunk_text ?? "",
      source,
      similarity_score: similarity,
      chunk_index: r.chunk_index ?? null,
    });

    const seen = new Set<string>();
    const merged_results: MergedItem[] = [];
    for (const r of vector_results) {
      const t = r.chunk_text ?? "";
      if (t && !seen.has(t)) {
        seen.add(t);
        merged_results.push(toMerged(r, "vector", r.similarity ?? null));
      }
    }
    for (const r of keyword_results) {
      const t = r.chunk_text ?? "";
      if (t && !seen.has(t)) {
        seen.add(t);
        merged_results.push(toMerged(r, "keyword", null));
      }
    }

    const mergedTexts = merged_results.map((m) => m.chunk_text);
    const top5Texts = rerankChunks(question, mergedTexts, CHUNKS_AFTER_RERANK);
    const top_chunks: MergedItem[] = top5Texts
      .map((text) => merged_results.find((m) => m.chunk_text === text))
      .filter((m): m is MergedItem => m != null);

    return NextResponse.json({
      question,
      vector_results: vector_results.map((r) => ({
        chunk_text: r.chunk_text ?? "",
        document_id: r.document_id ?? null,
        chunk_index: r.chunk_index ?? null,
        similarity_score: r.similarity ?? null,
      })),
      keyword_results: keyword_results.map((r) => ({
        chunk_text: r.chunk_text ?? "",
        document_id: r.document_id ?? null,
        chunk_index: r.chunk_index ?? null,
      })),
      merged_results,
      top_chunks,
    });
  } catch (err) {
    console.error("Debug RAG API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
