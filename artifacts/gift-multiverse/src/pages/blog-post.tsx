import { useRoute } from "wouter";
import { useGetBlogPost, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";

function coverBg(color?: string | null, id?: number) {
  if (color) return { backgroundColor: color };
  const colors = ["#1a0533", "#0c1a2e", "#0d1f1f", "#1a1505", "#1a0505", "#051a15"];
  return { backgroundColor: colors[(id ?? 0) % colors.length] };
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading } = useGetBlogPost(slug, {
    query: { queryKey: getGetBlogPostQueryKey(slug), enabled: !!slug },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link href="/blog"><Button variant="outline">Back to Blog</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Intel Feed
      </Link>

      <div
        className="relative h-64 rounded-2xl overflow-hidden mb-8 border border-border/30 flex items-center justify-center"
        style={coverBg(post.coverColor, post.id)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent z-10" />
        <BookOpen className="h-20 w-20 text-white/10 relative z-0" />
      </div>

      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight leading-snug mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <time>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
        </div>
        {post.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4">
            {post.excerpt}
          </p>
        )}
      </header>

      <article className="prose prose-invert prose-lg max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:text-primary prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-xl prose-h3:text-cyan-400
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-strong:text-foreground
        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-ul:text-muted-foreground prose-ol:text-muted-foreground
        prose-li:marker:text-primary
      ">
        {post.content.split("\n\n").map((para, i) => {
          if (para.startsWith("## ")) {
            return <h2 key={i}>{para.slice(3)}</h2>;
          }
          if (para.startsWith("### ")) {
            return <h3 key={i}>{para.slice(4)}</h3>;
          }
          if (para.startsWith("**") && para.endsWith("**")) {
            return <p key={i}><strong>{para.slice(2, -2)}</strong></p>;
          }
          return <p key={i}>{para}</p>;
        })}
      </article>

      <div className="mt-12 pt-8 border-t border-border/30 flex items-center justify-between">
        <Link href="/blog">
          <Button variant="outline" className="border-border/50">
            <ArrowLeft className="mr-2 h-4 w-4" /> All Posts
          </Button>
        </Link>
        <Link href="/browse">
          <Button className="bg-primary hover:bg-primary/90">
            Browse Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}
