"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const { data: session } = useSession();

  // 生成字母头像
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 技能标签
  const skills = [
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
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* 左侧个人信息 */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            {/* 头像 */}
            <div className="relative">
              {session?.user?.image ? (
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden ring-4 ring-primary/20">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                  <span className="text-4xl lg:text-5xl font-bold text-primary">
                    {getInitials(
                      session?.user?.name || session?.user?.email || "U"
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* 个人信息 */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-foreground">
                {session?.user?.name || "AI Enthusiast"}
              </h1>
              <p className="text-primary font-medium">Full-Stack Developer </p>
              <p className="text-muted-foreground text-sm">
                Build scalable products with React/Next.js and Java/Node.js..
              </p>
            </div>

            {/* 社交媒体链接 */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="md:col-span-2 space-y-8">
            {/* 关于我 */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                About Me
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Full‑stack engineer with 5 years of experience: Frontend—React
                ecosystem, Next.js; Backend—Java, Node.js. Hands‑on with Redis,
                MySQL/PostgreSQL/Oracle, Kafka, Socket.IO. Performance‑minded,
                maintainable code, remote‑ready and open to roles.
              </p>
            </Card>

            {/* 技能 */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
