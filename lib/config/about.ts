import { Briefcase, FileText, Github } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * 社交媒体链接配置
 * 统一管理所有社交媒体链接，避免重复
 */
export const socialLinks = {
  github: {
    url: "https://github.com/kaili-lab",
    label: "GitHub",
  },
  twitter: {
    url: "https://x.com/kaili_dev",
    label: "Twitter",
  },
} as const;

/**
 * 个人信息配置
 */
export const profileConfig = {
  title: "Full-Stack Developer",
  description: "Build scalable products with React/Next.js and Java/Node.js",
  portfolioUrl: "https://kaili.dev",
  portfolioLabel: "View Full Portfolio",
} as const;

/**
 * 关于我的文本内容
 */
export const aboutContent = {
  paragraph1:
    "Full-stack engineer with 5 years of experience: Frontend—React ecosystem, Next.js; Backend—Java, Node.js. Hands-on with Redis, MySQL/PostgreSQL/Oracle, Kafka, Socket.IO.",
  paragraph2:
    "Performance-minded, maintainable code, remote-ready and open to roles.",
} as const;

/**
 * 技能标签列表
 */
export const skills = [
  "Full-Stack Development",
  "Java",
  "Node.js",
  "JavaScript",
  "React",
  "Next.js",
  "Express.js",
  "Socket.IO",
  "Redis",
  "MySQL",
  "PostgreSQL",
  "Oracle",
  "Kafka",
  "English (Working Proficiency)",
  "Remote Collaboration",
] as const;

/**
 * 快速链接配置
 */
export interface QuickLink {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
}

export const quickLinks: QuickLink[] = [
  {
    title: "Portfolio",
    description: "View my work & projects",
    icon: Briefcase,
    href: "/portfolio",
  },
  {
    title: "Blog Posts",
    description: "Read my technical articles",
    icon: FileText,
    href: "/posts",
  },
  {
    title: "GitHub",
    description: "Check out my code",
    icon: Github,
    href: socialLinks.github.url,
    external: true,
  },
];
