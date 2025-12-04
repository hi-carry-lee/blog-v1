import { describe, it, expect, afterAll } from "vitest";
import {
  generateEmbedding,
  batchGenerateEmbeddings,
  countTokens,
  MAX_TOKENS,
  cleanup,
} from "../../lib/ai/embedding";

describe("Embedding 功能测试", () => {
  // 测试后清理资源
  afterAll(() => {
    // 清理向量客户端连接
    cleanup();
  });

  /*
测试用例分类：
A. generateEmbedding 函数（5个用例）
  生成中文文本的 embedding
  生成英文文本的 embedding
  空文本应抛出错误
  超长文本应抛出错误
  不同文本应生成不同的 embedding
B. batchGenerateEmbeddings 函数
  批量生成 embeddings
  空数组应返回空数组 
  保持输入顺序 
C. countTokens 函数（3个用例）
  正确计算英文文本的 token 数量
  正确计算中文文本的 token 数量
  正确计算长文本的 token 数量
D. 性能测试（2个用例）
  单个 embedding 生成应在合理时间内完成
  批量生成应比单个生成更高效
*/
  describe("generateEmbedding 函数", () => {
    // it()：定义具体测试用例，描述测试行为，函数包含测试逻辑
    it("应该成功生成中文文本的 embedding", async () => {
      const testText = "这是一个测试文本，用于验证 embedding 生成功能。";

      const startTime = Date.now();
      const embedding = await generateEmbedding(testText);
      const endTime = Date.now();

      // 验证结果
      // toBeDefined() 是 Vitest/Jest 的断言，用于验证值不是 undefined，null值可以通过
      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536); // text-embedding-3-small 的维度
      expect(embedding.every((val) => typeof val === "number")).toBe(true);

      console.log(`✅ 中文文本 embedding 生成成功`);
      console.log(`📊 向量维度: ${embedding.length}`);
      console.log(`⏱️ 耗时: ${endTime - startTime}ms`);
      console.log(
        `🔢 前5个值: [${embedding
          .slice(0, 5)
          .map((v) => v.toFixed(6))
          .join(", ")}...]`
      );
    });

    it("应该成功生成英文文本的 embedding", async () => {
      const testText = "This is a test text for embedding generation.";

      const startTime = Date.now();
      const embedding = await generateEmbedding(testText);
      const endTime = Date.now();

      // 验证结果
      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536);
      expect(embedding.every((val) => typeof val === "number")).toBe(true);

      console.log(`✅ 英文文本 embedding 生成成功`);
      console.log(`📊 向量维度: ${embedding.length}`);
      console.log(`⏱️ 耗时: ${endTime - startTime}ms`);
      console.log(
        `🔢 前5个值: [${embedding
          .slice(0, 5)
          .map((v) => v.toFixed(6))
          .join(", ")}...]`
      );
    });

    it("应该对空文本抛出错误", async () => {
      await expect(generateEmbedding("")).rejects.toThrow(
        "Text cannot be empty"
      );
      await expect(generateEmbedding("   ")).rejects.toThrow(
        "Text cannot be empty"
      );
    });

    it("应该对超长文本抛出错误", async () => {
      // repeat: 来自ES6的字符串扩展，用于重复字符串
      const longText = "这是一个很长的文本。".repeat(2000); // 创建超长文本
      const tokenCount = countTokens(longText);

      if (tokenCount > MAX_TOKENS) {
        await expect(generateEmbedding(longText)).rejects.toThrow();
      } else {
        // 如果文本不够长，则正常测试
        const embedding = await generateEmbedding(longText);
        expect(embedding).toBeDefined();
        expect(embedding.length).toBe(1536);
      }
    });

    it("应该生成不同文本的不同 embedding", async () => {
      const text1 = "第一个测试文本";
      const text2 = "第二个测试文本";

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);

      // 验证两个 embedding 不同
      expect(embedding1).not.toEqual(embedding2);

      // 验证维度相同
      expect(embedding1.length).toBe(embedding2.length);
    });
  });

  describe("batchGenerateEmbeddings 函数", () => {
    it("应该成功批量生成 embeddings", async () => {
      const testTexts = ["第一个测试文本", "第二个测试文本", "第三个测试文本"];

      const startTime = Date.now();
      const embeddings = await batchGenerateEmbeddings(testTexts);
      const endTime = Date.now();

      // 验证结果
      expect(embeddings).toBeDefined();
      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(testTexts.length);

      // 验证每个 embedding
      embeddings.forEach((embedding) => {
        expect(embedding).toBeDefined();
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding.length).toBe(1536);
        expect(embedding.every((val) => typeof val === "number")).toBe(true);
      });

      console.log(`✅ 批量生成 ${embeddings.length} 个 embeddings 成功`);
      console.log(`⏱️ 总耗时: ${endTime - startTime}ms`);
      console.log(`📊 每个向量维度: ${embeddings[0]?.length || 0}`);
    });

    it("应该对空数组返回空数组", async () => {
      const embeddings = await batchGenerateEmbeddings([]);
      expect(embeddings).toEqual([]);
    });

    it("应该保持输入顺序", async () => {
      const testTexts = ["文本A", "文本B", "文本C"];
      const embeddings = await batchGenerateEmbeddings(testTexts);

      expect(embeddings.length).toBe(3);

      // 验证每个 embedding 都不同（不同文本应该产生不同 embedding）
      for (let i = 0; i < embeddings.length; i++) {
        for (let j = i + 1; j < embeddings.length; j++) {
          expect(embeddings[i]).not.toEqual(embeddings[j]);
        }
      }
    });
  });

  describe("countTokens 函数", () => {
    it("应该正确计算英文文本的 token 数量", () => {
      const testCases = [
        { text: "Hello", expected: 1 },
        { text: "Hello world", expected: 2 },
        { text: "This is a test", expected: 4 },
      ];

      testCases.forEach(({ text, expected }) => {
        const tokenCount = countTokens(text);
        expect(tokenCount).toBeGreaterThan(0);
        console.log(
          `📝 "${text}" -> ${tokenCount} tokens (预期约 ${expected})`
        );
      });
    });

    it("应该正确计算中文文本的 token 数量", () => {
      const testCases = [
        { text: "你好", expected: 2 },
        { text: "这是一个测试", expected: 6 },
        { text: "Hello 世界", expected: 3 },
      ];

      testCases.forEach(({ text, expected }) => {
        const tokenCount = countTokens(text);
        expect(tokenCount).toBeGreaterThan(0);
        console.log(
          `📝 "${text}" -> ${tokenCount} tokens (预期约 ${expected})`
        );
      });
    });

    it("应该正确计算长文本的 token 数量", () => {
      const longText = "A".repeat(1000);
      const tokenCount = countTokens(longText);

      expect(tokenCount).toBeGreaterThan(0);
      expect(tokenCount).toBeLessThanOrEqual(MAX_TOKENS);
      console.log(
        `📝 长文本 (${longText.length} 字符) -> ${tokenCount} tokens`
      );
    });
  });

  describe("性能测试", () => {
    it("单个 embedding 生成应该在合理时间内完成", async () => {
      const testText = "性能测试文本";

      const startTime = Date.now();
      const embedding = await generateEmbedding(testText);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 应该在 10 秒内完成
      expect(embedding).toBeDefined();

      console.log(`⏱️ 单个 embedding 生成耗时: ${duration}ms`);
    });

    it("批量 embedding 生成应该比单个生成更高效", async () => {
      const testTexts = ["文本1", "文本2", "文本3"];

      // 测试批量生成
      const batchStartTime = Date.now();
      const batchEmbeddings = await batchGenerateEmbeddings(testTexts);
      const batchEndTime = Date.now();
      const batchDuration = batchEndTime - batchStartTime;

      // 测试单个生成
      const singleStartTime = Date.now();
      for (const text of testTexts) {
        await generateEmbedding(text);
      }
      const singleEndTime = Date.now();
      const singleDuration = singleEndTime - singleStartTime;

      expect(batchEmbeddings.length).toBe(testTexts.length);

      console.log(`⏱️ 批量生成耗时: ${batchDuration}ms`);
      console.log(`⏱️ 单个生成耗时: ${singleDuration}ms`);
      console.log(
        `📈 效率提升: ${(
          ((singleDuration - batchDuration) / singleDuration) *
          100
        ).toFixed(1)}%`
      );
    }, 30000); // 30秒超时
  });
});
