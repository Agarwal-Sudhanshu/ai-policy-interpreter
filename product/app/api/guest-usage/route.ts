import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getGuestEventCount,
  GUEST_LIMIT_QUESTIONS,
  GUEST_LIMIT_ELIGIBILITY,
} from "@/lib/trackEvent";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestSessionId = searchParams.get("guest_session_id")?.trim();
    if (!guestSessionId) {
      return NextResponse.json(
        { error: "guest_session_id is required" },
        { status: 400 }
      );
    }

    const client = supabaseAdmin ?? supabase;
    const [questionsCount, eligibilityCount] = await Promise.all([
      getGuestEventCount(client, guestSessionId, "question_asked"),
      getGuestEventCount(client, guestSessionId, "eligibility_checked"),
    ]);

    return NextResponse.json({
      questions_remaining: Math.max(
        0,
        GUEST_LIMIT_QUESTIONS - questionsCount
      ),
      eligibility_remaining: Math.max(
        0,
        GUEST_LIMIT_ELIGIBILITY - eligibilityCount
      ),
    });
  } catch (err) {
    console.error("guest-usage error:", err);
    return NextResponse.json(
      { error: "Failed to get usage" },
      { status: 500 }
    );
  }
}
