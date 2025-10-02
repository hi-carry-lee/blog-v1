"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Crown, User } from "lucide-react";
import { UserWithPosts } from "@/lib/actions/user";
import Pagination from "@/components/pagination";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";

type Props = {
  initialUsers: UserWithPosts[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

// 角色徽章组件
const RoleBadge = ({ role }: { role: string }) => {
  const roleConfig = getRoleConfig(role);

  return (
    <Badge variant={roleConfig.variant} className={roleConfig.className}>
      {roleConfig.icon}
      {roleConfig.text}
    </Badge>
  );
};

// 角色配置
const getRoleConfig = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return {
        icon: <Crown className="w-3 h-3" />,
        text: "Administrator",
        variant: "default" as const,
        className:
          "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      };
    default:
      return {
        icon: <User className="w-3 h-3" />,
        text: "User",
        variant: "secondary" as const,
        className: "",
      };
  }
};

export default function UserTable({
  initialUsers,
  totalPages,
  currentPage,
  totalCount,
}: Props) {
  const { info } = useSemanticToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Handle view comments (placeholder function)
  const handleViewComments = (userId: string, userName: string) => {
    // TODO: 当评论模块开发完成后，导航到用户评论页面
    info(`View comments for user: ${userName} (Feature coming soon)`);
    console.log(`Viewing comments for user ID: ${userId}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`/dashboard/users?page=${page}`);
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Users
        </h1>
        <div className="text-sm text-muted-foreground">
          Total users: {totalCount}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 md:px-6">User</TableHead>
              <TableHead className="px-4 md:px-6">Role</TableHead>
              <TableHead className="px-4 md:px-6">Posts</TableHead>
              <TableHead className="px-4 md:px-6">Joined</TableHead>
              <TableHead className="px-4 md:px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 md:px-6 py-8 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              initialUsers.map((user) => (
                <TableRow key={user.id}>
                  {/* User Name */}
                  <TableCell className="px-4 md:px-6 font-medium">
                    {user.name}
                  </TableCell>

                  {/* Role */}
                  <TableCell className="px-4 md:px-6">
                    <RoleBadge role={user.role} />
                  </TableCell>

                  {/* Posts Count */}
                  <TableCell className="px-4 md:px-6 text-muted-foreground">
                    {user.postCount}
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell className="px-4 md:px-6 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 md:px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewComments(user.id, user.name)}
                        className="h-8 gap-2 text-xs"
                        disabled={isPending}
                      >
                        <MessageSquare className="w-3 h-3" />
                        Comments
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={totalCount}
            pageSize={5}
            isLoading={isPending}
          />
        )}
      </div>
    </>
  );
}
