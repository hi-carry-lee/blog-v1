import { Resend } from "resend";

// 延迟初始化 Resend 客户端（避免模块加载时读取环境变量）
let resend: Resend | null = null;

/**
 * 获取 Resend 客户端实例
 *
 * 使用延迟初始化模式，确保环境变量在运行时读取
 * 参考 lib/ai/openai-client.ts 的实现模式
 */
export function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing RESEND_API_KEY environment variable. Please check your .env file."
      );
    }

    resend = new Resend(apiKey);
  }

  return resend;
}
