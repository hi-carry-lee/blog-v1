import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { generatePostEmbeddings } from "@/lib/actions/post-embedding";
import type { EmbeddingGenerateEvent } from "./types";

// 用来给Inngest路由调用的函数
export const processEmbedding = inngest.createFunction(
  // 参数1️⃣：函数配置
  {
    id: "process-embedding", // 函数唯一标识符
    name: "Process Post Embedding", // 人类可读的函数名称
    retries: 3, // 失败重试次数
    concurrency: {
      // 并发控制
      limit: 5, // 最大并发执行数，免费套餐只支持5并发
    },
  },

  // 参2️⃣：事件配置：指定触发函数的事件名称
  // 需要和 inngest.send() 函数中的 name 一致
  { event: "post/embedding.generate" },

  // 参数3️⃣：Inngest函数体：处理事件的逻辑
  async ({ event, step, logger }) => {
    const typedEvent = event as EmbeddingGenerateEvent;
    const { postId } = typedEvent.data;

    logger.info("Starting embedding generation", { postId });

    // fetch-post:用于在 Inngest 仪表板中显示执行步骤，名称可以自定义
    const post = await step.run("fetch-post", async () => {
      logger.info("Fetching post", { postId });

      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          title: true,
          content: true,
        },
      });

      if (!post) {
        logger.error("Post not found", { postId });
        throw new Error(`Post with ID ${postId} not found`);
      }

      return post;
    });

    await step.run("generate-embedding", async () => {
      try {
        await generatePostEmbeddings(post);
        logger.info("Embeddings generated successfully", { postId: post.id });
      } catch (error) {
        logger.error("Failed to generate embeddings", {
          postId: post.id,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error; // 重新抛出错误，让Inngest重试
      }
    });

    logger.info("Embedding generation completed", { postId });
  }
);
