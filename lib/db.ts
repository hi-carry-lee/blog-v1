// 用于创建和管理Neon数据库连接池; 全局配置对象，用于设置Neon客户端行为
import { neonConfig } from "@neondatabase/serverless";
// 允许Prisma ORM使用Neon的特殊连接方法
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// 声明全局类型，用于缓存Prisma实例
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// 声明一个函数来创建Prisma实例
function createPrismaClient() {
  // Sets up WebSocket connections for Neon
  neonConfig.webSocketConstructor = ws;
  const connectionString = `${process.env.DATABASE_URL}`;

  // Create Neon adapter for optimized serverless performance
  const adapter = new PrismaNeon({
    connectionString,
  });

  // Create PrismaClient with Neon adapter
  return new PrismaClient({ adapter });
}

// 复用已有实例或创建新实例
export const prisma = globalForPrisma.prisma || createPrismaClient();

// 在开发环境中将实例保存到全局变量
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 清理 Prisma 客户端的连接
async function cleanupPrisma() {
  await prisma.$disconnect();
}

// 应用程序退出时进行清理
process.on("beforeExit", cleanupPrisma);
process.on("SIGINT", cleanupPrisma);
process.on("SIGTERM", cleanupPrisma);
