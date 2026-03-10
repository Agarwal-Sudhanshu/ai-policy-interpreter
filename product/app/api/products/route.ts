import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization_id");

    if (!organizationId || organizationId.trim() === "") {
      return NextResponse.json(
        { error: "organization_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, organization_id, name, created_at")
      .eq("organization_id", organizationId.trim())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET products error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Products API error:", err);
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
    const organizationId = typeof body.organization_id === "string" ? body.organization_id.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "organization_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({ name, organization_id: organizationId })
      .select("id, organization_id, name, created_at")
      .single();

    if (error) {
      console.error("Supabase POST products error:", error);
      return NextResponse.json(
        { error: "Failed to create product", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
