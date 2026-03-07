import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";

export type Policy = {
  id: string;
  product_id: string;
  name: string;
  status: string;
  created_at: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId || productId.trim() === "") {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("policies")
      .select("id, product_id, name, status, created_at")
      .eq("product_id", productId.trim())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET policies error:", error);
      return NextResponse.json(
        { error: "Failed to fetch policies", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Policies API error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const productId = typeof body.product_id === "string" ? body.product_id.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();

    const { data, error } = await supabase
      .from("policies")
      .insert({
        name,
        product_id: productId,
        is_demo: false,
        ...(user?.id && { owner_user_id: user.id }),
      })
      .select("id, product_id, name, status, created_at")
      .single();

    if (error) {
      console.error("Supabase POST policies error:", error);
      return NextResponse.json(
        { error: "Failed to create policy", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Policies API error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
