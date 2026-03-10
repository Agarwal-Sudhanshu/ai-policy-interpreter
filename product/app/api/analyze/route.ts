export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PdfReader } from "pdfreader";

const MAX_TEXT_LENGTH = 12000;

export type InterpretedPolicy = {
  loan_type: string;
  max_ltv: string;
  foir: string;
  minimum_income: string;
  age_range: string;
  eligible_occupations: string[];
  required_documents: string[];
};

const NOT_SPECIFIED = "Not specified";

const INTERPRETED_POLICY_SCHEMA: InterpretedPolicy = {
  loan_type: NOT_SPECIFIED,
  max_ltv: NOT_SPECIFIED,
  foir: NOT_SPECIFIED,
  minimum_income: NOT_SPECIFIED,
  age_range: NOT_SPECIFIED,
  eligible_occupations: [],
  required_documents: [],
};

function extractText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    let text = "";

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(text);
      } else if (item.text) {
        text += item.text + " ";
      }
    });
  });
}

function strOrNotSpecified(value: unknown): string {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return NOT_SPECIFIED;
}

function normalizeInterpretedPolicy(raw: unknown): InterpretedPolicy {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    loan_type: strOrNotSpecified(o.loan_type),
    max_ltv: strOrNotSpecified(o.max_ltv),
    foir: strOrNotSpecified(o.foir),
    minimum_income: strOrNotSpecified(o.minimum_income),
    age_range: strOrNotSpecified(o.age_range),
    eligible_occupations: Array.isArray(o.eligible_occupations)
      ? (o.eligible_occupations as unknown[]).filter((x): x is string => typeof x === "string" && x.trim() !== "")
      : INTERPRETED_POLICY_SCHEMA.eligible_occupations,
    required_documents: Array.isArray(o.required_documents)
      ? (o.required_documents as unknown[]).filter((x): x is string => typeof x === "string" && x.trim() !== "")
      : INTERPRETED_POLICY_SCHEMA.required_documents,
  };
}

const EXTRACTION_PROMPT = `Extract structured credit policy rules from the policy text below.

Rules:
1. Infer from context when a value is not explicitly stated:
   - Borrower eligibility (e.g. "individuals", "self-employed", "salaried", "businesses") → use for eligible_occupations.
   - Documentation / annexure / checklist sections → use for required_documents (list each document type).
   - Loan facilities / product names / types (e.g. "housing loan", "personal loan") → use for loan_type.
   - Any income, LTV, FOIR, or age criteria mentioned anywhere → map to the corresponding field.
2. If information is not present and cannot be inferred, use "Not specified" for string fields or [] for arrays.
3. Return only valid JSON. No markdown, no code fences, no explanation.

Required JSON structure (use exactly these keys):

{
  "loan_type": "",
  "max_ltv": "",
  "foir": "",
  "minimum_income": "",
  "age_range": "",
  "eligible_occupations": [],
  "required_documents": []
}

- loan_type: string (e.g. "Housing Loan", "Personal Loan"). Use "Not specified" if absent.
- max_ltv: string (e.g. "75%", "80"). Use "Not specified" if absent.
- foir: string (Fixed Obligation to Income Ratio, e.g. "50%", "60%"). Use "Not specified" if absent.
- minimum_income: string (e.g. "INR 25000", "Not specified").
- age_range: string (e.g. "21-60", "18-65"). Use "Not specified" if absent.
- eligible_occupations: array of strings (e.g. ["Salaried", "Self-employed"]). Infer from borrower eligibility; use [] if none.
- required_documents: array of strings. Infer from documentation section; use [] if none.

Policy text:

`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fullText = await extractText(buffer);
    const extractedText = fullText.slice(0, MAX_TEXT_LENGTH).trim() || "No text could be extracted from the PDF.";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a credit policy analyst. Extract structured rules from policy text. Infer from context when possible (e.g. borrower eligibility → eligible_occupations, documentation section → required_documents, loan facilities → loan_type). Use \"Not specified\" for missing string fields and [] for missing arrays. Respond with a single valid JSON object only—no markdown, no code fences, no extra text.",
        },
        {
          role: "user",
          content: EXTRACTION_PROMPT + extractedText,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    let interpretedPolicy: InterpretedPolicy = { ...INTERPRETED_POLICY_SCHEMA };

    if (content) {
      try {
        const parsed = JSON.parse(content) as unknown;
        interpretedPolicy = normalizeInterpretedPolicy(parsed);
      } catch (parseErr) {
        console.error("Failed to parse OpenAI JSON:", parseErr);
      }
    }

    return NextResponse.json({
      message: "PDF parsed and interpreted successfully",
      extracted_text: extractedText,
      interpreted_policy: interpretedPolicy,
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) },
      { status: 500 }
    );
  }
}
