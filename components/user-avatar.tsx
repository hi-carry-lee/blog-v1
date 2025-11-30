"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

// 用户头像组件
function UserAvatarComponent({
  user,
  isNavbar = false,
}: {
  user: {
    id?: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
    role?: string;
  };
  isNavbar: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  // 确保组件已挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // 判断是否显示管理员菜单
  const showAdminMenu =
    status === "authenticated" && session?.user?.role === "admin";

  // 只有管理员才显示整个组件
  if (!isMounted || !user) {
    // 返回一个占位符而不是 null，避免水合不匹配
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/20">
        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-8 h-8 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 p-0"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {getInitials(user.name || user.email || "U")}
          </div>
        )}
      </Button>

      {/* 下拉菜单 */}
      {showDropdown && isNavbar && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="py-1">
            {showAdminMenu && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start h-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 使用动态导入，禁用服务端渲染
export default dynamic(() => Promise.resolve(UserAvatarComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/20">
      <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
        <div className="w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
      </div>
    </div>
  ),
});
