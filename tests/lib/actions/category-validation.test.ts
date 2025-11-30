import { describe, it, expect, vi, beforeEach } from "vitest";
import { slugUniqueValidate } from "@/lib/actions/category";
import { prisma } from "@/lib/db";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
  },
}));

describe("slugUniqueValidate (Category)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("有效 slug", () => {
    it("应该通过不存在的 slug", async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const result = await slugUniqueValidate("new-category-slug");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Slug is unique");
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: "new-category-slug" },
      });
    });

    it("应该自动去除前后空格", async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const result = await slugUniqueValidate("  trimmed-slug  ");

      expect(result.success).toBe(true);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: "trimmed-slug" },
      });
    });
  });

  describe("无效 slug", () => {
    it("应该拒绝空的 slug", async () => {
      const result = await slugUniqueValidate("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid slug provided");
      expect(prisma.category.findUnique).not.toHaveBeenCalled();
    });

    it("应该拒绝只有空格的 slug", async () => {
      const result = await slugUniqueValidate("   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid slug provided");
    });

    it("应该拒绝 null 或 undefined", async () => {
      const result1 = await slugUniqueValidate(null);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe("Invalid slug provided");

      const result2 = await slugUniqueValidate(undefined);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe("Invalid slug provided");
    });

    it("应该拒绝非字符串类型", async () => {
      // @ts-expect-error - 测试边界情况（数字类型不在允许的类型中）
      const result = await slugUniqueValidate(123);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid slug provided");
    });

    it("应该拒绝已存在的 slug", async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: "existing-category-id",
        name: "Existing Category",
        slug: "existing-slug",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await slugUniqueValidate("existing-slug");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Slug already exists");
    });
  });

  describe("错误处理", () => {
    it("应该处理数据库错误", async () => {
      vi.mocked(prisma.category.findUnique).mockRejectedValue(
        new Error("Database error")
      );

      const result = await slugUniqueValidate("test-slug");

      expect(result.success).toBe(false);
      // category.ts 的错误处理返回 error.message
      expect(result.error).toBe("Database error");
    });
  });
});
