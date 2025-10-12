/**
 * Free AI Image Generation Service
 * Using Pollinations.ai - completely free, no API keys required
 */

export interface ImageGenerationResponse {
  success: boolean;
  image?: string;
  error?: string;
}

/**
 * Generate blog cover image using Pollinations.ai free API
 * @param articleTitle - The title of the blog post
 * @param articleSummary - Optional summary/description of the post
 * @returns Promise with image URL or error
 */
export async function generateBlogCoverWithPollinations(
  articleTitle: string,
  articleSummary: string = ""
): Promise<string> {
  if (!articleTitle) {
    throw new Error("Article title is required");
  }

  // Create a professional prompt for blog cover
  const prompt = articleSummary
    ? `Professional blog cover image for "${articleTitle}". Context: ${articleSummary}. Modern, clean, minimalist design with professional typography and subtle gradients. High quality, 16:9 aspect ratio, suitable for blog header.`
    : `Professional blog cover image for "${articleTitle}". Modern, clean, minimalist design with professional typography and subtle gradients. High quality, 16:9 aspect ratio, suitable for blog header.`;

  try {
    console.log("Generating image with Pollinations.ai...");
    const imageUrl = await generateImageWithPollinations(prompt);
    console.log("✅ Success with Pollinations.ai");
    return imageUrl;
  } catch (error) {
    console.log(
      "❌ Pollinations.ai failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Re-throw the error so it can be caught by the calling component
    throw new Error("AI image generation failed, please try again!");
  }
}

/**
 * Generate image using Pollinations.ai
 * @param prompt - The image generation prompt
 * @returns Promise with image URL
 */
async function generateImageWithPollinations(prompt: string): Promise<string> {
  // Pollinations.ai generates images via URL - no API key needed!
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt
  )}?width=1024&height=1024&model=flux&nologo=true`;

  // Pollinations.ai URLs are directly accessible, no need to verify
  // The URL will generate the image when accessed
  return imageUrl;
}

/**
 * Alternative function using Hugging Face as backup
 * Requires HUGGINGFACE_API_KEY environment variable
 */
export async function generateBlogCoverWithHuggingFace(
  articleTitle: string,
  articleSummary: string = ""
): Promise<string> {
  if (!articleTitle) {
    throw new Error("Article title is required");
  }

  const prompt = articleSummary
    ? `professional blog cover image for: "${articleTitle}". Context: ${articleSummary}. modern, clean, minimalist design`
    : `professional blog cover image for: "${articleTitle}". modern, clean, minimalist design`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: 1024,
            height: 1024,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageBlob.type || "image/png";

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Hugging Face image generation error:", error);
    throw error;
  }
}
