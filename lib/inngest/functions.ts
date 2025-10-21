import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { generatePostEmbeddings } from "@/lib/ai/post-embedding";
import type { EmbeddingGenerateEvent } from "./types";

export const processEmbedding = inngest.createFunction(
  {
    id: "process-embedding",
    name: "Process Post Embedding",
    retries: 3,
    concurrency: {
      limit: 5,
    },
  },
  { event: "post/embedding.generate" },
  async ({ event, step, logger }) => {
    const typedEvent = event as EmbeddingGenerateEvent;
    const { postId } = typedEvent.data;

    logger.info("Starting embedding generation", { postId });

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
      logger.info("Generating embeddings", {
        postId: post.id,
        titleLength: post.title.length,
        contentLength: post.content.length,
      });

      try {
        await generatePostEmbeddings(post);
        logger.info("Embeddings generated successfully", { postId: post.id });
      } catch (error) {
        logger.error("Failed to generate embeddings", {
          postId: post.id,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });

    logger.info("Embedding generation completed", { postId });
  }
);
