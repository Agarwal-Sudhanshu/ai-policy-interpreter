import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "PDF received",
      filename: file.name,
    });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
