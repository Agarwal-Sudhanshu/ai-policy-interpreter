import { supabase } from "@/lib/supabase";

export type TrackEventOptions = {
  userId?: string | null;
  guestSessionId?: string | null;
  event: string;
};

/** Server-side: use admin client so guest (and user) inserts are not blocked by RLS. */
function getInsertClient() {
  if (typeof window !== "undefined") return supabase;
  try {
    const { supabaseAdmin } = require("@/lib/supabaseAdmin");
    if (supabaseAdmin) return supabaseAdmin;
  } catch {
    // ignore
  }
  return supabase;
}

/**
 * Tracks a usage event. Inserts into usage_events: user_id (nullable), guest_session_id (optional), event_type.
 * At least one of userId or guestSessionId should be set. Does not throw; failures are logged.
 */
export async function trackEvent(
  options: TrackEventOptions | string,
  eventIfLegacy?: string
): Promise<void> {
  const opts: TrackEventOptions =
    typeof options === "string" && typeof eventIfLegacy === "string"
      ? { userId: options, event: eventIfLegacy }
      : typeof options === "object" && options !== null
        ? options
        : { event: "" };

  const { userId, guestSessionId, event } = opts;
  if (!event?.trim()) return;
  if (!userId && !guestSessionId) return;

  const client = getInsertClient();
  try {
    await client.from("usage_events").insert({
      ...(userId && { user_id: userId }),
      ...(guestSessionId && { guest_session_id: guestSessionId.trim() }),
      event_type: event.trim(),
    });
  } catch (err) {
    console.error("trackEvent failed:", event, err);
  }
}

const GUEST_LIMIT_QUESTIONS = 3;
const GUEST_LIMIT_ELIGIBILITY = 3;

export { GUEST_LIMIT_QUESTIONS, GUEST_LIMIT_ELIGIBILITY };

export type SupabaseClient = import("@supabase/supabase-js").SupabaseClient;

/**
 * Returns count of events for a guest session and event type. Used for guest limits.
 */
export async function getGuestEventCount(
  supabaseClient: SupabaseClient,
  guestSessionId: string,
  eventType: string
): Promise<number> {
  const { count, error } = await supabaseClient
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("guest_session_id", guestSessionId.trim())
    .eq("event_type", eventType);
  if (error) return 0;
  return count ?? 0;
}
