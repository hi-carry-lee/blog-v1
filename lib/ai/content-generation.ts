/**
 * AI Content Generation Service
 * Using Google Gemini API - free tier available for text generation
 */

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Generate blog content using Google Gemini
 * @param content - The content prompt or topic
 * @returns Promise with generated text content
 */
export async function generateBlogContent(content: string): Promise<string> {
  if (!content.trim()) {
    throw new Error("Content prompt is required");
  }

  try {
    console.log("Generating content with Google Gemini...");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Write a comprehensive blog post about: ${content}. 
      
      Requirements:
      - Write in a professional, engaging tone
      - Include an introduction, main content, and conclusion
      - Use proper markdown formatting
      - Make it informative and well-structured
      - Aim for 800-1200 words
      - Include relevant examples and insights`,
      temperature: 0.7,
    });

    console.log("✅ Success with Google Gemini");
    return text;
  } catch (error) {
    console.error(
      "❌ Google Gemini failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Re-throw the error so it can be caught by the calling component
    throw new Error("AI content generation failed, please try again!");
  }
}

/**
 * Generate SEO meta description using Google Gemini
 * @param title - The blog post title
 * @param content - Brief content summary
 * @returns Promise with generated meta description
 */
export async function generateMetaDescription(
  title: string,
  content: string = ""
): Promise<string> {
  try {
    console.log("Generating meta description with Google Gemini...");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Create a compelling SEO meta description for a blog post titled: "${title}".
      
      ${content ? `Content summary: ${content}` : ""}
      
      Requirements:
      - 150-160 characters maximum
      - Include relevant keywords
      - Compelling and click-worthy
      - Accurately describes the content
      - No quotes or special characters`,
      temperature: 0.5,
    });

    console.log("✅ Success with Google Gemini");
    return text.trim();
  } catch (error) {
    console.error(
      "❌ Google Gemini failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Re-throw the error so it can be caught by the calling component
    throw new Error("AI meta description generation failed, please try again!");
  }
}
