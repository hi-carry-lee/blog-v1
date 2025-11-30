import { NextRequest, NextResponse } from "next/server";
import { generateBlogCover } from "@/lib/ai/image-generation";

export async function POST(request: NextRequest) {
  try {
    const { summary, category } = await request.json();

    if (!summary) {
      return NextResponse.json(
        { error: "Summary is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const imageUrl = await generateBlogCover(summary, category);

    return NextResponse.json({
      success: true,
      image: imageUrl,
    });
  } catch (error) {
    console.error("AI cover generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "AI cover generation failed, please try again!",
        details: "Unknown error, please try again later.",
      },
      { status: 500 }
    );
  }
}
