import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <FileQuestion className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Post Not Found
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Sorry, we couldn&apos;t find the post you&apos;re looking for. It
            may have been removed or the link might be incorrect.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/posts">
              <Button>Browse All Posts</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
