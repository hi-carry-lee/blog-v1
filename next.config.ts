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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // 禁止你的网站被嵌入到任何<iframe>中,防止点击劫持攻击（Clickjacking）
            // blog通常不需要被嵌入，用DENY没问题
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // 强制浏览器严格按照Content-Type解析资源,防止MIME类型嗅探攻击——浏览器可能把文本文件当作脚本执行
            // 通用防护，建议所有项目都加上
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
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
      // Pollinations.ai 图片
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
        pathname: "/**",
      },
      // Placeholder 图片
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
