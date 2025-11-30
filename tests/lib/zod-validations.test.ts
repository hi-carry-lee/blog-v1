import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  categorySchema,
  tagSchema,
  postSchema,
} from "@/lib/zod-validations";

describe("loginSchema", () => {
  describe("有效数据", () => {
    it("应该通过有效的登录数据", () => {
      const validData = {
        email: "user@example.com",
        password: "password123",
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validData.email);
        expect(result.data.password).toBe(validData.password);
      }
    });

    it("应该通过最小长度的密码", () => {
      const validData = {
        email: "user@example.com",
        password: "123456", // 正好6个字符
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("无效数据", () => {
    it("应该拒绝无效的邮箱", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid email");
      }
    });

    it("应该拒绝空密码", () => {
      const invalidData = {
        email: "user@example.com",
        password: "",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝少于6个字符的密码", () => {
      const invalidData = {
        email: "user@example.com",
        password: "12345", // 只有5个字符
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("6 characters");
      }
    });

    it("应该拒绝缺少字段的数据", () => {
      const invalidData = {
        email: "user@example.com",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("registerSchema", () => {
  describe("有效数据", () => {
    it("应该通过有效的注册数据", () => {
      const validData = {
        name: "John Doe",
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该通过最小长度的名称", () => {
      const validData = {
        name: "AB", // 正好2个字符
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("无效数据", () => {
    it("应该拒绝名称少于2个字符", () => {
      const invalidData = {
        name: "A", // 只有1个字符
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝无效的邮箱", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝密码少于6个字符", () => {
      const invalidData = {
        name: "John Doe",
        email: "user@example.com",
        password: "12345",
        confirmPassword: "12345",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝密码不匹配", () => {
      const invalidData = {
        name: "John Doe",
        email: "user@example.com",
        password: "password123",
        confirmPassword: "different123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find((issue) =>
          issue.path.includes("confirmPassword")
        );
        expect(confirmPasswordError?.message).toContain("match");
      }
    });
  });
});

describe("profileUpdateSchema", () => {
  describe("有效数据", () => {
    it("应该通过有效的个人资料更新数据", () => {
      const validData = {
        name: "John Doe",
        email: "user@example.com",
      };
      const result = profileUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("无效数据", () => {
    it("应该拒绝名称少于2个字符", () => {
      const invalidData = {
        name: "A",
        email: "user@example.com",
      };
      const result = profileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝无效的邮箱", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
      };
      const result = profileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("categorySchema", () => {
  describe("有效数据", () => {
    it("应该通过有效的分类数据", () => {
      const validData = {
        name: "前端开发",
        slug: "frontend-development",
      };
      const result = categorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该通过最小长度的名称和slug", () => {
      const validData = {
        name: "AB",
        slug: "AB",
      };
      const result = categorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("无效数据", () => {
    it("应该拒绝名称少于2个字符", () => {
      const invalidData = {
        name: "A",
        slug: "frontend",
      };
      const result = categorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝slug少于2个字符", () => {
      const invalidData = {
        name: "前端开发",
        slug: "A",
      };
      const result = categorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝缺少字段", () => {
      const invalidData = {
        name: "前端开发",
      };
      const result = categorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("tagSchema", () => {
  describe("有效数据", () => {
    it("应该通过有效的标签数据", () => {
      const validData = {
        name: "React",
        slug: "react",
      };
      const result = tagSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("无效数据", () => {
    it("应该拒绝名称少于2个字符", () => {
      const invalidData = {
        name: "R",
        slug: "react",
      };
      const result = tagSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝slug少于2个字符", () => {
      const invalidData = {
        name: "React",
        slug: "r",
      };
      const result = tagSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("postSchema", () => {
  describe("有效数据", () => {
    it("应该通过有效的文章数据", () => {
      const validData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
        tagIds: ["tag1", "tag2"],
        published: false,
        featured: false,
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该通过带可选字段的文章数据", () => {
      const validData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
        coverImage: "https://example.com/image.jpg",
        metaTitle: "SEO 标题",
        metaDescription: "SEO 描述",
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该通过空字符串的 coverImage", () => {
      const validData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
        coverImage: "",
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该使用默认值", () => {
      const validData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tagIds).toEqual([]);
        expect(result.data.published).toBe(false);
        expect(result.data.featured).toBe(false);
      }
    });
  });

  describe("无效数据", () => {
    it("应该拒绝标题少于2个字符", () => {
      const invalidData = {
        title: "R",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝slug少于2个字符", () => {
      const invalidData = {
        title: "React 教程",
        slug: "r",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝brief少于10个字符", () => {
      const invalidData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "简短", // 只有2个字符
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝content少于20个字符", () => {
      const invalidData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "内容太短", // 只有4个字符
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝无效的 coverImage URL", () => {
      const invalidData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
        coverImage: "not-a-valid-url",
      };
      const result = postSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("应该拒绝空的 categoryId", () => {
      const invalidData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "",
      };
      const result = postSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("边界值", () => {
    it("应该通过正好2个字符的标题", () => {
      const validData = {
        title: "AB",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该通过正好10个字符的brief", () => {
      const validData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "1234567890", // 正好10个字符
        content: "这是文章的详细内容，至少需要20个字符才能通过验证。",
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应该通过正好20个字符的content", () => {
      const validData = {
        title: "React 教程",
        slug: "react-tutorial",
        brief: "这是一篇关于 React 的详细教程",
        content: "12345678901234567890", // 正好20个字符
        categoryId: "category-id",
      };
      const result = postSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
