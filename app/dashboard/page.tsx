"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for articles
const mockArticles = [
  {
    id: 1,
    title: "The Future of AI in Content Creation",
    status: "Published",
    category: "AI",
    time: "2023-08-15",
  },
  {
    id: 2,
    title: "Mastering SEO for Bloggers",
    status: "Draft",
    category: "SEO",
    time: "2023-08-10",
  },
  {
    id: 3,
    title: "Building a Successful Blog from Scratch",
    status: "Published",
    category: "Blogging",
    time: "2023-08-05",
  },
  {
    id: 4,
    title: "Monetizing Your Blog: Strategies and Tips",
    status: "Published",
    category: "Monetization",
    time: "2023-07-28",
  },
  {
    id: 5,
    title: "The Ultimate Guide to Content Marketing",
    status: "Draft",
    category: "Marketing",
    time: "2023-07-20",
  },
];

export default function DashboardPage() {
  const [currentPage] = useState(1);
  const totalPages = 24; // 120 results / 5 per page

  // Empty handler functions as requested
  const handleNewArticle = () => {};
  const handleNewCategory = () => {};
  const handleEdit = () => {};
  const handleDelete = () => {};
  const handlePageChange = () => {};

  return (
    // 页面容器配合 layout 的 flex-1 工作
    // min-h-full: 确保内容至少填满父容器的高度
    // bg-background: 设置背景色
    <div className="bg-background min-h-full">
      {/* 
        Main Dashboard Content - 内容区域优化
        
        优化后的响应式边距设置：
        - px-3 md:px-4 lg:px-6: 小屏幕12px，中屏幕16px，大屏幕24px (减少了空白)
        - py-3 md:py-4 lg:py-5: 小屏幕12px，中屏幕16px，大屏幕20px (更紧凑的垂直间距)
        - max-w-6xl: 最大宽度1152px (从1280px减少到1152px，减少左右空白)
        - mx-auto: 水平居中
      */}
      <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleNewArticle}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Button>
            <Button
              onClick={handleNewCategory}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          {/* Total Articles */}
          <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">
              Total Articles
            </div>
            <div className="text-3xl font-bold text-foreground">120</div>
          </div>

          {/* Category Count */}
          <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">
              Category Count
            </div>
            <div className="text-3xl font-bold text-foreground">15</div>
          </div>

          {/* Tag Count */}
          <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">Tag Count</div>
            <div className="text-3xl font-bold text-foreground">30</div>
          </div>

          {/* Visitor Statistics */}
          <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">
              Visitor Statistics
            </div>
            <div className="text-3xl font-bold text-foreground">5,000</div>
          </div>
        </div>

        {/* Recent Articles Section */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Articles
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 md:px-6 py-2 md:py-3 text-sm font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 md:px-6 py-2 md:py-3 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 md:px-6 py-2 md:py-3 text-sm font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-4 md:px-6 py-2 md:py-3 text-sm font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="text-left px-4 md:px-6 py-2 md:py-3 text-sm font-medium text-muted-foreground">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-foreground">
                      {article.title}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                          article.status === "Published"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground">
                      {article.category}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground">
                      {article.time}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleEdit}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDelete}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing 1 to 5 of 120 results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePageChange}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={handlePageChange}
                    className={cn(
                      "w-8 h-8 p-0",
                      currentPage === page &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    {page}
                  </Button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePageChange}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePageChange}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
