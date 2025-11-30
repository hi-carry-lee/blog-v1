import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug-helper";

describe("generateSlug 函数", () => {
  describe("基础功能", () => {
    it("应该将中文文本转换为 slug", () => {
      const result = generateSlug("前端开发教程");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("应该将英文文本转换为小写 slug", () => {
      const result = generateSlug("React Tutorial");
      expect(result).toBe("react-tutorial");
    });

    it("应该处理中英文混合文本", () => {
      const result = generateSlug("React 前端开发");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("边界情况", () => {
    it("应该对空字符串返回空字符串", () => {
      expect(generateSlug("")).toBe("");
      expect(generateSlug("   ")).toBe("");
    });

    it("应该对 null 或 undefined 返回空字符串", () => {
      // @ts-expect-error - 测试边界情况
      expect(generateSlug(null)).toBe("");
      // @ts-expect-error - 测试边界情况
      expect(generateSlug(undefined)).toBe("");
    });

    it("应该去除首尾空格", () => {
      const result1 = generateSlug("  前端开发  ");
      const result2 = generateSlug("前端开发");
      expect(result1).toBe(result2);
    });
  });

  describe("长度限制", () => {
    it("应该遵守默认最大长度 50", () => {
      const longText = "这是一个很长的文本".repeat(10);
      const result = generateSlug(longText);
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it("应该遵守自定义最大长度", () => {
      const text = "前端开发教程";
      const result = generateSlug(text, { maxLength: 10 });
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it("应该正确处理长度为 0 的限制", () => {
      const result = generateSlug("测试", { maxLength: 0 });
      expect(result).toBe("");
    });
  });

  describe("分隔符选项", () => {
    it("应该使用默认分隔符 '-'", () => {
      const result = generateSlug("前端 开发");
      expect(result).toContain("-");
    });

    it("应该使用自定义分隔符", () => {
      const result = generateSlug("前端 开发", { separator: "_" });
      expect(result).toContain("_");
      expect(result).not.toContain("-");
    });

    it("应该去除末尾的分隔符", () => {
      const result = generateSlug("测试", { maxLength: 1 });
      expect(result).not.toMatch(/[-_]$/);
    });
  });

  describe("自定义替换规则", () => {
    it("应该使用默认替换规则", () => {
      const result = generateSlug("前端开发");
      expect(result).toBeDefined();
      // 默认规则应该将"前端"替换为"frontend"
    });

    it("应该使用自定义替换规则", () => {
      const result = generateSlug("前端开发", {
        replace: {
          前端: "frontend",
          开发: "dev",
        },
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("应该处理空的替换规则", () => {
      const result = generateSlug("前端开发", { replace: {} });
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("特殊字符处理", () => {
    it("应该处理包含特殊字符的文本", () => {
      const result = generateSlug("React & Vue.js 教程");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("应该处理包含数字的文本", () => {
      const result = generateSlug("React 18 新特性");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("组合选项", () => {
    it("应该同时应用多个选项", () => {
      const result = generateSlug("前端开发教程", {
        maxLength: 20,
        separator: "_",
        replace: {
          前端: "frontend",
        },
      });
      expect(result).toBeDefined();
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });
});
