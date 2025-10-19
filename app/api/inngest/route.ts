// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processEmbedding } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processEmbedding],
  // 添加签名验证（当配置环境变量后）
  // signingKey: process.env.INNGEST_SIGNING_KEY,
});
