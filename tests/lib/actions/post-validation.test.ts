import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePostSlug } from "@/lib/actions/post";
import { prisma } from "@/lib/db";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock auth (post.ts 导入了 auth)
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("validatePostSlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("有效 slug", () => {
    it("应该通过不存在的 slug", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

      const result = await validatePostSlug("new-slug");

      expect(result.success).toBe(true);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { slug: "new-slug" },
        select: { id: true },
      });
    });

    it("应该通过已存在但排除当前ID的 slug（更新场景）", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "existing-post-id",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await validatePostSlug(
        "existing-slug",
        "existing-post-id"
      );

      expect(result.success).toBe(true);
    });
  });

  describe("无效 slug", () => {
    it("应该拒绝空的 slug", async () => {
      const result = await validatePostSlug("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Slug cannot be empty");
      expect(prisma.post.findUnique).not.toHaveBeenCalled();
    });

    it("应该拒绝只有空格的 slug", async () => {
      const result = await validatePostSlug("   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Slug cannot be empty");
    });

    it("应该拒绝已存在的 slug", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "existing-post-id",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await validatePostSlug("existing-slug");

      expect(result.success).toBe(false);
      expect(result.error).toBe("This slug is already taken");
    });

    it("应该拒绝已存在且不是当前编辑文章的 slug", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "other-post-id",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await validatePostSlug("existing-slug", "current-post-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("This slug is already taken");
    });
  });

  describe("错误处理", () => {
    it("应该处理数据库错误", async () => {
      vi.mocked(prisma.post.findUnique).mockRejectedValue(
        new Error("Database error")
      );

      const result = await validatePostSlug("test-slug");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Validation failed");
    });
  });
});
