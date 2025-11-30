import { NextRequest, NextResponse } from "next/server";
import { generateBlogContent } from "@/lib/ai/content-generation";

export async function POST(request: NextRequest) {
  try {
    const { type, content } = await request.json();

    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    const result = await generateBlogContent(content);

    return NextResponse.json({
      success: true,
      content: result,
      type: type,
    });
  } catch (error) {
    console.error("AI content generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "AI content generation failed, please try again!",
        details: "Unknown error, please try again later.",
      },
      { status: 500 }
    );
  }
}
