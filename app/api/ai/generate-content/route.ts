import { NextRequest, NextResponse } from "next/server";
import {
  generateBlogContent,
  generateMetaDescription,
} from "@/lib/ai/content-generation";

export async function POST(request: NextRequest) {
  try {
    const { type, content, title } = await request.json();

    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    let result: string;

    switch (type) {
      case "content":
        result = await generateBlogContent(content);
        break;
      case "meta-description":
        result = await generateMetaDescription(title, content);
        break;
      default:
        return NextResponse.json(
          {
            error:
              "Invalid type. Use 'content', 'outline', or 'meta-description'",
          },
          { status: 400 }
        );
    }

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
