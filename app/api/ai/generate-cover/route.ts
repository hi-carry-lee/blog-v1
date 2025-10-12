import { NextRequest, NextResponse } from "next/server";
import { generateBlogCoverWithPollinations } from "@/lib/ai/image-generation-free";

export async function POST(request: NextRequest) {
  try {
    const { title, summary } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Use the service layer to generate the image
    const imageUrl = await generateBlogCoverWithPollinations(
      title,
      summary || ""
    );

    return NextResponse.json({
      success: true,
      image: imageUrl,
    });
  } catch (error) {
    console.error("AI cover generation error:", error);

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
