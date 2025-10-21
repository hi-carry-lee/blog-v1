// lib/inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-blog-v1", // 更具描述性的 ID
  name: "AI Blog", // 可选：显示名称
  // 当配置环境变量后添加：
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
