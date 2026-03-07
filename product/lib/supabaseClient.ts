import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Only create browser client when running in the browser. createBrowserClient
// throws or misbehaves when the module is evaluated on the server (e.g. when
// loading the eligibility route), so we must not call it during SSR.
const _supabase =
  typeof window !== "undefined"
    ? createClient()
    : (null as unknown as ReturnType<typeof createClient>);

export const supabase = _supabase!;
