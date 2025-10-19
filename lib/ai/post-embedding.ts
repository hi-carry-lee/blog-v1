import {
  generateEmbedding,
  batchGenerateEmbeddings,
  chunkText,
  countTokens,
  MAX_TOKENS,
} from "./embedding";
import {
  insertEmbedding,
  batchInsertEmbeddings,
  deleteEmbeddingsByPostId,
  searchSimilarEmbeddings,
} from "../vector";

export interface Post {
  id: string;
  title: string;
  content: string;
}

/**
 * 为文章生成所有 embeddings
 */
export async function generatePostEmbeddings(post: Post) {
  try {
    const { id, title, content } = post;

    // 1. 生成标题 embedding（总是单独一条）
    const titleEmbedding = await generateEmbedding(title);
    const titleTokens = countTokens(title);

    await insertEmbedding({
      postId: id,
      contentType: "title",
      textChunk: title,
      embedding: titleEmbedding,
      tokenCount: titleTokens,
    });

    // 2. 处理正文：检查是否需要分块
    const contentTokens = countTokens(content);

    if (contentTokens <= MAX_TOKENS) {
      // 正文较短，整体 embed
      const contentEmbedding = await generateEmbedding(content);
      await insertEmbedding({
        postId: id,
        contentType: "content",
        textChunk: content,
        embedding: contentEmbedding,
        tokenCount: contentTokens,
      });
    } else {
      // 正文较长，需要分块
      console.log(`📚 Post ${id} is long, chunking...`);
      const chunks = chunkText(content, {
        maxTokens: 500,
        overlap: 50,
      });

      // 批量生成 embeddings（性能优化）
      const chunkTexts = chunks.map((c) => c.text);
      const chunkEmbeddings = await batchGenerateEmbeddings(chunkTexts);

      // 批量插入数据库
      await batchInsertEmbeddings(
        chunks.map((chunk, index) => ({
          postId: id,
          contentType: "chunk" as const,
          textChunk: chunk.text,
          embedding: chunkEmbeddings[index],
          chunkIndex: chunk.index,
          tokenCount: chunk.tokenCount,
        }))
      );

      console.log(`✅ Generated ${chunks.length} chunks for post ${id}`);
    }
  } catch (error) {
    console.error(`Failed to generate embeddings for post ${post.id}:`, error);
    throw error;
  }
}

/**
 * 更新文章的 embeddings
 */
export async function updatePostEmbeddings(post: Post) {
  console.log(`🔄 Updating embeddings for post ${post.id}`);

  // 1. 删除旧数据
  await deleteEmbeddingsByPostId(post.id);

  // 2. 重新生成
  await generatePostEmbeddings(post);

  console.log(`✅ Updated embeddings for post ${post.id}`);
}

/**
 * 搜索文章（去重 + 排序）
 */
export async function searchPosts(
  query: string,
  options: {
    limit?: number;
    minSimilarity?: number;
  } = {}
) {
  const { limit = 10, minSimilarity = 0.7 } = options;

  // 1. 生成查询向量
  const queryEmbedding = await generateEmbedding(query);

  // 2. 向量搜索
  const results = await searchSimilarEmbeddings(queryEmbedding, {
    limit: limit * 2, // 多取一些，因为要去重
    minSimilarity,
  });

  // 3. 按文章去重（多个 chunk 可能属于同一篇）
  const uniquePosts = new Map<string, (typeof results)[0]>();

  for (const result of results) {
    const existing = uniquePosts.get(result.post_id);

    // 保留相似度更高的
    if (!existing || result.similarity > existing.similarity) {
      uniquePosts.set(result.post_id, result);
    }
  }

  // 4. 排序并限制数量
  return Array.from(uniquePosts.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((r) => ({
      postId: r.post_id,
      title: r.post_title,
      slug: r.post_slug,
      snippet: r.text_chunk.slice(0, 200) + "...",
      similarity: r.similarity,
      contentType: r.content_type,
    }));
}
