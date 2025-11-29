import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { compareSync } from "bcryptjs";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { handleOAuthSignIn } from "./lib/auth-service";

// 常量定义
const OAUTH_PROVIDERS = ["github", "google"] as const;
const DEFAULT_ROLE = "user";
const CREDENTIALS_PROVIDER = "credentials";

// 扩展用户类型以包含自定义字段
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
}

// 工具函数：检查是否为OAuth provider
const isOAuthProvider = (
  provider?: string
): provider is "github" | "google" => {
  return (
    provider !== undefined &&
    OAUTH_PROVIDERS.includes(provider as "github" | "google")
  );
};

// 工具函数：安全地记录日志
export const logAuthEvent = (
  event: string,
  provider: string,
  data?: Record<string, unknown>
) => {
  console.log(`[Auth] ${event} - ${provider}:`, data);
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        // 先检查，再断言（中小型项目，平衡类型安全和代码简洁）
        if (!credentials?.email || !credentials?.password) return null;
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // logic to verify if the user exists
        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (user && user.password) {
          const isMatch = compareSync(password, user.password);
          if (isMatch)
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
            };
        }
        return null;
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      // Credentials 登录，直接返回true，不会执行下面的逻辑，所以用户的头像使用user表中的头像
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth providers - 自动账户链接处理
      if (account && isOAuthProvider(account.provider)) {
        const result = await handleOAuthSignIn(user, account);

        if (result.success && result.userId) {
          // 重要：设置user.id为现有用户的ID，这样JWT将使用现有用户
          // 虽然 signIn callback 只返回 boolean，但它接收的 user 对象是引用传递的，修改它会影响后续的 callback 的user对象
          user.id = result.userId;
          return true;
        }

        console.error(`[Auth] OAuth sign-in failed: ${result.error}`);
        return false;
      }

      return true;
    },

    // credentials登录，oauth登录，刷新浏览器都会执行这里
    async jwt({ token, user, account, trigger, session }) {
      // 处理 session.update() 调用
      if (trigger === "update" && session) {
        // 当调用 update() 时，合并传入的 session 数据到 token
        if (session.user) {
          token.name = session.user.name ?? token.name;
          token.email = session.user.email ?? token.email;
          token.image = session.user.image ?? token.image;
        }
        return token;
      }

      // 首次登录时，user 对象存在，需要初始化基本信息
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name ?? null;
        token.image = user.image ?? null;
        // 安全地处理 role 字段
        token.role = (user as ExtendedUser).role || DEFAULT_ROLE;
        // 记录登录方式
        token.currentProvider = account?.provider || CREDENTIALS_PROVIDER;
      }

      // 确保基本字段有默认值
      if (!token.currentProvider) {
        token.currentProvider = CREDENTIALS_PROVIDER;
      }

      return token;
    },

    async session({ session, token }) {
      // 将 token 中的用户数据传递到 session
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string | null;
        // 安全地扩展 session.user 对象
        Object.assign(session.user, {
          role: token.role as string,
          currentProvider:
            (token.currentProvider as string) || CREDENTIALS_PROVIDER,
        });
      }
      return session;
    },
  },
});
