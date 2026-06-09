import { useLocation } from "wouter";
import {
  useGetWalletTransactions,
  getGetWalletTransactionsQueryKey,
  useGetMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react";

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token, setLocation]);

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: txns, isLoading } = useGetWalletTransactions({
    query: { enabled: !!token, queryKey: getGetWalletTransactionsQueryKey() },
  });

  if (!token) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Wallet</h1>

      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/30 rounded-2xl p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <WalletIcon className="h-6 w-6 text-cyan-400" />
            <span className="text-muted-foreground">Available Balance</span>
          </div>
          {me ? (
            <p className="text-5xl font-mono font-bold text-cyan-400" data-testid="text-wallet-balance">
              ${me.walletBalance.toFixed(2)}
            </p>
          ) : (
            <Skeleton className="h-12 w-40" />
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Use your balance to purchase gift cards instantly
          </p>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : !txns?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <WalletIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {txns.map((txn) => (
            <div
              key={txn.id}
              data-testid={`row-txn-${txn.id}`}
              className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {txn.type === "credit" ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <p className={`font-mono font-bold ${txn.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                {txn.type === "credit" ? "+" : "-"}${txn.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
