"use client";

import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import SearchInput from "@/components/search-input";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import UserAvatar from "./user-avatar";
import { useState, useEffect } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-background border-b border-border">
      {/* Desktop and Mobile Header */}
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-16 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-primary/10">
          <Link href="/" className="font-semibold text-lg text-primary">
            AI Blog Platform
          </Link>
        </div>

        {/* Desktop Search Bar - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
          <SearchInput className="flex-1" />
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/posts"
              className="text-foreground hover:text-primary transition-colors"
            >
              Posts
            </Link>
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-primary"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <Moon className="w-4 h-4" />
            ) : theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* 条件渲染：登录状态显示头像，未登录显示登录按钮 */}
          {session?.user ? (
            <UserAvatar user={session.user} isNavbar={true} />
          ) : (
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Right Section: Avatar/Login, Theme Toggle, and Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Auth */}
          {session?.user ? (
            <UserAvatar
              key={session.user.image}
              user={session.user}
              isNavbar={true}
            />
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Login
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-primary"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <Moon className="w-4 h-4" />
            ) : theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-4">
            <SearchInput />

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/posts"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Posts
              </Link>
              <Link
                href="/about"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
