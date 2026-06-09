import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ArrowLeft, ShoppingBag, Wallet, Tag, User, Clock } from "lucide-react";
import { Link } from "wouter";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[status] ?? "bg-muted/20 text-muted-foreground";
}

function txnBadge(type: string) {
  const map: Record<string, string> = {
    credit: "bg-green-500/10 text-green-400 border-green-500/20",
    debit: "bg-red-500/10 text-red-400 border-red-500/20",
    payout: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return map[type] ?? "bg-muted/20 text-muted-foreground";
}

function sellBadge(status: string) {
  const map: Record<string, string> = {
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[status] ?? "bg-muted/20 text-muted-foreground";
}

async function fetchUserDetail(userId: string, token: string | null) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user details");
  return res.json();
}

export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const userId = params?.id ?? "";

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: detail, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => fetchUserDetail(userId, token),
    enabled: !!token && !!userId,
  });

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  if (!token || (me && me.role !== "admin")) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : !detail?.user ? (
        <div className="text-center py-20 text-muted-foreground">User not found</div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{detail.user.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={detail.user.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/10 text-muted-foreground"}>
                  {detail.user.role}
                </Badge>
                <Badge variant="outline" className={detail.user.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                  {detail.user.isActive ? "Active" : "Suspended"}
                </Badge>
                <span className="text-sm text-muted-foreground">Joined {new Date(detail.user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-xl font-mono font-bold text-cyan-400">${detail.user.walletBalance.toFixed(2)}</p>
            </div>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="orders">
                <ShoppingBag className="h-4 w-4 mr-2" /> Orders ({detail.orders?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="h-4 w-4 mr-2" /> Wallet ({detail.walletHistory?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="sells">
                <Tag className="h-4 w-4 mr-2" /> Sells ({detail.sellRequests?.length ?? 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              {!detail.orders?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detail.orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{order.giftCardName ?? `Order #${order.id}`}</p>
                        {order.giftCardBrand && <p className="text-xs text-cyan-400">{order.giftCardBrand}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <p className="font-mono font-bold text-sm">${order.totalPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">qty: {order.quantity}</p>
                        <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="wallet" className="mt-6">
              {!detail.walletHistory?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No wallet transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detail.walletHistory.map((txn: any) => (
                    <div key={txn.id} className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <p className={`font-mono font-bold text-sm ${txn.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                          {txn.type === "credit" ? "+" : "-"}${txn.amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className={`text-xs ${txnBadge(txn.type)}`}>{txn.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sells" className="mt-6">
              {!detail.sellRequests?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No sell requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detail.sellRequests.map((sell: any) => (
                    <div key={sell.id} className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{sell.brand}</p>
                        <p className="text-xs text-muted-foreground">Face: ${sell.cardFaceValue.toFixed(2)} · Ask: ${sell.askingPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sell.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={`text-xs ${sellBadge(sell.status)}`}>{sell.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
