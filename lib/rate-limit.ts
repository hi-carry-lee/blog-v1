import { kv } from "@vercel/kv";
import { prisma } from "@/lib/db"; // 假设使用 Prisma 作为数据库 ORM

let isKVAvailable = true; // 全局变量，缓存 KV 可用性

export const RateLimitTypes = {
  COMMENT: "comment",
  PASSWORD_RESET: "password_reset",
} as const;

export type RateLimitType =
  (typeof RateLimitTypes)[keyof typeof RateLimitTypes];

// 检测 KV 是否可用
async function checkKVAvailability(): Promise<boolean> {
  try {
    await kv.set("kv_health_check", "ok", { ex: 10 }); // 写入测试数据
    const value = await kv.get("kv_health_check"); // 读取测试数据
    return value === "ok";
  } catch (error) {
    console.error("KV storage is unavailable:", error);
    return false;
  }
}

// 初始化 KV 可用性
(async () => {
  isKVAvailable = await checkKVAvailability();
})();

// 评论频率限制
export async function checkCommentRateLimit(userId: string): Promise<boolean> {
  const key = `comment_limit:${userId}`;
  const maxComments = 2;
  const windowSeconds = 60;

  if (isKVAvailable) {
    try {
      // 使用 KV 存储
      const current = await kv.incr(key);
      if (current === 1) {
        await kv.expire(key, windowSeconds);
      }
      return current <= maxComments;
    } catch (kvError) {
      console.error(`KV error for userId: ${userId}`, kvError);
      isKVAvailable = false; // 如果 KV 出现错误，标记为不可用
    }
  }

  // 使用数据库作为后备
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  const commentCount = await prisma.rateLimit.count({
    where: {
      userId,
      type: "comment",
      createdAt: { gte: windowStart },
    },
  });

  if (commentCount >= maxComments) {
    return false;
  }

  await prisma.rateLimit.create({
    data: {
      userId,
      type: RateLimitTypes.COMMENT,
      createdAt: now,
      // 过期时间：60秒
      expiresAt: new Date(now.getTime() + windowSeconds * 1000),
    },
  });

  return true;
}

// 密码重置请求频率限制：15 分钟内最多 3 次
export async function checkPasswordResetRateLimit(
  email: string
): Promise<boolean> {
  const key = `password_reset_limit:${email}`;
  const maxRequests = 1;
  const windowSeconds = 900; // 15 分钟 = 900 秒

  if (isKVAvailable) {
    try {
      // 使用 KV 存储
      const current = await kv.incr(key);
      if (current === 1) {
        await kv.expire(key, windowSeconds);
      }
      return current <= maxRequests;
    } catch (kvError) {
      console.error(`KV error for email: ${email}`, kvError);
      isKVAvailable = false; // 如果 KV 出现错误，标记为不可用
    }
  }

  // 使用数据库作为后备
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  const requestCount = await prisma.rateLimit.count({
    where: {
      userId: email,
      type: RateLimitTypes.PASSWORD_RESET,
      createdAt: { gte: windowStart },
    },
  });

  if (requestCount >= maxRequests) {
    return false;
  }

  await prisma.rateLimit.create({
    data: {
      userId: email,
      type: RateLimitTypes.PASSWORD_RESET,
      createdAt: now,
      expiresAt: new Date(now.getTime() + windowSeconds * 1000),
    },
  });

  return true;
}
