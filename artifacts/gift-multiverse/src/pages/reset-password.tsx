import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  safeKey: z.string().min(1, "Safe key is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", safeKey: "", newPassword: "", confirmPassword: "" },
  });

  const resetMutation = useResetPassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Password reset! You can now log in with your new password." });
        setLocation("/login");
      },
      onError: (err: any) => {
        toast({
          title: "Reset failed",
          description: err?.data?.message ?? "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (values: FormData) => {
    resetMutation.mutate({
      data: {
        username: values.username,
        safeKey: values.safeKey,
        newPassword: values.newPassword,
      },
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground">Enter your username and safe key to reset your password</p>
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
                      <Input data-testid="input-username" placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safeKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safe Key</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-safe-key"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="font-mono tracking-wider"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input data-testid="input-new-password" type="password" placeholder="At least 6 characters" {...field} />
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
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input data-testid="input-confirm-password" type="password" placeholder="Repeat new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-reset"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
