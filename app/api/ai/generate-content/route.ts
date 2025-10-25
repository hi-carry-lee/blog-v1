import { NextRequest, NextResponse } from "next/server";
import { generateBlogContent } from "@/lib/ai/content-generation";

export async function POST(request: NextRequest) {
  try {
    const { type, content, title } = await request.json();

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

    // Return the specific error message from the service
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
