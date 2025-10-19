import OpenAI from "openai";
import { encoding_for_model, Tiktoken } from "tiktoken";

// OpenAI Embedding 封装
// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 当前版本 (1.0.22)：encoder.decode() 返回 Uint8Array，需要用 TextDecoder 转换
//   为什么会有这个变化：
// 性能优化：Uint8Array 是更底层的表示，避免了不必要的字符串转换
// 编码安全：可以更精确地控制字符编码处理
// 一致性：与其他语言版本的 tiktoken 保持一致
const textDecoder = new TextDecoder();

// 在文件顶部创建单例
let _encoder: Tiktoken | null = null;

function getEncoder(): Tiktoken {
  if (!_encoder) {
    _encoder = encoding_for_model("text-embedding-3-small");
  }
  return _encoder;
}

// 在应用关闭时释放
export function cleanup() {
  if (_encoder) {
    _encoder.free();
    _encoder = null;
  }
}

const EMBEDDING_MODEL = "text-embedding-3-small";
export const MAX_TOKENS = 8191; // OpenAI 限制
const DEFAULT_CHUNK_SIZE = 500; // 默认分块大小（可调整）

/**
 * 生成单个文本的 embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new Error("Text cannot be empty");
  }

  // 添加 token 数量验证
  const tokenCount = countTokens(text);
  if (tokenCount > MAX_TOKENS) {
    throw new Error(`Text too long: ${tokenCount} tokens (max: ${MAX_TOKENS})`);
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      encoding_format: "float", // 返回浮点数数组
      // OpenAI SDK v6 支持 dimensions 参数，可以减少向量维度以节省存储和提升性能：
      dimensions: 1536, // 明确指定维度，或使用更小的维度如 512
    });

    return response.data[0].embedding;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", {
        status: error.status,
        message: error.message,
        code: error.code,
      });
    } else {
      console.error("Unexpected embedding error:", error);
    }
    throw error;
  }
}

/**
 * 批量生成 embeddings（更省钱）
 */
export async function batchGenerateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // 验证每个文本的 token 数量
  for (let i = 0; i < texts.length; i++) {
    const tokenCount = countTokens(texts[i]);
    if (tokenCount > MAX_TOKENS) {
      throw new Error(
        `Text ${i} too long: ${tokenCount} tokens (max: ${MAX_TOKENS})`
      );
    }
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts, // 数组形式，批量处理
      encoding_format: "float",
      // OpenAI SDK v6 支持 dimensions 参数，可以减少向量维度以节省存储和提升性能：
      dimensions: 1536, // 明确指定维度，或使用更小的维度如 512
    });

    // 按原始顺序返回
    return response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);
  } catch (error) {
    console.error("Batch embedding error:", error);
    throw error;
  }
}

/**
 * 计算文本的 token 数量
 */
export function countTokens(text: string): number {
  const encoder = getEncoder();
  const tokens = encoder.encode(text);
  const count = tokens.length;
  cleanup();
  return count;
}

/**
 * 将长文本分块（考虑 token 限制）
 */
export interface TextChunk {
  text: string;
  tokenCount: number;
  index: number;
}

export function chunkText(
  text: string,
  options: {
    maxTokens?: number;
    overlap?: number; // 重叠 token 数
  } = {}
): TextChunk[] {
  const { maxTokens = DEFAULT_CHUNK_SIZE, overlap = 50 } = options;
  const encoder = getEncoder();

  // 按段落分割
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: TextChunk[] = [];
  let currentChunk = "";
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = encoder.encode(para);
    const paraTokenCount = paraTokens.length;

    // 单个段落就超过限制，需要强制切分
    if (paraTokenCount > maxTokens) {
      if (currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          tokenCount: currentTokens,
          index: chunks.length,
        });
        currentChunk = "";
        currentTokens = 0;
      }

      // 强制按 token 切分
      const forcedChunks = forceSplitByTokens(para, maxTokens, encoder);
      chunks.push(
        ...forcedChunks.map((c, i) => ({
          ...c,
          index: chunks.length + i,
        }))
      );
      continue;
    }

    // 加上这段会超过限制
    if (currentTokens + paraTokenCount > maxTokens && currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        tokenCount: currentTokens,
        index: chunks.length,
      });

      // 保留重叠部分
      const overlapText = getLastNTokens(currentChunk, overlap, encoder);
      currentChunk = overlapText + "\n\n" + para;
      currentTokens = encoder.encode(currentChunk).length;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
      currentTokens += paraTokenCount;
    }
  }

  // 添加最后一块
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      tokenCount: currentTokens,
      index: chunks.length,
    });
  }

  cleanup();
  return chunks;
}

/**
 * 强制按 token 切分（当单个段落太长）
 */
function forceSplitByTokens(
  text: string,
  maxTokens: number,
  encoder: Tiktoken
): TextChunk[] {
  const tokens = encoder.encode(text);
  const chunks: TextChunk[] = [];

  for (let i = 0; i < tokens.length; i += maxTokens) {
    const chunkTokens = tokens.slice(i, i + maxTokens);
    const chunkText = textDecoder.decode(encoder.decode(chunkTokens));
    chunks.push({
      text: chunkText,
      tokenCount: chunkTokens.length,
      index: 0, // 会在外部重新编号
    });
  }

  return chunks;
}

/**
 * 获取文本的最后 N 个 tokens
 */
function getLastNTokens(text: string, n: number, encoder: Tiktoken): string {
  const tokens = encoder.encode(text);
  if (tokens.length <= n) return text;
  const lastTokens = tokens.slice(-n);

  return textDecoder.decode(encoder.decode(lastTokens));
}
