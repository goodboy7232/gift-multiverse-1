import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetBlogPosts,
  getGetBlogPostsQueryKey,
  useAdminCreateBlogPost,
  useGetMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, dashes"),
  excerpt: z.string().min(10),
  content: z.string().min(50),
  coverColor: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: posts, isLoading } = useGetBlogPosts(
    undefined,
    { query: { enabled: !!token, queryKey: getGetBlogPostsQueryKey() } }
  );

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", slug: "", excerpt: "", content: "", coverColor: "" },
  });

  const createMutation = useAdminCreateBlogPost({
    mutation: {
      onSuccess: () => {
        toast({ title: "Blog post created!" });
        queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
        setShowCreate(false);
        form.reset();
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.data?.message, variant: "destructive" }),
    },
  });

  if (!token || (me && me.role !== "admin")) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage the Intel Feed</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-1" /> New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : !posts?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No blog posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} data-testid={`row-post-${post.id}`} className="flex items-center justify-between p-5 bg-card/50 border border-border/50 rounded-xl">
              <div>
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm text-muted-foreground">/{post.slug} · {new Date(post.publishedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/blog/${post.slug}`}>
                  <Button size="sm" variant="ghost" className="text-xs text-cyan-400">View</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/50 max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: { title: d.title, slug: d.slug, excerpt: d.excerpt, content: d.content, coverColor: d.coverColor || null } }))}
              className="space-y-4"
            >
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input data-testid="input-slug" placeholder="my-post-slug" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="excerpt" render={({ field }) => (
                <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea data-testid="input-excerpt" className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea data-testid="input-content" className="min-h-[180px]" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="coverColor" render={({ field }) => (
                <FormItem><FormLabel>Cover Color (optional)</FormLabel><FormControl><Input data-testid="input-cover-color" placeholder="#a855f7" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Publish Post"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
