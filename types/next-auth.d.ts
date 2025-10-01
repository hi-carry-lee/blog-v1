import { DefaultSession } from "next-auth";

// 这里只是扩展类型，并不是真正的类型定义
// 真正的类型定义在 auth.ts 中
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      currentProvider: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    currentProvider: string;
  }
}
