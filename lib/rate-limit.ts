import { kv } from "@vercel/kv";

// 利用vercel提供的kv存储，实现评论频率限制
export async function checkCommentRateLimit(userId: string): Promise<boolean> {
  const key = `comment_limit:${userId}`;
  const maxComments = 5;

  try {
    const current = await kv.incr(key);
    console.log("current", current);
    if (current === 1) {
      await kv.expire(key, 60); // 设置过期时间60秒
    }
    return current <= maxComments;
  } catch (error) {
    console.error(
      `Error in checkCommentRateLimit for userId: ${userId}`,
      error
    );
    // 根据需求决定是否返回默认值或抛出错误
    return false; // 或者 throw error;
  }
}

// 密码重置请求频率限制：15 分钟内最多 3 次
export async function checkPasswordResetRateLimit(
  email: string
): Promise<boolean> {
  const key = `password_reset_limit:${email}`;
  const maxRequests = 3;
  const windowSeconds = 900; // 15 分钟 = 900 秒

  try {
    const current = await kv.incr(key);
    if (current === 1) {
      await kv.expire(key, windowSeconds);
    }
    return current <= maxRequests;
  } catch (error) {
    console.error(
      `Error in checkPasswordResetRateLimit for email: ${email}`,
      error
    );
    // 根据需求决定是否返回默认值或抛出错误
    return false; // 或者 throw error;
  }
}
