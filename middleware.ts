import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// 为 middleware 创建专门的 auth 实例，只使用基础配置
const { auth } = NextAuth(authConfig);

export default auth(() => {
  // 路由保护逻辑完全由 auth.config.ts 中的 authorized 回调处理
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
