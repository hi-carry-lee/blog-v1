# Next-themes 完整使用指南

## 📦 安装

```bash
npm install next-themes
# 或
yarn add next-themes
# 或
pnpm add next-themes
```

## 🚀 快速开始

### 步骤 1: 创建 ThemeProvider 组件

创建 `components/providers/theme-provider.tsx`：

```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"           // 使用 class 属性（配合 Tailwind CSS）
      defaultTheme="system"       // 默认主题：system/light/dark
      enableSystem               // 启用系统主题检测
      disableTransitionOnChange  // 禁用主题切换时的过渡动画（可选）
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 步骤 2: 在根布局中添加 ThemeProvider

修改 `app/layout.tsx`：

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ⚠️ 重要：必须添加 suppressHydrationWarning */}
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**关键点：**
- ✅ `<html>` 标签必须添加 `suppressHydrationWarning` 属性
- ✅ `ThemeProvider` 必须包裹整个应用

### 步骤 3: 在组件中使用主题

#### 基础用法（带 hydration 保护）

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ⚠️ 重要：防止 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 在 mounted 之前显示占位符，避免服务端和客户端渲染不一致
  if (!mounted) {
    return (
      <button>
        <Moon className="w-4 h-4" /> {/* 默认图标 */}
      </button>
    );
  }

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
```

#### 简化写法（推荐）

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button onClick={toggleTheme}>
      {/* 使用三元表达式，未 mounted 时显示默认值 */}
      {!mounted ? (
        <Moon className="w-4 h-4" />
      ) : theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
```

## 🔧 配置选项详解

### ThemeProvider 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `attribute` | `string` | `"class"` | 应用到 HTML 元素的属性名（通常为 `"class"` 配合 Tailwind） |
| `defaultTheme` | `"system" \| "light" \| "dark"` | `"system"` | 默认主题 |
| `enableSystem` | `boolean` | `true` | 是否启用系统主题检测 |
| `disableTransitionOnChange` | `boolean` | `false` | 是否禁用主题切换时的过渡动画 |
| `storageKey` | `string` | `"theme"` | localStorage 存储键名 |
| `forcedTheme` | `string` | `undefined` | 强制使用某个主题（用于特定页面） |

### useTheme Hook 返回值

```tsx
const {
  theme,          // 当前主题："light" | "dark" | "system" | undefined
  setTheme,       // 设置主题的函数
  resolvedTheme,  // 解析后的主题："light" | "dark"（会自动解析 system）
  systemTheme,    // 系统主题："light" | "dark"
} = useTheme();
```

**注意事项：**
- `theme` 在 hydration 之前可能是 `undefined`
- `resolvedTheme` 会自动将 `"system"` 解析为实际主题
- 始终使用 `mounted` 状态检查来避免 hydration 错误

## 🎨 配合 Tailwind CSS 使用

### 1. 配置 Tailwind CSS

确保 `tailwind.config.js` 或 `globals.css` 中启用了暗黑模式：

```js
// tailwind.config.js (v3)
module.exports = {
  darkMode: 'class', // 使用 class 策略
  // ...
}
```

```css
/* globals.css (Tailwind CSS v4) */
@custom-variant dark (&:is(.dark *));
```

### 2. 在 CSS 中使用

```css
/* 默认样式 */
.card {
  background: white;
  color: black;
}

/* 暗黑模式样式 */
.dark .card {
  background: black;
  color: white;
}
```

### 3. 在 JSX 中使用 Tailwind 类

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  内容
</div>
```

## ⚠️ 常见问题与解决方案

### 问题 1: Hydration 错误

**错误信息：**
```
Hydration failed because the server rendered HTML didn't match the client
```

**原因：**
- 组件在服务端和客户端渲染的结果不一致
- `useTheme()` 在服务端返回 `undefined`，客户端返回实际主题值

**解决方案：**
1. ✅ 在 `<html>` 标签添加 `suppressHydrationWarning`
2. ✅ 使用 `mounted` 状态检查
3. ✅ 在 `mounted` 之前显示占位符

### 问题 2: 主题切换后页面闪烁

**原因：**
- 主题切换时 CSS 过渡动画导致的视觉闪烁

**解决方案：**
```tsx
<ThemeProvider disableTransitionOnChange>
  {children}
</ThemeProvider>
```

### 问题 3: 系统主题检测不工作

**原因：**
- `enableSystem` 未启用
- 浏览器不支持 `prefers-color-scheme`

**解决方案：**
```tsx
<ThemeProvider enableSystem defaultTheme="system">
  {children}
</ThemeProvider>
```

### 问题 4: 主题切换按钮显示错误图标

**原因：**
- 没有处理 `mounted` 状态
- 直接使用 `theme` 值进行条件渲染

**解决方案：**
```tsx
// ❌ 错误做法
{theme === "dark" ? <Sun /> : <Moon />}

// ✅ 正确做法
{!mounted ? (
  <Moon /> // 默认占位符
) : theme === "dark" ? (
  <Sun />
) : (
  <Moon />
)}
```

## 📝 完整示例

### 示例 1: Navbar 主题切换按钮

```tsx
"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
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
  );
}
```

### 示例 2: 根据主题调整组件样式

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemedCard() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-gray-100">Loading...</div>;
  }

  return (
    <div
      className={
        resolvedTheme === "dark"
          ? "bg-gray-800 text-white"
          : "bg-white text-black"
      }
    >
      内容
    </div>
  );
}
```

### 示例 3: 与第三方组件库集成（如 Sonner Toast）

```tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { useEffect, useState } from "react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 未 mounted 时使用默认主题
  if (!mounted) {
    return <Sonner theme="system" {...props} />;
  }

  return <Sonner theme={theme as ToasterProps["theme"]} {...props} />;
};

export { Toaster };
```

## ✅ 最佳实践检查清单

使用 next-themes 时，请确保：

- [ ] ✅ 安装了 `next-themes` 包
- [ ] ✅ 创建了 `ThemeProvider` 组件
- [ ] ✅ 在 `app/layout.tsx` 中包裹了 `ThemeProvider`
- [ ] ✅ 在 `<html>` 标签添加了 `suppressHydrationWarning`
- [ ] ✅ 所有使用 `useTheme()` 的组件都添加了 `mounted` 状态检查
- [ ] ✅ 在 `mounted` 之前显示占位符或默认值
- [ ] ✅ 配置了 Tailwind CSS 的 `darkMode: 'class'`
- [ ] ✅ 测试了主题切换功能
- [ ] ✅ 测试了页面刷新后主题保持
- [ ] ✅ 检查了控制台没有 hydration 错误

## 🔗 相关资源

- [next-themes 官方文档](https://github.com/pacocoursey/next-themes)
- [Next.js 15 App Router 文档](https://nextjs.org/docs)
- [Tailwind CSS 暗黑模式](https://tailwindcss.com/docs/dark-mode)

---

**总结：** 使用 next-themes 的关键是正确处理 hydration，确保服务端和客户端渲染一致。始终记住使用 `mounted` 状态检查！

