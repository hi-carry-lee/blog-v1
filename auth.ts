import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { compareSync } from "bcryptjs";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";

// 扩展用户类型以包含自定义字段
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
}

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
      // Credentials provider
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth providers - 适配器自动处理，只做基本验证
      if (account?.provider === "github" || account?.provider === "google") {
        // 基本验证：确保有邮箱
        if (!user.email) {
          console.error("OAuth user missing email");
          return false;
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      // 首次登录时，user 对象存在
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        // 安全地处理 role 字段
        token.role = (user as ExtendedUser).role || "user";
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
        Object.assign(session.user, { role: token.role as string });
      }
      return session;
    },
  },
});
