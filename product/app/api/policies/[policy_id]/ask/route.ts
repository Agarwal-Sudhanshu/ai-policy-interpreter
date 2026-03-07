export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  trackEvent,
  getGuestEventCount,
  GUEST_LIMIT_QUESTIONS,
} from "@/lib/trackEvent";

const POLICY_TEXT_PROMPT = `You are a credit policy assistant. Answer the user's question using the policy text below. If the answer is not present, say "Not specified in policy".

Return only a JSON object with exactly two keys:
- "answer": string (your answer)
- "source": string (must be "policy_text")

No markdown, no code fences.`;

const RAG_PROMPT = `You are a credit policy assistant. Answer the question using the policy context below. If the answer is not present in the context, say "Not specified in the policy."

Return only a JSON object with exactly two keys:
- "answer": string (your answer)
- "source": string (must be "policy_text")

No markdown, no code fences.`;

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHUNKS_RETRIEVED = 10;
const CHUNKS_AFTER_RERANK = 5;
const MAX_RAG_CONTEXT_CHARS = 4000;

const MIN_KEYWORD_LENGTH = 3;
const STOP_WORDS = new Set(["the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "has", "his", "how", "its", "may", "who", "did", "does", "this", "that", "with", "from", "what", "when", "where", "which", "will", "your", "than", "then", "them", "they", "been", "have", "into", "more", "some", "such", "only", "just", "about", "does", "each", "there", "their"]);

/** Simple keyword rerank: score chunks by overlap with question keywords, return top N. */
function rerankChunks(
  question: string,
  chunks: string[],
  topN: number = CHUNKS_AFTER_RERANK
): string[] {
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

type RuleRow = { rule_type: string; rule_value: string; rule_condition?: string | null };

function parseNum(s: string): number | null {
  const n = Number(String(s).replace(/[%,\s₹]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatIncome(value: string): string {
  const n = parseNum(value);
  return n !== null ? `₹${n.toLocaleString("en-IN")}` : value;
}

function formatLakhs(num: number): string {
  return num >= 1_00_00_000 ? `${num / 1_00_00_000} Crore` : `₹${num / 100_000} Lakhs`;
}

/** Format rule_condition for display (e.g. "property_value <= 3000000" → "property value up to ₹30 Lakhs"). */
function formatConditionForDisplay(cond: string | null | undefined): string {
  if (!cond?.trim()) return "";
  const c = cond.trim();
  const andParts = c.split(/\s+AND\s+/i).map((p) => p.trim());
  const propClauses = andParts
    .map((p) => p.match(/property_value\s*(<=|>=|<|>)\s*(\d+)/i))
    .filter((m): m is RegExpMatchArray => m != null);
  if (propClauses.length === 2) {
    const nums = propClauses.map((m) => Number(m[2])).filter(Number.isFinite);
    if (nums.length === 2) {
      const [a, b] = nums.sort((x, y) => x - y);
      return `property value from ${formatLakhs(a)} up to ${formatLakhs(b)}`;
    }
  }
  if (propClauses.length === 1) {
    const op = propClauses[0][1];
    const num = Number(propClauses[0][2]);
    if (Number.isFinite(num)) {
      const str = formatLakhs(num);
      if (op === "<=") return `property value up to ${str}`;
      if (op === "<") return `property value below ${str}`;
      if (op === ">=") return `property value from ${str}`;
      if (op === ">") return `property value above ${str}`;
    }
  }
  const occMatch = c.match(/occupation\s*=\s*["']?(\w+)["']?/i);
  if (occMatch) return `for ${occMatch[1].toLowerCase().replace(/-/g, " ")}`;
  return c;
}

function answerFromRules(
  rules: RuleRow[],
  question: string
): string | null {
  const q = question.toLowerCase().trim();
  const has = (...keywords: string[]) =>
    keywords.some((k) => q.includes(k));

  const byType = rules.reduce<Record<string, RuleRow[]>>((acc, r) => {
    const t = r.rule_type?.trim() || "";
    const v = String(r.rule_value ?? "").trim();
    if (!t || !v) return acc;
    if (!acc[t]) acc[t] = [];
    acc[t].push(r);
    return acc;
  }, {});

  if (has("ltv", "loan to value") && (byType.max_ltv?.length ?? 0) > 0) {
    const withCond = byType.max_ltv.filter((r) => r.rule_condition?.trim());
    if (withCond.length > 0) {
      const lines = byType.max_ltv.map((r) => {
        const val = parseNum(r.rule_value);
        const valStr = val !== null ? `${val}%` : r.rule_value;
        const condStr = formatConditionForDisplay(r.rule_condition);
        return condStr ? `• ${valStr} for ${condStr}` : `• ${valStr}`;
      });
      return `Maximum LTV depends on property value:\n${lines.join("\n")}`;
    }
    const vals = byType.max_ltv.map((r) => {
      const n = parseNum(r.rule_value);
      return n !== null ? `${n}%` : r.rule_value;
    });
    const unique = [...new Set(vals)];
    return `Maximum LTV allowed is ${unique.join(", ")}.`;
  }

  if (has("income") && (byType.min_income?.length ?? 0) > 0) {
    const withCond = byType.min_income.filter((r) => r.rule_condition?.trim());
    if (withCond.length > 0) {
      const lines = byType.min_income.map((r) => {
        const condStr = formatConditionForDisplay(r.rule_condition);
        return condStr ? `• ${formatIncome(r.rule_value)} (${condStr})` : `• ${formatIncome(r.rule_value)}`;
      });
      return `Minimum income required:\n${lines.join("\n")}`;
    }
    const vals = byType.min_income.map((r) => formatIncome(r.rule_value));
    const unique = [...new Set(vals)];
    return `Minimum income required is ${unique.join(" or ")}.`;
  }

  if (has("cibil", "credit score") && (byType.min_cibil?.length ?? 0) > 0) {
    const withCond = byType.min_cibil.filter((r) => r.rule_condition?.trim());
    if (withCond.length > 0) {
      const lines = byType.min_cibil.map((r) => {
        const condStr = formatConditionForDisplay(r.rule_condition);
        return condStr ? `• ${r.rule_value} (${condStr})` : `• ${r.rule_value}`;
      });
      return `Minimum credit score required:\n${lines.join("\n")}`;
    }
    const vals = byType.min_cibil.map((r) => parseNum(r.rule_value)).filter((n): n is number => n !== null);
    if (vals.length > 0) {
      const maxVal = Math.max(...vals);
      return `Minimum credit score required is ${maxVal}.`;
    }
  }

  if (has("age") && ((byType.age_min?.length ?? 0) > 0 || (byType.age_max?.length ?? 0) > 0)) {
    const mins = byType.age_min ?? [];
    const maxs = byType.age_max ?? [];
    const withCond = mins.some((r) => r.rule_condition?.trim()) || maxs.some((r) => r.rule_condition?.trim());
    if (withCond && (mins.length > 0 || maxs.length > 0)) {
      const parts: string[] = [];
      const maxLen = Math.max(mins.length, maxs.length);
      for (let i = 0; i < maxLen; i++) {
        const minR = mins[i] ?? mins[0];
        const maxR = maxs[i] ?? maxs[0];
        const min = minR ? parseNum(minR.rule_value) : null;
        const max = maxR ? parseNum(maxR.rule_value) : null;
        const condStr = formatConditionForDisplay(minR?.rule_condition ?? maxR?.rule_condition);
        let range = "";
        if (min != null && max != null) range = `${min}–${max} years`;
        else if (min != null) range = `at least ${min} years`;
        else if (max != null) range = `up to ${max} years`;
        if (range) parts.push(condStr ? `• ${range} (${condStr})` : `• ${range}`);
      }
      return `Age must be within the allowed range:\n${parts.join("\n")}`;
    }
    const minNums = mins.map((r) => parseNum(r.rule_value)).filter((n): n is number => n !== null);
    const maxNums = maxs.map((r) => parseNum(r.rule_value)).filter((n): n is number => n !== null);
    if (minNums.length > 0 || maxNums.length > 0) {
      const maxLen = Math.max(minNums.length, maxNums.length);
      const parts: string[] = [];
      for (let i = 0; i < maxLen; i++) {
        const min = minNums[i] ?? minNums[0];
        const max = maxNums[i] ?? maxNums[0];
        if (min != null && max != null) parts.push(`${min}–${max} years`);
        else if (min != null) parts.push(`at least ${min} years`);
        else if (max != null) parts.push(`up to ${max} years`);
      }
      return `Age must be within the allowed range: ${parts.join(" or ")}.`;
    }
  }

  if (has("occupation") && (byType.eligible_occupations?.length ?? 0) > 0) {
    const withCond = byType.eligible_occupations.filter((r) => r.rule_condition?.trim());
    if (withCond.length > 0) {
      const lines = byType.eligible_occupations.map((r) => {
        const condStr = formatConditionForDisplay(r.rule_condition);
        const vals = r.rule_value.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
        return condStr ? `• ${vals.join(", ")} (${condStr})` : `• ${vals.join(", ")}`;
      });
      return `Eligible occupations:\n${lines.join("\n")}`;
    }
    const vals = byType.eligible_occupations.flatMap((r) =>
      r.rule_value.split(/[,;]/).map((x) => x.trim()).filter(Boolean)
    );
    const unique = [...new Set(vals)];
    return `Eligible occupations: ${unique.join(", ")}.`;
  }

  if (has("foir") && (byType.max_foir?.length ?? 0) > 0) {
    const withCond = byType.max_foir.filter((r) => r.rule_condition?.trim());
    if (withCond.length > 0) {
      const lines = byType.max_foir.map((r) => {
        const condStr = formatConditionForDisplay(r.rule_condition);
        return condStr ? `• ${r.rule_value} (${condStr})` : `• ${r.rule_value}`;
      });
      return `Maximum FOIR allowed:\n${lines.join("\n")}`;
    }
    const vals = byType.max_foir.map((r) => r.rule_value);
    const unique = [...new Set(vals)];
    return `Maximum FOIR allowed is ${unique.join(", ")}.`;
  }

  if (has("loan type") && (byType.loan_type?.length ?? 0) > 0) {
    const unique = [...new Set(byType.loan_type.map((r) => r.rule_value))];
    return `Loan type: ${unique.join(", ")}.`;
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ policy_id: string }> }
) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();

    const { policy_id } = await params;
    if (!policy_id?.trim()) {
      return NextResponse.json(
        { error: "policy_id is required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    const guestSessionId =
      typeof body.guest_session_id === "string"
        ? body.guest_session_id.trim()
        : "";
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    // Guest limit: 3 questions (use admin client so RLS doesn't hide guest rows)
    if (!user?.id && guestSessionId) {
      const countClient = supabaseAdmin ?? serverSupabase;
      const count = await getGuestEventCount(
        countClient,
        guestSessionId,
        "question_asked"
      );
      if (count >= GUEST_LIMIT_QUESTIONS) {
        return NextResponse.json(
          {
            limit_reached: true,
            message: "Create free account to continue",
          },
          { status: 403 }
        );
      }
    }

    const policyIdTrimmed = policy_id.trim();
    const { data: latestDoc } = await supabase
      .from("documents")
      .select("id")
      .eq("policy_id", policyIdTrimmed)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: rulesData, error: rulesError } = await supabase
      .from("policy_rules")
      .select("rule_type, rule_value, rule_condition")
      .eq("document_id", latestDoc?.id ?? "")
      .order("rule_type");

    if (rulesError) {
      console.error("Ask API: fetch rules error", rulesError);
      return NextResponse.json(
        { error: "Failed to load policy rules", details: rulesError.message },
        { status: 500 }
      );
    }

    const rules = (rulesData ?? []) as RuleRow[];
    const ruleAnswer = answerFromRules(rules, question);

    if (ruleAnswer) {
      trackEvent({
        userId: user?.id,
        guestSessionId: user ? undefined : guestSessionId || undefined,
        event: "question_asked",
      }).catch(() => {});
      return NextResponse.json({
        answer: ruleAnswer,
        source: "rules",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json({
        answer: "Policy assistant is not configured.",
        source: "policy_text",
      });
    }

    const openai = new OpenAI({ apiKey });
    let answer = "No policy text available to answer this question.";
    let source: "rules" | "policy_text" = "policy_text";

    try {
      const queryEmbeddingRes = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: question.slice(0, 8000),
      });
      const queryEmbedding = queryEmbeddingRes?.data?.[0]?.embedding;
      if (queryEmbedding && Array.isArray(queryEmbedding)) {
        const { data: latestDoc } = await supabase
          .from("documents")
          .select("id")
          .eq("policy_id", policyIdTrimmed)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!latestDoc?.id) {
          // No document for this policy; skip RAG, fall through to full-text
        } else {
          type ChunkRow = { chunk_text?: string; policy_id?: string };

          const { data: vectorChunksData } = await supabase.rpc("match_policy_chunks_by_document", {
            p_document_id: latestDoc.id,
            p_query_embedding: queryEmbedding,
            p_match_count: MAX_CHUNKS_RETRIEVED,
          });
          const vectorChunks = (Array.isArray(vectorChunksData) ? vectorChunksData : []) as ChunkRow[];

          const { data: ftsChunksData } = await supabase.rpc("search_policy_chunks_fts_by_document", {
            p_document_id: latestDoc.id,
            p_query: question.trim(),
            p_limit: MAX_CHUNKS_RETRIEVED,
          });
          const ftsChunks = (Array.isArray(ftsChunksData) ? ftsChunksData : []) as ChunkRow[];

          const toText = (r: ChunkRow): string =>
            typeof r.chunk_text === "string" && r.chunk_text.length > 0 ? r.chunk_text : "";
          const vectorTexts = vectorChunks.map(toText).filter(Boolean);
          const ftsTexts = ftsChunks.map(toText).filter(Boolean);
          const seen = new Set<string>();
          const merged: string[] = [];
          for (const t of [...vectorTexts, ...ftsTexts]) {
            if (!seen.has(t)) {
              seen.add(t);
              merged.push(t);
            }
          }

          const finalChunks = rerankChunks(question, merged, CHUNKS_AFTER_RERANK);
          const context = finalChunks.join("\n\n").slice(0, MAX_RAG_CONTEXT_CHARS);
          if (context) {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: RAG_PROMPT },
                {
                  role: "user",
                  content: `Context:\n${context}\n\nQuestion: ${question}`,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.2,
            });
            const content = completion.choices[0]?.message?.content;
            if (content) {
              try {
                const parsed = JSON.parse(content) as { answer?: string; source?: string };
                if (typeof parsed.answer === "string" && parsed.answer.trim()) {
                  answer = parsed.answer.trim();
                }
              } catch {
                // use default
              }
            }
            trackEvent({
              userId: user?.id,
              guestSessionId: user ? undefined : guestSessionId || undefined,
              event: "question_asked",
            }).catch(() => {});
            return NextResponse.json({ answer, source });
          }
        }
      }
    } catch (ragErr) {
      console.error("Ask API: RAG/embedding error", ragErr);
    }

    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("text_content")
      .eq("policy_id", policyIdTrimmed)
      .not("text_content", "is", null)
      .order("version", { ascending: false })
      .limit(1);

    if (docsError || !docs?.length) {
      return NextResponse.json({
        answer: "No policy text available to answer this question.",
        source: "policy_text",
      });
    }

    const textContent = docs[0].text_content;
    const policyText =
      typeof textContent === "string"
        ? textContent.slice(0, 20_000)
        : "";

    if (!policyText) {
      return NextResponse.json({
        answer: "No policy text available to answer this question.",
        source: "policy_text",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: POLICY_TEXT_PROMPT },
        {
          role: "user",
          content: `Question: ${question}\n\nPolicy text:\n\n${policyText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    answer = "Not specified in policy.";

    if (content) {
      try {
        const parsed = JSON.parse(content) as { answer?: string; source?: string };
        if (typeof parsed.answer === "string" && parsed.answer.trim()) {
          answer = parsed.answer.trim();
        }
      } catch {
        // use default answer
      }
    }

    trackEvent({
      userId: user?.id,
      guestSessionId: user ? undefined : guestSessionId || undefined,
      event: "question_asked",
    }).catch(() => {});
    return NextResponse.json({ answer, source });
  } catch (err) {
    console.error("Ask API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
