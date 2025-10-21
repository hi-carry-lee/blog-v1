// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processEmbedding } from "@/lib/inngest/functions";

// 发送事件 → Inngest云服务 → HTTP请求 → /api/inngest → 根据事件名执行对应函数
export const { GET, POST, PUT } = serve({
  client: inngest,
  // 所有需要被 Inngest 服务执行的函数，都在这里注册
  functions: [processEmbedding],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
