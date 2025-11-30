import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Github,
  Twitter,
  Briefcase,
  FileText,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getAdminUser } from "@/lib/actions/user";

export default async function AboutPage() {
  const adminUser = await getAdminUser();

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

  // 快速链接配置
  const quickLinks = [
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
      href: "https://github.com/kaili-lab",
      external: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* 左侧个人信息 */}
            <div className="md:col-span-4">
              <div className="sticky top-8">
                <Card className="p-6">
                  {/* 头像 */}
                  <div className="flex justify-center mb-4">
                    {adminUser?.image ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-primary/20">
                        <Image
                          src={adminUser.image}
                          alt={adminUser.name || "Admin"}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                        <span className="text-4xl font-bold text-primary">
                          {getInitials(
                            adminUser?.name || adminUser?.email || "Admin"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 个人信息 */}
                  <div className="text-center space-y-2 mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                      {adminUser?.name || "Admin"}
                    </h1>
                    <p className="text-primary font-medium">
                      Full-Stack Developer
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Build scalable products with React/Next.js and
                      Java/Node.js
                    </p>
                  </div>

                  {/* 社交媒体链接 */}
                  <div className="flex justify-center gap-4 mb-6">
                    <Link
                      href="https://github.com/kaili-lab"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </Link>
                    <Link
                      href="https://x.com/kaili_dev"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className="w-full">
                    <Link href="https://kaili.dev">View Full Portfolio</Link>
                  </Button>
                </Card>
              </div>
            </div>

            {/* 右侧内容 */}
            <div className="md:col-span-8 space-y-6">
              {/* 关于我 */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground">About Me</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Full-stack engineer with 5 years of experience:
                    Frontend—React ecosystem, Next.js; Backend—Java, Node.js.
                    Hands-on with Redis, MySQL/PostgreSQL/Oracle, Kafka,
                    Socket.IO.
                  </p>
                  <p className="text-foreground font-medium">
                    Performance-minded, maintainable code, remote-ready and open
                    to roles.
                  </p>
                </div>
              </Card>

              {/* 技能 */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground ">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* 快速链接 */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground ">
                  More About Me
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.title}
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground flex items-center gap-1">
                            {link.title}
                            {link.external && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {link.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
