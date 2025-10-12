import { experimental_generateImage as generateImage } from "ai";
import { google } from "@ai-sdk/google";

// 为博客文章生成封面图
export async function generateBlogCover(
  articleTitle: string,
  articleSummary: string
) {
  if (!articleTitle) {
    throw new Error("Article title is required");
  }

  const prompt = articleSummary
    ? `Create a professional blog cover image for: "${articleTitle}". Context: ${articleSummary}. Style: modern, clean, professional.`
    : `Create a professional blog cover image for: "${articleTitle}". Style: modern, clean, professional.`;

  const { image } = await generateImage({
    model: google.image("imagen-3.0-generate-002"),
    prompt,
    aspectRatio: "16:9",
  });

  return image.base64;
}
