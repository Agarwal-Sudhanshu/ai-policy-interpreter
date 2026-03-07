import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  trackEvent,
  getGuestEventCount,
  GUEST_LIMIT_ELIGIBILITY,
} from "@/lib/trackEvent";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const event = typeof body.event === "string" ? body.event.trim() : "";
    const guestSessionId =
      typeof body.guest_session_id === "string"
        ? body.guest_session_id.trim()
        : "";

    if (!event) {
      return NextResponse.json({ ok: true });
    }

    const serverSupabase = await createServerSupabase();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (user?.id) {
      trackEvent({ userId: user.id, event }).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    // Guest: enforce eligibility limit before recording
    if (guestSessionId && event === "eligibility_checked") {
      const count = await getGuestEventCount(
        serverSupabase,
        guestSessionId,
        "eligibility_checked"
      );
      if (count >= GUEST_LIMIT_ELIGIBILITY) {
        return NextResponse.json(
          {
            limit_reached: true,
            message: "Create free account to continue",
          },
          { status: 403 }
        );
      }
      await trackEvent({ guestSessionId, event });
    } else if (guestSessionId) {
      await trackEvent({ guestSessionId, event });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
