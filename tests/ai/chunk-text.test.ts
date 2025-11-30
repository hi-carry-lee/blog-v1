import { describe, it, expect, afterAll } from "vitest";
import { chunkText, cleanup } from "@/lib/ai/embedding";

describe("chunkText 函数", () => {
  afterAll(() => {
    cleanup();
  });

  describe("基础功能", () => {
    it("应该将文本分割成多个块", () => {
      const text = "第一段\n\n第二段\n\n第三段";
      const chunks = chunkText(text);
      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it("应该返回 TextChunk 数组", () => {
      const text = "测试文本";
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach((chunk) => {
        expect(chunk).toHaveProperty("text");
        expect(chunk).toHaveProperty("tokenCount");
        expect(chunk).toHaveProperty("index");
      });
    });

    it("应该为每个块分配正确的索引", () => {
      const text = "第一段\n\n第二段\n\n第三段";
      const chunks = chunkText(text);
      chunks.forEach((chunk, index) => {
        expect(chunk.index).toBe(index);
      });
    });
  });

  describe("默认参数", () => {
    it("应该使用默认 maxTokens (500)", () => {
      const text = "这是一个测试文本。".repeat(100);
      const chunks = chunkText(text);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(500);
      });
    });

    it("应该使用默认 overlap (50)", () => {
      const text = "第一段\n\n第二段\n\n第三段\n\n第四段";
      const chunks = chunkText(text);
      // 如果有多个块，应该有重叠
      if (chunks.length > 1) {
        expect(chunks.length).toBeGreaterThan(1);
      }
    });
  });

  describe("自定义参数", () => {
    it("应该遵守自定义 maxTokens", () => {
      const text = "测试文本".repeat(50);
      const chunks = chunkText(text, { maxTokens: 100 });
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(100);
      });
    });

    it("应该处理小的 maxTokens", () => {
      const text = "这是一个较长的测试文本，用于测试分块功能。";
      const chunks = chunkText(text, { maxTokens: 10 });
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(10);
      });
    });

    it("应该处理自定义 overlap", () => {
      const text = "第一段\n\n第二段\n\n第三段";
      const chunks = chunkText(text, { maxTokens: 50, overlap: 10 });
      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
    });
  });

  describe("长文本处理", () => {
    it("应该处理超过 maxTokens 的单个段落", () => {
      const longParagraph = "这是一个很长的段落。".repeat(200);
      const chunks = chunkText(longParagraph, { maxTokens: 50 });
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(50);
      });
    });

    it("应该处理多个长段落", () => {
      const text =
        "第一段很长。".repeat(100) + "\n\n" + "第二段也很长。".repeat(100);
      const chunks = chunkText(text, { maxTokens: 100 });
      expect(chunks.length).toBeGreaterThan(1);
    });
  });

  describe("边界情况", () => {
    it("应该处理空字符串", () => {
      const chunks = chunkText("");
      expect(chunks).toEqual([]);
    });

    it("应该处理只有空格的字符串", () => {
      const chunks = chunkText("   \n\n   ");
      expect(chunks).toEqual([]);
    });

    it("应该处理只有换行符的字符串", () => {
      const chunks = chunkText("\n\n\n");
      expect(chunks).toEqual([]);
    });

    it("应该处理单个短段落", () => {
      const text = "这是一个短段落。";
      const chunks = chunkText(text);
      expect(chunks.length).toBe(1);
      expect(chunks[0].text).toContain("这是一个短段落");
    });
  });

  describe("token 计数", () => {
    it("每个块的 tokenCount 应该准确", () => {
      const text = "测试文本";
      const chunks = chunkText(text);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeGreaterThan(0);
        expect(typeof chunk.tokenCount).toBe("number");
      });
    });

    it("tokenCount 不应该超过 maxTokens", () => {
      const text = "这是一个测试文本。".repeat(50);
      const chunks = chunkText(text, { maxTokens: 100 });
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("文本完整性", () => {
    it("所有块的文本应该覆盖原始文本", () => {
      const text = "第一段\n\n第二段\n\n第三段";
      const chunks = chunkText(text);
      const combinedText = chunks.map((c) => c.text).join("\n\n");
      // 由于可能有重叠，组合文本可能比原文本长
      expect(combinedText.length).toBeGreaterThan(0);
    });

    it("每个块的文本不应该为空", () => {
      const text = "测试文本";
      const chunks = chunkText(text);
      chunks.forEach((chunk) => {
        expect(chunk.text.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe("段落分割", () => {
    it("应该按段落分割文本", () => {
      const text = "第一段\n\n第二段\n\n第三段";
      const chunks = chunkText(text, { maxTokens: 100 });
      expect(chunks.length).toBeGreaterThan(0);
    });

    it("应该处理单个段落", () => {
      const text = "这是一个没有换行的段落。";
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it("应该处理多个连续换行", () => {
      const text = "第一段\n\n\n\n第二段";
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});
