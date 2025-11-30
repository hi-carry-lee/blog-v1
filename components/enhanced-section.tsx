"use client";

import { useState } from "react";
import {
  SiNextdotjs,
  SiPrisma,
  SiOpenai,
  SiTailwindcss,
  SiShadcnui,
} from "react-icons/si";
import { Database, Workflow, FileText } from "lucide-react";

export default function EnhancedSections() {
  const [viewMode, setViewMode] = useState("before"); // "before" or "after"

  return (
    <div className="space-y-20">
      {/* Before/After Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              From Draft to Published in Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI transforms your writing into engaging blog posts with
              auto-generated summaries, stunning covers, and intelligent search
            </p>
          </div>

          {/* Before/After Interactive Demo */}
          <div className="bg-card rounded-2xl shadow-xl p-8 max-w-5xl mx-auto border border-border">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setViewMode("before")}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === "before"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Before AI
              </button>
              <button
                onClick={() => setViewMode("after")}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === "after"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                After AI
              </button>
            </div>

            {viewMode === "before" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 bg-muted/30">
                  <div className="w-full h-48 bg-muted rounded flex items-center justify-center text-muted-foreground text-center px-4">
                    You need to spend time finding or creating a cover image,
                    which can be time-consuming and distracting
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-2 text-foreground">
                    My Blog Post About Machine Learning
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Takes additional time to write an engaging summary
                  </p>
                  <p className="text-foreground">
                    Machine learning is a subset of artificial intelligence that
                    focuses on the development of algorithms and statistical
                    models...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-primary/30 rounded-lg p-8 bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="w-full h-48 bg-gradient-to-r from-primary to-chart-2 rounded flex items-center justify-center text-primary-foreground text-lg font-semibold">
                    🎨 AI-Generated Concept Art: Neural Networks
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-2 text-foreground">
                    Understanding Machine Learning Fundamentals
                  </h3>
                  <p className="text-primary text-sm mb-4">
                    ✨ AI Summary: Explore core ML concepts including supervised
                    learning, neural networks, and practical applications in
                    modern AI systems.
                  </p>
                  <p className="text-foreground">
                    Machine learning is a subset of artificial intelligence that
                    focuses on the development of algorithms and statistical
                    models...
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-success">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>AI-generated summary saves writing time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Unique cover image created automatically</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>
                        Vector search finds conceptually similar content
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            How It Works
          </h2>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-border transform -translate-x-1/2 hidden md:block"></div>

            {/* Steps */}
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 md:text-right">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    1. Write Your Content
                  </h3>
                  <p className="text-muted-foreground">
                    Focus on your ideas. Write in markdown format using your
                    favorite editor.
                  </p>
                </div>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold z-10 shrink-0 shadow-lg">
                  ✍️
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 hidden md:block"></div>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold z-10 shrink-0 shadow-lg">
                  🤖
                </div>
                <div className="flex-1 md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    2. AI Analyzes & Summarizes
                  </h3>
                  <p className="text-muted-foreground">
                    OpenAI extracts key insights and creates an engaging summary
                    automatically via Inngest background jobs.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 md:text-right">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    3. Generate Unique Cover
                  </h3>
                  <p className="text-muted-foreground">
                    AI creates a concept illustration that captures your
                    article&apos;s essence using DALL-E.
                  </p>
                </div>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold z-10 shrink-0 shadow-lg">
                  🎨
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 hidden md:block"></div>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold z-10 shrink-0 shadow-lg">
                  🚀
                </div>
                <div className="flex-1 md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    4. Publish & Discover
                  </h3>
                  <p className="text-muted-foreground">
                    Vector search powered by Neon makes your content easily
                    discoverable by meaning, not just keywords.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Vector Search Demo */}
      <section className="py-20 bg-gradient-to-br from-accent/40 to-primary/10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            See Vector Search in Action
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Traditional keyword search vs AI-powered semantic search
          </p>

          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Search */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-muted-foreground">
                  ❌ Traditional Search
                </h3>
                <input
                  type="text"
                  value="machine learning basics"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg mb-4 bg-background text-foreground"
                  readOnly
                />
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg opacity-50">
                    <p className="font-semibold text-sm text-foreground">
                      Getting Started with ML
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contains &quot;machine learning&quot;
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg opacity-50">
                    <p className="font-semibold text-sm text-foreground">
                      Machine Learning 101
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contains &quot;basics&quot;
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground italic">
                    Misses relevant articles that use different terminology...
                  </div>
                </div>
              </div>

              {/* Vector Search */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">
                  ✅ Vector Search
                </h3>
                <input
                  type="text"
                  value="machine learning basics"
                  className="w-full px-4 py-3 border-2 border-primary rounded-lg mb-4 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  readOnly
                />
                <div className="space-y-3">
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <p className="font-semibold text-sm text-foreground">
                      Introduction to Neural Networks
                    </p>
                    <p className="text-xs text-primary">98% semantic match</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <p className="font-semibold text-sm text-foreground">
                      Understanding AI Fundamentals
                    </p>
                    <p className="text-xs text-primary">95% semantic match</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <p className="font-semibold text-sm text-foreground">
                      Supervised Learning Explained
                    </p>
                    <p className="text-xs text-primary">92% semantic match</p>
                  </div>
                  <div className="text-sm text-primary font-semibold">
                    Finds conceptually similar content, even with different
                    words!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            Built with Modern Technologies
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Powered by industry-leading tools and frameworks
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Next.js",
                icon: SiNextdotjs,
                category: "Framework",
                color: "text-foreground",
              },
              {
                name: "Prisma",
                icon: SiPrisma,
                category: "ORM",
                color: "text-[#2D3748] dark:text-[#81B0FF]",
              },
              {
                name: "Neon",
                icon: Database,
                category: "Database",
                color: "text-[#00E5B0]",
              },
              {
                name: "OpenAI",
                icon: SiOpenai,
                category: "AI Engine",
                color: "text-[#412991] dark:text-[#8B9DC3]",
              },
              {
                name: "Tailwind CSS",
                icon: SiTailwindcss,
                category: "Styling",
                color: "text-[#06B6D4]",
              },
              {
                name: "Shadcn UI",
                icon: SiShadcnui,
                category: "Components",
                color: "text-foreground",
              },
              {
                name: "Inngest",
                icon: Workflow,
                category: "Background Jobs",
                color: "text-[#6366F1]",
              },
              {
                name: "marked.js",
                icon: FileText,
                category: "Markdown",
                color: "text-foreground",
              },
            ].map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center gap-4 h-full">
                    <div className="flex items-center justify-center">
                      <Icon
                        className={`w-12 h-12 ${tech.color} transition-transform duration-300 hover:scale-110`}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{tech.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tech.category}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
