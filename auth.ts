import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { compareSync } from "bcryptjs";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";

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

// 工具函数：获取Account信息
const getAccountByProvider = async (
  provider: string,
  providerAccountId: string
) => {
  try {
    return await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching account for provider ${provider}:`, error);
    return null;
  }
};

// 工具函数：安全地记录日志
const logAuthEvent = (
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
        if (credentials === null) return null;

        // logic to verify if the user exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (user && user.password) {
          // params order is important;💯
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
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
    // 只保留需要数据库操作的 callbacks
    async signIn({ user, account }) {
      // Credentials 登录，直接返回true，不会执行下面的逻辑，所以用户的头像使用user表中的头像
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth providers - 自动账户链接处理
      if (account && isOAuthProvider(account.provider)) {
        // 基本验证：确保有邮箱
        if (!user.email) {
          console.error(
            `[Auth] OAuth user missing email - ${account.provider}`
          );
          return false;
        }

        try {
          // 检查是否已存在相同邮箱的用户
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { account: true },
          });

          if (existingUser) {
            // 检查是否已经链接了当前provider
            const existingAccount = existingUser.account.find(
              (acc) => acc.provider === account.provider
            );

            if (!existingAccount) {
              // 重要：在修改user对象之前保存原始的OAuth信息
              const originalProviderName = user.name;
              const originalProviderImage = user.image;

              // 自动链接新的OAuth账户到现有用户
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state
                    ? String(account.session_state)
                    : null,
                  // 存储当前provider的原始OAuth信息
                  providerName: originalProviderName,
                  providerImage: originalProviderImage,
                },
              });

              logAuthEvent("Account linked", account.provider, {
                email: user.email,
                providerName: originalProviderName,
                hasImage: !!originalProviderImage,
              });
            } else {
              // 如果账户已存在，更新provider信息（以防OAuth信息有更新）
              await prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                  providerName: user.name,
                  providerImage: user.image,
                  // 也更新OAuth tokens
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                },
              });

              logAuthEvent("Account updated", account.provider, {
                email: user.email,
                providerName: user.name,
                hasImage: !!user.image,
              });
            }

            // 重要：设置user.id为现有用户的ID，这样JWT将使用现有用户
            user.id = existingUser.id;
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    // credentials登录，oauth登录，刷新浏览器都会执行这里，但是执行逻辑不一样
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
        // 安全地处理 role 字段
        token.role = (user as ExtendedUser).role || DEFAULT_ROLE;
      }

      // 每次有account信息时都要检查并更新provider相关信息
      // 这确保：切换 不同provider登录时会更新头像和名字
      // credentials登录时，刷新浏览器不会触发这里执行，因为刷新时没有Account信息
      if (account) {
        if (isOAuthProvider(account.provider)) {
          // OAuth登录：从Account表获取provider特定信息
          token.currentProvider = account.provider;

          const currentAccount = await getAccountByProvider(
            account.provider,
            account.providerAccountId
          );

          if (
            currentAccount &&
            currentAccount.providerName &&
            currentAccount.providerImage
          ) {
            // 使用Account表中存储的provider特定信息
            token.name = currentAccount.providerName;
            token.image = currentAccount.providerImage;

            logAuthEvent("Using stored profile", account.provider, {
              name: token.name,
              hasImage: !!token.image,
            });
          } else if (user) {
            // 回退：使用OAuth提供的信息（首次登录或数据缺失时）
            token.name = user.name;
            token.image = user.image;

            logAuthEvent("Using OAuth profile (fallback)", account.provider, {
              name: token.name,
              hasImage: !!token.image,
            });
          }
        } else if (account.provider === CREDENTIALS_PROVIDER) {
          // Credentials登录
          token.currentProvider = CREDENTIALS_PROVIDER;
          if (user) {
            token.name = user.name;
            token.image = user.image;
          }
        }
      }

      // 页面刷新时：根据存储的provider信息获取对应的头像和名字
      // credentials登录，在刷新的时候，这里也不满足，但是oauth登录，刷新时会执行这里
      if (
        !account &&
        token.currentProvider &&
        token.currentProvider !== CREDENTIALS_PROVIDER &&
        token.id &&
        isOAuthProvider(token.currentProvider as string)
      ) {
        try {
          const lastAccount = await prisma.account.findFirst({
            where: {
              userId: token.id as string,
              provider: token.currentProvider as string,
            },
            orderBy: { updatedAt: "desc" },
          });

          if (
            lastAccount &&
            lastAccount.providerName &&
            lastAccount.providerImage
          ) {
            token.name = lastAccount.providerName;
            token.image = lastAccount.providerImage;
          }
        } catch (error) {
          console.error(
            `[Auth] Error fetching last provider info for ${token.currentProvider}:`,
            error
          );
        }
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
