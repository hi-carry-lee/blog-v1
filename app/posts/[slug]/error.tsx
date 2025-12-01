"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到监控服务
    logger.error("Post detail page error", error);
    // TODO: 发送到 Sentry 等服务
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md space-y-6">
          <AlertCircle className="w-20 h-20 mx-auto text-destructive" />
          <div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground mb-2 text-lg">
              {error.message || "An unexpected error occurred while loading the post."}
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" asChild>
              <Link href="/posts">Back to Posts</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

