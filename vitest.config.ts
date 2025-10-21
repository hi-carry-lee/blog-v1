// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv"; // 需要安装: npm install -D dotenv

// 在配置文件顶部加载环境变量
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
