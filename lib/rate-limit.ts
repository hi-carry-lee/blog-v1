import { kv } from "@vercel/kv";

// 利用vercel提供的kv存储，实现评论频率限制
export async function checkCommentRateLimit(userId: string): Promise<boolean> {
  const key = `comment_limit:${userId}`;
  const maxComments = 5;

  const current = await kv.incr(key);
  console.log("current", current);
  if (current === 1) {
    await kv.expire(key, 60); // 设置过期时间60秒
  }

  return current <= maxComments;
}
