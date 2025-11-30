"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tag,
  Users,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { RequireRole } from "@/components/auth/require-auth";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Posts", href: "/dashboard/posts" },
  { icon: FolderOpen, label: "Categories", href: "/dashboard/categories" },
  { icon: Tag, label: "Tags", href: "/dashboard/tags" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: MessageSquare, label: "Comments", href: "/dashboard/comments" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RequireRole
      allowedRoles={["admin"]}
      message="You don't have permission to access the admin dashboard. This area is restricted to administrators only."
    >
      <div className="min-h-screen bg-background">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-semibold text-lg text-primary">
                AI Bloggr
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* 
        关键布局解决方案：使用 Flexbox 解决垂直滚动条问题
        
        核心思路：
        1. 父容器使用 flex flex-col min-h-screen - 创建垂直弹性布局，最小高度为屏幕高度
        2. Navbar 和 Mobile Header 占用固定空间
        3. main 使用 flex-1 - 自动占用剩余的所有可用空间
        
        为什么这样能解决滚动条问题：
        - 不再使用硬编码的 calc(100vh-4rem)，避免了不准确的高度计算
        - flex-1 让 main 元素自动适应剩余空间，无论 navbar 实际高度是多少
        - 在不同缩放比例下都能正确计算，因为浏览器自动处理 flexbox 布局
        - 内容不足时不会产生多余滚动，内容超出时才会滚动
      */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Navbar - 固定高度区域 */}
          <Navbar />

          {/* Mobile Header with Hamburger Menu - 仅移动端显示的固定高度区域 */}
          <div className="sticky top-0 z-30 lg:hidden bg-card border-b border-border px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* 
          Page Content - 关键的弹性区域
          flex-1: 占用父容器中除了 navbar 和 mobile header 之外的所有剩余空间
          这确保了页面内容区域始终填满可用空间，不会产生不必要的滚动条
        */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
