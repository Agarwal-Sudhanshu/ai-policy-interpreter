import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type Organization = {
  id: string;
  name: string;
  type: string | null;
  created_at: string;
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, type, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET organizations error:", error);
      return NextResponse.json(
        { error: "Failed to fetch organizations", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Organizations API error:", err);
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
    const type = typeof body.type === "string" ? body.type.trim() : null;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert({ name, type })
      .select("id, name, type, created_at")
      .single();

    if (error) {
      console.error("Supabase POST organizations error:", error);
      return NextResponse.json(
        { error: "Failed to create organization", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Organizations API error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
