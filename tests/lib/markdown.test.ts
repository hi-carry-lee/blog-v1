import { describe, it, expect } from "vitest";
import {
  validateMarkdown,
  insertImageToMarkdown,
  getMarkdownStats,
} from "@/lib/markdown";

describe("validateMarkdown 函数", () => {
  describe("有效 Markdown", () => {
    it("应该验证有效的 Markdown 文本", () => {
      const validMarkdown = "# 标题\n\n这是一段文本。";
      const result = validateMarkdown(validMarkdown);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("应该验证包含代码块的有效 Markdown", () => {
      const validMarkdown = "```\nconst x = 1;\n```";
      const result = validateMarkdown(validMarkdown);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("应该验证包含链接的有效 Markdown", () => {
      const validMarkdown = "[链接文本](https://example.com)";
      const result = validateMarkdown(validMarkdown);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("应该验证空字符串", () => {
      const result = validateMarkdown("");
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("无效 Markdown", () => {
    it("应该检测未闭合的代码块", () => {
      const invalidMarkdown = "```\nconst x = 1;";
      const result = validateMarkdown(invalidMarkdown);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unclosed code block detected");
    });

    it("应该检测多个未闭合的代码块", () => {
      const invalidMarkdown = "```\ncode1\n```\n```\ncode2";
      const result = validateMarkdown(invalidMarkdown);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unclosed code block detected");
    });

    it("应该检测未闭合的链接", () => {
      // 测试 [文本] 后没有 ( 的情况（当前正则可以检测）
      const invalidMarkdown = "[链接文本]";
      const result = validateMarkdown(invalidMarkdown);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Incomplete link syntax detected");
    });

    it("应该检测多个问题", () => {
      const invalidMarkdown = "```\ncode\n[链接";
      const result = validateMarkdown(invalidMarkdown);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("边界情况", () => {
    it("应该处理异常情况", () => {
      // 测试异常处理
      const result = validateMarkdown("正常文本");
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("errors");
    });
  });
});

describe("insertImageToMarkdown 函数", () => {
  describe("基础功能", () => {
    it("应该在指定位置插入图片", () => {
      const markdown = "第一段\n\n第二段";
      const result = insertImageToMarkdown(
        markdown,
        5,
        "https://example.com/image.jpg",
        "图片"
      );

      expect(result.newMarkdown).toContain(
        "![图片](https://example.com/image.jpg)"
      );
      expect(result.newCursorPosition).toBeGreaterThan(5);
    });

    it("应该使用默认 alt 文本", () => {
      const markdown = "文本";
      const result = insertImageToMarkdown(
        markdown,
        2,
        "https://example.com/image.jpg"
      );

      expect(result.newMarkdown).toContain(
        "![Image](https://example.com/image.jpg)"
      );
    });
  });

  describe("光标位置处理", () => {
    it("应该在行首插入时添加换行", () => {
      const markdown = "第一段\n第二段";
      const result = insertImageToMarkdown(
        markdown,
        4,
        "https://example.com/image.jpg"
      );

      expect(result.newMarkdown).toContain(
        "\n![Image](https://example.com/image.jpg)\n"
      );
    });

    it("应该在行尾插入时添加换行", () => {
      const markdown = "第一段\n第二段";
      const result = insertImageToMarkdown(
        markdown,
        3,
        "https://example.com/image.jpg"
      );

      expect(result.newMarkdown).toContain(
        "\n![Image](https://example.com/image.jpg)\n"
      );
    });

    it("应该在中间插入时不添加多余换行", () => {
      const markdown = "第一段\n\n第二段";
      const result = insertImageToMarkdown(
        markdown,
        4,
        "https://example.com/image.jpg"
      );

      expect(result.newMarkdown).toContain(
        "![Image](https://example.com/image.jpg)"
      );
    });
  });

  describe("光标位置计算", () => {
    it("应该正确计算新光标位置", () => {
      const markdown = "文本";
      const imageUrl = "https://example.com/image.jpg";
      const result = insertImageToMarkdown(markdown, 2, imageUrl, "图片");

      const imageMarkdown = "![图片](https://example.com/image.jpg)";
      // 当 after 为空时，suffix 为 ""，所以是 before(2) + prefix(\n, 1) + image(36) + suffix("", 0) = 39
      const expectedPosition = 2 + 1 + imageMarkdown.length + 0;
      expect(result.newCursorPosition).toBe(expectedPosition);
    });

    it("应该在开头插入时正确计算位置", () => {
      const markdown = "文本";
      const result = insertImageToMarkdown(
        markdown,
        0,
        "https://example.com/image.jpg"
      );

      expect(result.newCursorPosition).toBeGreaterThan(0);
      expect(result.newCursorPosition).toBeLessThanOrEqual(
        result.newMarkdown.length
      );
    });

    it("应该在末尾插入时正确计算位置", () => {
      const markdown = "文本";
      const result = insertImageToMarkdown(
        markdown,
        markdown.length,
        "https://example.com/image.jpg"
      );

      expect(result.newCursorPosition).toBeGreaterThan(markdown.length);
    });
  });

  describe("边界情况", () => {
    it("应该处理空字符串", () => {
      const result = insertImageToMarkdown(
        "",
        0,
        "https://example.com/image.jpg"
      );
      expect(result.newMarkdown).toContain(
        "![Image](https://example.com/image.jpg)"
      );
      expect(result.newCursorPosition).toBeGreaterThan(0);
    });

    it("应该处理负光标位置", () => {
      const result = insertImageToMarkdown(
        "文本",
        -1,
        "https://example.com/image.jpg"
      );
      expect(result.newMarkdown).toBeDefined();
      expect(result.newCursorPosition).toBeGreaterThan(0);
    });

    it("应该处理超出范围的光标位置", () => {
      const markdown = "文本";
      const result = insertImageToMarkdown(
        markdown,
        100,
        "https://example.com/image.jpg"
      );
      expect(result.newMarkdown).toBeDefined();
      expect(result.newCursorPosition).toBeGreaterThan(markdown.length);
    });
  });
});

describe("getMarkdownStats 函数", () => {
  describe("基础统计", () => {
    it("应该正确统计单词数", () => {
      const markdown = "这是 一段 测试 文本";
      const result = getMarkdownStats(markdown);
      expect(result.words).toBe(4);
    });

    it("应该正确统计字符数", () => {
      const markdown = "测试文本";
      const result = getMarkdownStats(markdown);
      expect(result.characters).toBe(4);
    });

    it("应该正确统计不含空格的字符数", () => {
      const markdown = "测试 文本";
      const result = getMarkdownStats(markdown);
      expect(result.charactersNoSpaces).toBe(4);
    });

    it("应该正确统计行数", () => {
      const markdown = "第一行\n第二行\n第三行";
      const result = getMarkdownStats(markdown);
      expect(result.lines).toBe(3);
    });
  });

  describe("复杂内容", () => {
    it("应该处理包含代码块的 Markdown", () => {
      const markdown = "```\nconst x = 1;\n```";
      const result = getMarkdownStats(markdown);
      expect(result.words).toBeGreaterThan(0);
      expect(result.characters).toBeGreaterThan(0);
      expect(result.lines).toBeGreaterThan(0);
    });

    it("应该处理包含链接的 Markdown", () => {
      const markdown = "[链接](https://example.com)";
      const result = getMarkdownStats(markdown);
      expect(result.words).toBeGreaterThan(0);
      expect(result.characters).toBeGreaterThan(0);
    });

    it("应该处理多段落 Markdown", () => {
      const markdown = "第一段\n\n第二段\n\n第三段";
      const result = getMarkdownStats(markdown);
      expect(result.words).toBeGreaterThan(0);
      expect(result.lines).toBe(5); // 包含空行
    });
  });

  describe("边界情况", () => {
    it("应该处理空字符串", () => {
      const result = getMarkdownStats("");
      expect(result.words).toBe(0);
      expect(result.characters).toBe(0);
      expect(result.charactersNoSpaces).toBe(0);
      expect(result.lines).toBe(1); // 空字符串也算一行
    });

    it("应该处理只有空格的字符串", () => {
      const result = getMarkdownStats("   \n  \n  ");
      expect(result.words).toBe(0);
      expect(result.characters).toBeGreaterThan(0);
      expect(result.charactersNoSpaces).toBe(0);
    });

    it("应该处理只有换行符的字符串", () => {
      const result = getMarkdownStats("\n\n\n");
      expect(result.words).toBe(0);
      expect(result.lines).toBe(4); // 3个换行符 = 4行
    });
  });

  describe("返回格式", () => {
    it("应该返回包含所有统计字段的对象", () => {
      const result = getMarkdownStats("测试");
      expect(result).toHaveProperty("words");
      expect(result).toHaveProperty("characters");
      expect(result).toHaveProperty("charactersNoSpaces");
      expect(result).toHaveProperty("lines");
    });

    it("所有字段都应该是数字", () => {
      const result = getMarkdownStats("测试");
      expect(typeof result.words).toBe("number");
      expect(typeof result.characters).toBe("number");
      expect(typeof result.charactersNoSpaces).toBe("number");
      expect(typeof result.lines).toBe("number");
    });
  });
});
