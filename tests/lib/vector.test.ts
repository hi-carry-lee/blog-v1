import { describe, it, expect } from "vitest";
import { vectorToSQL } from "@/lib/vector";

describe("vectorToSQL 函数", () => {
  describe("基础功能", () => {
    it("应该将向量数组转换为 SQL 格式", () => {
      const vector = [0.1, 0.2, 0.3, 0.4, 0.5];
      const result = vectorToSQL(vector);
      expect(result).toBe("[0.1,0.2,0.3,0.4,0.5]");
    });

    it("应该处理单个元素的向量", () => {
      const vector = [0.5];
      const result = vectorToSQL(vector);
      expect(result).toBe("[0.5]");
    });

    it("应该处理大向量", () => {
      const vector = Array.from({ length: 1536 }, (_, i) => i * 0.001);
      const result = vectorToSQL(vector);
      expect(result).toMatch(/^\[.*\]$/);
      expect(result.split(",").length).toBe(1536);
    });

    it("应该处理负数", () => {
      const vector = [-0.1, 0.2, -0.3];
      const result = vectorToSQL(vector);
      expect(result).toBe("[-0.1,0.2,-0.3]");
    });

    it("应该处理零值", () => {
      const vector = [0, 0.5, 0];
      const result = vectorToSQL(vector);
      expect(result).toBe("[0,0.5,0]");
    });
  });

  describe("输入验证", () => {
    it("应该对空数组抛出错误", () => {
      expect(() => vectorToSQL([])).toThrow("Vector must be a non-empty array");
    });

    it("应该对非数组输入抛出错误", () => {
      // @ts-expect-error - 测试类型错误
      expect(() => vectorToSQL(null)).toThrow(
        "Vector must be a non-empty array"
      );
      // @ts-expect-error - 测试类型错误
      expect(() => vectorToSQL(undefined)).toThrow(
        "Vector must be a non-empty array"
      );
      // @ts-expect-error - 测试类型错误
      expect(() => vectorToSQL("not an array")).toThrow(
        "Vector must be a non-empty array"
      );
    });

    it("应该对包含非数字的元素抛出错误", () => {
      // @ts-expect-error - 测试类型错误
      expect(() => vectorToSQL([1, "2", 3])).toThrow(
        "Vector must contain only finite numbers"
      );
      // @ts-expect-error - 测试类型错误
      expect(() => vectorToSQL([1, null, 3])).toThrow(
        "Vector must contain only finite numbers"
      );
    });

    it("应该对包含 Infinity 的元素抛出错误", () => {
      expect(() => vectorToSQL([1, Infinity, 3])).toThrow(
        "Vector must contain only finite numbers"
      );
      expect(() => vectorToSQL([1, -Infinity, 3])).toThrow(
        "Vector must contain only finite numbers"
      );
    });

    it("应该对包含 NaN 的元素抛出错误", () => {
      expect(() => vectorToSQL([1, NaN, 3])).toThrow(
        "Vector must contain only finite numbers"
      );
    });
  });

  describe("浮点数精度", () => {
    it("应该保持浮点数精度", () => {
      const vector = [0.123456789, 0.987654321];
      const result = vectorToSQL(vector);
      expect(result).toContain("0.123456789");
      expect(result).toContain("0.987654321");
    });

    it("应该处理科学计数法", () => {
      const vector = [1e-5, 1e5];
      const result = vectorToSQL(vector);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("格式验证", () => {
    it("应该以方括号开头和结尾", () => {
      const vector = [0.1, 0.2, 0.3];
      const result = vectorToSQL(vector);
      expect(result.startsWith("[")).toBe(true);
      expect(result.endsWith("]")).toBe(true);
    });

    it("应该用逗号分隔元素", () => {
      const vector = [0.1, 0.2, 0.3];
      const result = vectorToSQL(vector);
      const parts = result.slice(1, -1).split(",");
      expect(parts.length).toBe(3);
    });

    it("不应该在元素之间有空格", () => {
      const vector = [0.1, 0.2, 0.3];
      const result = vectorToSQL(vector);
      expect(result).not.toContain(" ");
    });
  });
});
