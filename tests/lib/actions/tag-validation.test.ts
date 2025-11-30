import { describe, it, expect, vi, beforeEach } from "vitest";
import { slugUniqueValidate } from "@/lib/actions/tag";
import { prisma } from "@/lib/db";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    tag: {
      findUnique: vi.fn(),
    },
  },
}));

describe("slugUniqueValidate (Tag)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("有效 slug", () => {
    it("应该通过不存在的 slug", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(null);

      const result = await slugUniqueValidate("new-tag-slug");

      expect(result.success).toBe(true);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { slug: "new-tag-slug" },
        select: { id: true },
      });
    });
  });

  describe("无效 slug", () => {
    it("应该拒绝空的 slug", async () => {
      const result = await slugUniqueValidate("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Slug cannot be empty");
      expect(prisma.tag.findUnique).not.toHaveBeenCalled();
    });

    it("应该拒绝只有空格的 slug", async () => {
      const result = await slugUniqueValidate("   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Slug cannot be empty");
    });

    it("应该拒绝已存在的 slug", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue({
        id: "existing-tag-id",
        name: "Existing Tag",
        slug: "existing-slug",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await slugUniqueValidate("existing-slug");

      expect(result.success).toBe(false);
      expect(result.error).toBe("This slug is already taken");
    });
  });

  describe("错误处理", () => {
    it("应该处理数据库错误", async () => {
      vi.mocked(prisma.tag.findUnique).mockRejectedValue(
        new Error("Database error")
      );

      const result = await slugUniqueValidate("test-slug");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Validation failed");
    });
  });
});
