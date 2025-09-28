"use client";

import { Search, Sun, Moon, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between px-16 py-4 bg-background border-b border-border">
      <div className="flex items-center gap-2">
        <Triangle className="w-6 h-6 text-primary fill-primary" />
        <span className="font-semibold text-lg text-foreground">
          AI Blog Platform
        </span>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
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
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Link href="/login">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Login
          </Button>
        </Link>
      </div>
    </nav>
  );
}
