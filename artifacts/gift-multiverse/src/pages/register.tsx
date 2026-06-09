import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Copy, Check, Shield, UserPlus } from "lucide-react";
import logoUrl from "@assets/brand_logo_giftcard_1780765797206.jpeg";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [safeKey, setSafeKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setSafeKey(data.safeKey);
      },
      onError: (err: any) => {
        toast({
          title: "Registration failed",
          description: err?.data?.message ?? "Something went wrong",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (values: FormData) => {
    registerMutation.mutate({ data: { username: values.username, password: values.password } });
  };

  const handleCopy = () => {
    if (safeKey) {
      navigator.clipboard.writeText(safeKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = () => {
    if (!confirmed) {
      toast({ title: "Please confirm you've saved your safe key", variant: "destructive" });
      return;
    }
    setLocation("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-background to-background pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <img src={logoUrl} alt="Gift Multiverse" className="h-16 w-16 mx-auto rounded-xl object-cover ring-2 ring-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]" />
          <h1 className="text-3xl font-bold tracking-tight">Join the Multiverse</h1>
          <p className="text-muted-foreground">Create your account to start trading</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-username"
                        placeholder="Choose a username"
                        className="bg-background/50 border-border/60 focus:border-cyan-500/60"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-password"
                        type="password"
                        placeholder="At least 6 characters"
                        className="bg-background/50 border-border/60 focus:border-cyan-500/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-confirm-password"
                        type="password"
                        placeholder="Repeat your password"
                        className="bg-background/50 border-border/60 focus:border-cyan-500/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-register"
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : (
                  <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Safe Key Modal */}
      <Dialog open={!!safeKey}>
        <DialogContent className="bg-card border-primary/30 max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Your Safe Key</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is your <strong className="text-foreground">one-time recovery key</strong>. It is shown only once and cannot be retrieved later. Store it somewhere safe — you'll need it to reset your password.
            </p>

            <div className="bg-background/80 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <code className="font-mono text-primary text-lg tracking-widest font-bold" data-testid="text-safe-key">
                {safeKey}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0 hover:bg-primary/10">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <input
                type="checkbox"
                id="confirm-key"
                data-testid="checkbox-confirm-key"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="confirm-key" className="text-sm text-amber-400 cursor-pointer">
                I have saved my safe key in a secure location
              </label>
            </div>

            <Button
              data-testid="button-confirm-key"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleConfirm}
              disabled={!confirmed}
            >
              Continue to Gift Multiverse
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
