import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { LogIn, Zap } from "lucide-react";
import logoUrl from "@assets/brand_logo_giftcard_1780765797206.jpeg";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({ title: "Welcome back!" });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err?.data?.message ?? "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (values: FormData) => {
    loginMutation.mutate({ data: values });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <img src={logoUrl} alt="Gift Multiverse" className="h-16 w-16 mx-auto rounded-xl object-cover ring-2 ring-primary/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
          <h1 className="text-3xl font-bold tracking-tight">Enter the Nexus</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.05)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Username</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-username"
                        placeholder="Your username"
                        className="bg-background/50 border-border/60 focus:border-primary/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-password"
                        type="password"
                        placeholder="Your password"
                        className="bg-background/50 border-border/60 focus:border-primary/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-login"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  "Authenticating..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              <Link href="/reset-password" className="text-cyan-400 hover:text-cyan-300 hover:underline">
                Forgot password? Use your safe key
              </Link>
            </p>
            <p className="text-muted-foreground">
              No account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium hover:underline">
                Join the Multiverse
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Zap className="inline h-3 w-3 mr-1 text-cyan-400" />
          Secured by end-to-end encryption
        </p>
      </div>
    </div>
  );
}
