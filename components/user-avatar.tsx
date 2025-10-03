"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// 用户头像组件
export default function UserAvatar({ user }: { user: User }) {
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

  // 生成字母头像
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 判断是否显示管理员菜单
  // 只在客户端且会话已加载完成后进行判断
  const showAdminMenu =
    isMounted && status === "authenticated" && session?.user?.role === "admin";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
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
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="py-1">
            {/* 使用 isMounted 确保只在客户端渲染管理员链接 */}
            {showAdminMenu && (
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            )}
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
