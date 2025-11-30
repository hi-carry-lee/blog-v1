import { describe, it, expect } from "vitest";
import { generatePrompt } from "@/lib/ai/generate-image-prompt";

describe("generatePrompt 函数", () => {
  describe("基础功能", () => {
    it("应该生成包含 summary 和 category 的提示词", () => {
      const summary = "React Hooks 的使用方法";
      const category = "前端开发";
      const result = generatePrompt(summary, category);

      expect(result).toContain(summary);
      expect(result).toContain(category);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("应该生成格式化的提示词", () => {
      const result = generatePrompt("测试摘要", "测试分类");
      expect(result).toBeDefined();
      expect(result.trim().length).toBeGreaterThan(0);
    });
  });

  describe("内容包含", () => {
    it("应该包含样式描述", () => {
      const result = generatePrompt("测试", "分类");
      expect(result.toLowerCase()).toContain("illustration");
      expect(result.toLowerCase()).toContain("design");
    });

    it("应该包含内容描述", () => {
      const summary = "React 组件开发";
      const result = generatePrompt(summary, "前端");
      expect(result).toContain(summary);
    });

    it("应该包含分类信息", () => {
      const category = "后端开发";
      const result = generatePrompt("测试", category);
      expect(result).toContain(category);
    });

    it("应该包含质量要求", () => {
      const result = generatePrompt("测试", "分类");
      expect(result.toLowerCase()).toContain("professional");
      expect(result.toLowerCase()).toContain("modern");
    });

    it("应该包含格式要求", () => {
      const result = generatePrompt("测试", "分类");
      expect(result.toLowerCase()).toContain("16:9");
      expect(result.toLowerCase()).toContain("landscape");
    });
  });

  describe("格式处理", () => {
    it("应该去除多余空格", () => {
      const result = generatePrompt("测试", "分类");
      // 不应该有连续的空格
      expect(result).not.toMatch(/\s{2,}/);
    });

    it("应该去除首尾空格", () => {
      const result = generatePrompt("测试", "分类");
      expect(result).toBe(result.trim());
    });

    it("应该用单个空格连接各部分", () => {
      const result = generatePrompt("测试", "分类");
      const parts = result.split(" ");
      // 所有部分应该用单个空格分隔
      expect(parts.length).toBeGreaterThan(0);
    });
  });

  describe("边界情况", () => {
    it("应该处理空字符串", () => {
      const result = generatePrompt("", "");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("应该处理特殊字符", () => {
      const result = generatePrompt("React & Vue.js", "前端/后端");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("应该处理长文本", () => {
      const longSummary = "这是一个很长的摘要。".repeat(10);
      const longCategory = "这是一个很长的分类名称";
      const result = generatePrompt(longSummary, longCategory);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("应该处理中英文混合", () => {
      const result = generatePrompt(
        "React 组件开发指南",
        "Frontend Development"
      );
      expect(result).toBeDefined();
      expect(result).toContain("React");
      expect(result).toContain("Frontend");
    });
  });

  describe("提示词结构", () => {
    it("应该包含三个主要部分：样式、内容、质量", () => {
      const result = generatePrompt("测试摘要", "测试分类");
      // 应该包含样式相关关键词
      expect(result.toLowerCase()).toMatch(/illustration|design|style/);
      // 应该包含内容相关关键词
      expect(result.toLowerCase()).toMatch(/concept|illustrate|scene/);
      // 应该包含质量相关关键词
      expect(result.toLowerCase()).toMatch(/professional|engaging|modern/);
    });

    it("应该避免某些元素", () => {
      const result = generatePrompt("测试", "分类");
      expect(result.toLowerCase()).toContain("avoid");
      expect(result.toLowerCase()).toContain("photorealism");
      expect(result.toLowerCase()).toContain("no text");
    });
  });

  describe("一致性", () => {
    it("相同输入应该生成相同输出", () => {
      const summary = "测试摘要";
      const category = "测试分类";
      const result1 = generatePrompt(summary, category);
      const result2 = generatePrompt(summary, category);
      expect(result1).toBe(result2);
    });

    it("不同输入应该生成不同输出", () => {
      const result1 = generatePrompt("摘要1", "分类1");
      const result2 = generatePrompt("摘要2", "分类2");
      expect(result1).not.toBe(result2);
    });
  });
});
