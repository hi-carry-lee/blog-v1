import Link from "next/link";
import { Triangle } from "lucide-react";

interface BrandLogoProps {
  className?: string;
}

/**
 * Brand Logo Component
 * 
 * 统一的品牌 Logo 组件，用于应用顶部导航
 */
export function BrandLogo({ className = "absolute top-6 left-6" }: BrandLogoProps) {
  return (
    <div className={className}>
      <Link href="/" className="flex items-center gap-2">
        <Triangle className="w-6 h-6 text-primary fill-primary" />
        <span className="font-semibold text-lg text-foreground">
          AI Blog Platform
        </span>
      </Link>
    </div>
  );
}

