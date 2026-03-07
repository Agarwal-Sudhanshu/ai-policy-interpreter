import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const serverSupabase = await createServerSupabase();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    let query = supabase
      .from("policies")
      .select("id, product_id, name, status, created_at, is_demo, products(name)")
      .order("created_at", { ascending: false });

    if (user?.id) {
      query = query.or(`is_demo.eq.true,owner_user_id.eq.${user.id}`);
    } else {
      query = query.eq("is_demo", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase GET all policies error:", error);
      return NextResponse.json(
        { error: "Failed to fetch policies", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    console.error("Policies all API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
