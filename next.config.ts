import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 🚀 生产环境优化：自动移除 console.log
  // 保留 console.error 和 console.warn 用于错误追踪
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"], // 保留错误和警告日志
          }
        : false, // 开发环境保留所有日志
  },

  images: {
    remotePatterns: [
      // Google 用户头像
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // GitHub 用户头像
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      // Cloudinary 图片
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
