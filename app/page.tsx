import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import EnhancedSections from "@/components/enhanced-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-white py-24 px-6 overflow-hidden">
        <Image
          src="/hero-img.png"
          alt="AI-powered content creation hero image"
          fill
          // 使用 fill 时，Next.js 需要 sizes 来确定在不同视口下加载的图片尺寸
          sizes="100vw"
          className="object-cover -z-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 -z-5"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Unlock the Power of AI for Your Content
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-pretty">
            Revolutionize your content creation process with our AI-powered
            platform. From intelligent search to AI-generated covers, we provide
            the tools you need to create, manage, and grow your blog.
          </p>
          <Link href="/posts">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            >
              Explore Posts
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            AI-Powered Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card border-border hover:scale-103 transition-all duration-300">
              <CardContent className="p-6">
                <div className="relative w-full h-32 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src="/search.png"
                    alt="Intelligent search interface"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  Intelligent Search
                </h3>
                <p className="text-muted-foreground text-sm">
                  Find exactly what you need with our advanced search
                  capabilities, powered by AI.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:scale-103 transition-all duration-300">
              <CardContent className="p-6">
                <div className="relative w-full h-32 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src="/cover.png"
                    alt="AI-generated cover example"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  AI-Generated Covers
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create stunning, unique covers for your blog posts with our AI
                  cover generator.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:scale-103 transition-all duration-300">
              <CardContent className="p-6">
                <div className="relative w-full h-32 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src="/summary.png"
                    alt="Smart content summary interface"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  Smart Summaries
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get concise summaries of your content, perfect for sharing on
                  social media.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:scale-103 transition-all duration-300">
              <CardContent className="p-6">
                <div className="relative w-full h-32 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src="/content-assistant.png"
                    alt="Content creation assistant interface"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  Content Creation Assistant
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our AI assistant helps you brainstorm ideas, write content,
                  and optimize your posts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <EnhancedSections />

      <Footer />
    </div>
  );
}
