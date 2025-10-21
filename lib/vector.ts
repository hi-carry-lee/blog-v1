import { prisma } from "@/lib/db";

// ✅ 安全性：使用 Prisma 的参数化查询，避免 SQL 注入
// ✅ 输入验证：对所有输入进行严格验证
// ✅ 错误处理：提供清晰的错误信息
// ✅ 配置管理：使用常量而不是硬编码
// ✅ 类型安全：增强类型检查
// ✅ 性能优化：批量插入使用事务

// 配置常量
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_DIMENSIONS = 1536;
const MAX_SEARCH_LIMIT = 100;
const MIN_SIMILARITY_THRESHOLD = 0.0;
const MAX_SIMILARITY_THRESHOLD = 1.0;

/**
 * 向量转 SQL 格式（带验证）
 */
export function vectorToSQL(vector: number[]): string {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Vector must be a non-empty array");
  }

  if (vector.some((v) => typeof v !== "number" || !isFinite(v))) {
    throw new Error("Vector must contain only finite numbers");
  }

  return `[${vector.join(",")}]`;
}

/**
 * 插入单个 Embedding（安全版本）
 */
export async function insertEmbedding(data: {
  postId: string;
  contentType: "title" | "content" | "chunk";
  textChunk: string;
  embedding: number[];
  embeddingModel?: string;
  dimensions?: number;
  chunkIndex?: number;
  tokenCount?: number;
}) {
  // 输入验证
  if (!data.postId || typeof data.postId !== "string") {
    throw new Error("Invalid postId");
  }

  if (!data.textChunk || typeof data.textChunk !== "string") {
    throw new Error("Invalid textChunk");
  }

  if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
    throw new Error("Invalid embedding vector");
  }

  const {
    postId,
    contentType,
    textChunk,
    embedding,
    embeddingModel = DEFAULT_EMBEDDING_MODEL,
    dimensions = DEFAULT_DIMENSIONS,
    chunkIndex,
    tokenCount,
  } = data;

  // 使用参数化查询，避免 SQL 注入
  await prisma.$executeRaw`
  INSERT INTO post_embeddings (
    id, post_id, content_type, text_chunk, embedding,
    embedding_model, dimensions, chunk_index, token_count, created_at
  ) VALUES (
    gen_random_uuid(),
    ${postId}::text,
    ${contentType}::text,
    ${textChunk}::text,
    ${vectorToSQL(embedding)}::vector,
    ${embeddingModel}::text,
    ${dimensions}::int4,
    ${chunkIndex}::int4,
    ${tokenCount}::int4,
    NOW()
  )
`;
}

/**
 * 批量插入 Embeddings（安全版本）
 */
export async function batchInsertEmbeddings(
  embeddings: Array<{
    postId: string;
    contentType: "title" | "content" | "chunk";
    textChunk: string;
    embedding: number[];
    chunkIndex?: number;
    tokenCount?: number;
  }>
) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    return;
  }

  // 验证所有输入
  for (let i = 0; i < embeddings.length; i++) {
    const e = embeddings[i];
    if (!e.postId || !e.textChunk || !Array.isArray(e.embedding)) {
      throw new Error(`Invalid embedding data at index ${i}`);
    }
  }

  // 使用事务和参数化查询
  await prisma.$transaction(async (tx) => {
    for (const e of embeddings) {
      await tx.$executeRaw`
        INSERT INTO post_embeddings (
          id, post_id, content_type, text_chunk, embedding,
          embedding_model, dimensions, chunk_index, token_count, created_at
        ) VALUES (
          gen_random_uuid(),
          ${e.postId}::text,
          ${e.contentType}::text,
          ${e.textChunk}::text,
          ${vectorToSQL(e.embedding)}::vector,
          ${DEFAULT_EMBEDDING_MODEL}::text,
          ${DEFAULT_DIMENSIONS}::int4,
          ${e.chunkIndex}::int4,
          ${e.tokenCount}::int4,
          NOW()
        )
      `;
    }
  });
}

/**
 * 向量相似度搜索（安全版本）
 */
export interface SearchResult {
  id: string;
  post_id: string;
  content_type: string;
  text_chunk: string;
  chunk_index: number | null;
  similarity: number;
  post_title: string;
  post_slug: string;
}

export async function searchSimilarEmbeddings(
  queryVector: number[],
  options: {
    limit?: number;
    minSimilarity?: number;
    contentType?: "title" | "content" | "chunk";
  } = {}
): Promise<SearchResult[]> {
  // 输入验证
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    throw new Error("Invalid query vector");
  }

  if (queryVector.some((v) => typeof v !== "number" || !isFinite(v))) {
    throw new Error("Query vector must contain only finite numbers");
  }

  const { limit = 10, minSimilarity = 0.7, contentType } = options;

  // 验证参数范围
  if (limit < 1 || limit > MAX_SEARCH_LIMIT) {
    throw new Error(`Limit must be between 1 and ${MAX_SEARCH_LIMIT}`);
  }

  if (
    minSimilarity < MIN_SIMILARITY_THRESHOLD ||
    minSimilarity > MAX_SIMILARITY_THRESHOLD
  ) {
    throw new Error(
      `MinSimilarity must be between ${MIN_SIMILARITY_THRESHOLD} and ${MAX_SIMILARITY_THRESHOLD}`
    );
  }

  const vectorSQL = vectorToSQL(queryVector);

  // 使用参数化查询
  if (contentType) {
    return prisma.$queryRaw<SearchResult[]>`
      SELECT 
        pe.id,
        pe.post_id,
        pe.content_type,
        pe.text_chunk,
        pe.chunk_index,
        (1 - (pe.embedding <=> ${vectorSQL}::vector)) as similarity,
        p.title as post_title,
        p.slug as post_slug
      FROM post_embeddings pe
      JOIN posts p ON p.id = pe.post_id
      WHERE (1 - (pe.embedding <=> ${vectorSQL}::vector)) >= ${minSimilarity}
        AND pe.content_type = ${contentType}
      ORDER BY pe.embedding <=> ${vectorSQL}::vector
      LIMIT ${limit}
    `;
  } else {
    return prisma.$queryRaw<SearchResult[]>`
      SELECT 
        pe.id,
        pe.post_id,
        pe.content_type,
        pe.text_chunk,
        pe.chunk_index,
        (1 - (pe.embedding <=> ${vectorSQL}::vector)) as similarity,
        p.title as post_title,
        p.slug as post_slug
      FROM post_embeddings pe
      JOIN posts p ON p.id = pe.post_id
      WHERE (1 - (pe.embedding <=> ${vectorSQL}::vector)) >= ${minSimilarity}
      ORDER BY pe.embedding <=> ${vectorSQL}::vector
      LIMIT ${limit}
    `;
  }
}

/**
 * 删除文章的所有 embeddings
 */
export async function deleteEmbeddingsByPostId(postId: string) {
  if (!postId || typeof postId !== "string") {
    throw new Error("Invalid postId");
  }

  return prisma.postEmbedding.deleteMany({
    where: { postId },
  });
}

/**
 * 检查文章是否已有 embeddings
 */
export async function hasEmbeddings(postId: string): Promise<boolean> {
  if (!postId || typeof postId !== "string") {
    throw new Error("Invalid postId");
  }

  const count = await prisma.postEmbedding.count({
    where: { postId },
  });
  return count > 0;
}
