import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { generatePrompt } from "./generate-image-prompt";
import { getOpenAIClient } from "./openai-client";

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // 设置超时时间
  timeout: 60000,
});

/**
 * 为博客文章生成封面图
 * @param summary - 文章摘要
 * @param category - 文章分类
 * @returns Promise<string> - 返回上传到 Cloudinary 后的永久 URL
 */
export async function generateBlogCover(
  summary: string,
  category: string
): Promise<string> {
  if (!summary) {
    throw new Error("Summary is required");
  }

  if (!category) {
    throw new Error("Category is required");
  }

  try {
    // 1. 使用专业的提示词生成函数
    const prompt = generatePrompt(summary, category);

    // 2. 调用 DALL-E 3 生成图片
    const client = getOpenAIClient();
    const response = await client.images.generate({
      model: "gpt-4o-image",
      prompt,
      size: "auto", // 16:9 比例
      quality: "medium",
      style: "natural",
      response_format: "b64_json",
      n: 1,
    });

    // 生成的图片文件，是base64编码的图片数据
    const imageData = response.data?.[0];
    if (!imageData?.b64_json) {
      throw new Error("Failed to generate image");
    }

    // 3. 将 base64 转换为 Buffer
    const imageBuffer = Buffer.from(imageData.b64_json, "base64");

    // 4. 上传到 Cloudinary
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ai-blog/cover-images",
          resource_type: "image",
          transformation: [
            { quality: "auto:good" },
            { format: "webp" }, // 使用 WebP 格式优化
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve({
              secure_url: result?.secure_url || "",
              public_id: result?.public_id || "",
            });
          }
        }
      );

      uploadStream.end(imageBuffer);
    });

    console.log("✅ Image generated and uploaded successfully");
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Image generation error:", error);

    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", {
        status: error.status,
        message: error.message,
        code: error.code,
      });
      throw new Error("AI image generation service is temporarily unavailable");
    }

    throw new Error(
      "Failed to generate cover image, please try again or upload manually"
    );
  }
}
