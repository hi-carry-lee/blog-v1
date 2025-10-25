import OpenAI from "openai";

// 延迟初始化 OpenAI 客户端（避免模块加载时读取环境变量）
let openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.AIHUBMIX_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing AIHUBMIX_API_KEY environment variable. Please check your .env file."
      );
    }

    openai = new OpenAI({
      baseURL: "https://aihubmix.com/v1",
      apiKey: apiKey,
    });
  }

  return openai;
}
