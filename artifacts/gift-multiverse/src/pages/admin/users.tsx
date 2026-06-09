import { useLocation } from "wouter";
import {
  useAdminGetUsers,
  getAdminGetUsersQueryKey,
  useGetMe,
  getGetMeQueryKey,
  useAdminToggleUser,
  type AdminUser,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Users, ArrowLeft, UserCheck, UserX, KeyRound } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: users, isLoading } = useAdminGetUsers({
    query: { enabled: !!token, queryKey: getAdminGetUsersQueryKey() },
  });

  const toggleMutation = useAdminToggleUser({
    mutation: {
      onSuccess: (updated) => {
        toast({
          title: updated.isActive ? "Account enabled" : "Account disabled",
          description: `${updated.username} is now ${updated.isActive ? "active" : "suspended"}.`,
        });
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      },
      onError: () => {
        toast({ title: "Action failed", variant: "destructive" });
      },
    },
  });

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  if (!token || (me && me.role !== "admin")) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Users</h1>
      <p className="text-muted-foreground mb-8">Manage registered accounts — enable or disable access</p>

      {isLoading ? (
        <div className="space-y-3">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : !users?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No users yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground uppercase px-4 pb-2 border-b border-border/30">
            <span className="col-span-2">Username</span>
            <span>Wallet</span>
            <span>Joined</span>
            <span>Action</span>
          </div>
          {users.map((user) => {
            const anyUser = user as AdminUser & { safeKeyHint?: string | null };
            return (
              <div
                key={user.id}
                data-testid={`row-user-${user.id}`}
                className={`border rounded-lg transition-colors overflow-hidden ${
                  user.isActive
                    ? "bg-card/30 border-border/30 hover:border-primary/20"
                    : "bg-red-500/5 border-red-500/20 opacity-70"
                }`}
              >
                <div className="grid grid-cols-5 items-center p-4">
                  <div className="col-span-2 flex items-center gap-2 min-w-0">
                    <Link href={`/admin/users/${user.id}`} className="font-medium text-sm truncate hover:text-cyan-400 transition-colors">
                      {user.username}
                    </Link>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "bg-primary/10 text-primary border-primary/20 text-xs shrink-0"
                          : "bg-muted/10 text-muted-foreground text-xs shrink-0"
                      }
                    >
                      {user.role}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs shrink-0">
                        suspended
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-sm text-cyan-400">${user.walletBalance.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <div>
                    {user.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          user.isActive
                            ? "border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7"
                            : "border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-7"
                        }
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: user.id })}
                      >
                        {user.isActive ? (
                          <><UserX className="w-3 h-3 mr-1" /> Disable</>
                        ) : (
                          <><UserCheck className="w-3 h-3 mr-1" /> Enable</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {/* Safe key hint for support verification */}
                {anyUser.safeKeyHint && (
                  <div className="px-4 pb-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/20 pt-2">
                    <KeyRound className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-amber-400 font-medium">Safe key set</span>
                    <span className="font-mono text-muted-foreground/60">hash tail: {anyUser.safeKeyHint}</span>
                    <span className="ml-1 text-muted-foreground/40 italic">(plaintext not stored — user must provide for verification)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
