/**
 * 🎯 智能日志工具
 *
 * 功能：
 * - 自动检测运行环境（浏览器 vs Node.js 服务器）
 * - 开发环境显示详细日志，生产环境自动优化
 * - 服务器日志会自动输出到 Vercel Functions Logs
 *
 * 使用示例：
 * ```typescript
 * import { logger } from "@/lib/logger";
 *
 * logger.debug("调试信息", data);          // 仅开发环境
 * logger.info("一般信息", result);         // 仅开发环境
 * logger.warn("警告信息", warning);        // 服务器端所有环境，客户端仅开发
 * logger.error("错误信息", error);         // 所有环境
 * ```
 */

const isDev = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";

export const logger = {
  /**
   * 🐛 调试日志
   *
   * 用途：开发时的详细调试信息
   * 输出：仅开发环境
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      const prefix = isServer ? "[Server] 🐛" : "[Client] 🐛";
      console.log(prefix, ...args);
    }
  },

  /**
   * ℹ️ 信息日志
   *
   * 用途：正常流程的关键节点记录
   * 输出：仅开发环境
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      const prefix = isServer ? "[Server] ℹ️" : "[Client] ℹ️";
      console.info(prefix, ...args);
    }
  },

  /**
   * ⚠️ 警告日志
   *
   * 用途：需要注意但不影响功能的问题
   * 输出：
   * - 服务器端：所有环境（会出现在 Vercel Logs）
   * - 客户端：仅开发环境（生产环境静默，保护用户隐私）
   */
  warn: (...args: unknown[]) => {
    if (isServer || isDev) {
      const prefix = isServer ? "[Server] ⚠️" : "[Client] ⚠️";
      console.warn(prefix, ...args);
    }
  },

  /**
   * ❌ 错误日志
   *
   * 用途：捕获和记录错误
   * 输出：
   * - 服务器端：所有环境（会出现在 Vercel Logs）
   * - 客户端：仅开发环境（生产环境静默）
   *
   * 注意：生产环境的客户端错误建议在用户界面友好提示，
   *      严重错误可以考虑集成 Sentry 等监控服务
   */
  error: (message: string, error?: unknown) => {
    const prefix = isServer ? "[Server] ❌" : "[Client] ❌";

    // 服务器端：所有环境都输出（Vercel 会收集）
    // 客户端：仅开发环境输出
    if (isServer || isDev) {
      console.error(prefix, message, error);
    }
  },
};
