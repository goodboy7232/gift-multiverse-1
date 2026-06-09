import { Link } from "wouter";
import { useGetBlogPosts, getGetBlogPostsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";

function coverBg(color?: string | null, id?: number) {
  if (color) return { backgroundColor: color };
  const colors = ["#1a0533", "#0c1a2e", "#0d1f1f", "#1a1505", "#1a0505", "#051a15"];
  return { backgroundColor: colors[(id ?? 0) % colors.length] };
}

export default function Blog() {
  const { data: posts, isLoading } = useGetBlogPosts(
    undefined,
    { query: { queryKey: getGetBlogPostsQueryKey() } }
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Intel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Feed</span>
        </h1>
        <p className="text-muted-foreground text-lg">Strategies, guides, and market insights for the smart trader</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50 overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !posts?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.id} data-testid={`card-post-${post.id}`} className="bg-card/50 border-border hover:border-primary/30 transition-all overflow-hidden group">
              <div className="relative h-48 overflow-hidden flex items-center justify-center" style={coverBg(post.coverColor, post.id)}>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <BookOpen className="h-16 w-16 text-white/10 relative z-0" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/blog/${post.slug}`} className="w-full">
                  <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 hover:text-primary justify-between">
                    Read More <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
