import { Link, useLocation } from "wouter";
import {
  useGetDashboardStats,
  getGetDashboardStatsQueryKey,
  useGetUserOrders,
  getGetUserOrdersQueryKey,
  useGetUserSellRequests,
  getGetUserSellRequestsQueryKey,
  useGetWalletTransactions,
  getGetWalletTransactionsQueryKey,
  useGetMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag, CheckCircle, Wallet as WalletIcon, Clock, ArrowRight,
  User, Eye, Copy, TrendingUp, TrendingDown, KeyRound, PlusCircle, MinusCircle,
  QrCode, Wallet as WalletLogo, Upload, ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[status] ?? "bg-muted/20 text-muted-foreground";
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token, setLocation]);

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { enabled: !!token, queryKey: getGetDashboardStatsQueryKey() },
  });
  const { data: orders, isLoading: ordersLoading } = useGetUserOrders({
    query: { enabled: !!token, queryKey: getGetUserOrdersQueryKey() },
  });
  const { data: sells, isLoading: sellsLoading } = useGetUserSellRequests({
    query: { enabled: !!token, queryKey: getGetUserSellRequestsQueryKey() },
  });
  const { data: txns, isLoading: txnsLoading } = useGetWalletTransactions({
    query: { enabled: !!token, queryKey: getGetWalletTransactionsQueryKey() },
  });

  const [profileForm, setProfileForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [walletAction, setWalletAction] = useState<"none" | "topup" | "withdraw">("none");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletDetail, setWalletDetail] = useState("");
  const [walletPayMethod, setWalletPayMethod] = useState<"upi" | "usdt">("upi");
  const [walletTransactionId, setWalletTransactionId] = useState("");
  const [walletScreenshot, setWalletScreenshot] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const walletFileRef = useRef<HTMLInputElement>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);

  const { data: paymentInfo } = useQuery({
    queryKey: ["payment-info"],
    queryFn: async () => {
      const res = await fetch("/api/payment-info");
      if (!res.ok) throw new Error("Failed to fetch payment info");
      return res.json();
    },
  });

  const handlePasswordChange = async () => {
    if (!profileForm.newPassword || profileForm.newPassword !== profileForm.confirmPassword) return;
    if (profileForm.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: profileForm.newPassword }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to update password");
      toast({ title: "Password updated successfully" });
      setProfileForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      void queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleWalletTopup = async () => {
    const amt = parseFloat(walletAmount);
    if (!amt || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    if (!walletTransactionId.trim()) { toast({ title: "Transaction ID is required", variant: "destructive" }); return; }
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, paymentMethod: walletPayMethod, transactionId: walletTransactionId.trim(), screenshotUrl: walletScreenshot }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Request failed");
      toast({ title: "Topup request submitted", description: "Your balance will be credited after payment is confirmed." });
      setWalletAction("none"); setWalletAmount(""); setWalletDetail(""); setWalletTransactionId(""); setWalletScreenshot(null);
      void queryClient.invalidateQueries({ queryKey: getGetWalletTransactionsQueryKey() });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally { setWalletLoading(false); }
  };

  const handleWalletFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setWalletScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleWalletWithdraw = async () => {
    const amt = parseFloat(walletAmount);
    if (!amt || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    if (!walletDetail.trim()) { toast({ title: "Provide bank / USDT details", variant: "destructive" }); return; }
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, bankDetails: walletDetail }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Request failed");
      toast({ title: "Withdrawal requested", description: "Funds will be sent to your account within 24 hours." });
      setWalletAction("none"); setWalletAmount(""); setWalletDetail("");
      void queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      void queryClient.invalidateQueries({ queryKey: getGetWalletTransactionsQueryKey() });
      void queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally { setWalletLoading(false); }
  };

  if (!token) return null;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast({ title: "Code copied!" }));
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              {me?.username ?? "..."}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Your nexus control panel</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/50 rounded-xl">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">{me?.role}</span>
          {me?.role === "admin" && (
            <Link href="/admin">
              <Button size="sm" variant="ghost" className="text-primary text-xs">
                Admin Panel <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Wallet Balance", value: statsLoading ? null : `$${(stats?.walletBalance ?? 0).toFixed(2)}`, icon: WalletIcon, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Total Orders", value: statsLoading ? null : stats?.totalOrders, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
          { label: "Completed", value: statsLoading ? null : stats?.completedOrders, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Pending Listings", value: statsLoading ? null : stats?.pendingSellRequests, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              {statsLoading || value === null ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <p className={`text-2xl font-mono font-bold ${color}`} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed sections */}
      <Tabs defaultValue="orders">
        <TabsList className="bg-card/50 border border-border/50 mb-6 w-full sm:w-auto">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="w-4 h-4" /> My Orders
          </TabsTrigger>
          <TabsTrigger value="sell-requests" className="gap-2">
            <TrendingUp className="w-4 h-4" /> My Sell Requests
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-2">
            <WalletIcon className="w-4 h-4" /> Wallet
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
        </TabsList>

        {/* ── My Orders ── */}
        <TabsContent value="orders">
          <div className="space-y-4">
            {ordersLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : !orders?.length ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Link href="/browse"><Button className="bg-primary hover:bg-primary/90">Browse Gift Cards</Button></Link>
              </div>
            ) : orders.map((order) => (
              <div
                key={order.id}
                data-testid={`row-order-${order.id}`}
                className="bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "completed" ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                      {order.status === "completed" ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Clock className="h-5 w-5 text-amber-400" />}
                    </div>
                    <div>
                      <p className="font-medium">{order.giftCardName ?? `Order #${order.id}`}</p>
                      {order.giftCardBrand && <p className="text-xs text-cyan-400">{order.giftCardBrand}</p>}
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xl font-mono font-bold text-cyan-400">${order.totalPrice.toFixed(2)}</p>
                    <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>{order.status}</Badge>
                  </div>
                </div>
                {order.status === "completed" && (order as any).giftCardCode && (
                  <div className="mx-5 mb-5 p-4 bg-green-500/5 border border-green-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                      <Eye className="h-4 w-4" /> Gift Card Code — Ready to Use
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-lg tracking-widest text-foreground font-bold bg-background/60 px-4 py-2 rounded-lg border border-border/50"
                        data-testid={`text-gift-code-${order.id}`}>
                        {(order as any).giftCardCode}
                      </code>
                      <Button size="sm" variant="outline" className="shrink-0 border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => copyCode((order as any).giftCardCode)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Redeem on the brand's official website or app.</p>
                  </div>
                )}
                {order.status === "pending" && (
                  <div className="mx-5 mb-5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting payment confirmation
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send your Bank Transfer or USDT payment — our team will confirm and reveal your code shortly.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── My Sell Requests ── */}
        <TabsContent value="sell-requests">
          <div className="space-y-4">
            {sellsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : !sells?.length ? (
              <div className="text-center py-20">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No sell requests yet</p>
                <Link href="/sell"><Button className="bg-primary hover:bg-primary/90">Sell a Card</Button></Link>
              </div>
            ) : sells.map((sell) => (
              <div
                key={sell.id}
                data-testid={`row-sell-${sell.id}`}
                className="flex items-center justify-between p-5 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{sell.brand}</p>
                  <p className="text-xs text-muted-foreground">{sell.cardType} · {new Date(sell.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                  {sell.adminNote && <p className="text-xs text-amber-400 mt-1 italic">{sell.adminNote}</p>}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xl font-mono font-bold text-green-400">${sell.askingPrice.toFixed(2)}</p>
                  {sell.approvedPayout && <p className="text-xs text-cyan-400">Payout: ${sell.approvedPayout.toFixed(2)}</p>}
                  <Badge variant="outline" className={`text-xs ${statusBadge(sell.status)}`}>{sell.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Wallet ── */}
        <TabsContent value="wallet">
          <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/30 rounded-2xl p-8">
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
                <p className="text-xs text-muted-foreground mt-2">Earn by selling cards — spend on purchases</p>
                <div className="flex gap-3 mt-5">
                  <Button
                    size="sm"
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                    onClick={() => { setWalletAction(walletAction === "topup" ? "none" : "topup"); setWalletAmount(""); setWalletDetail(""); }}
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" /> Add Funds
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => { setWalletAction(walletAction === "withdraw" ? "none" : "withdraw"); setWalletAmount(""); setWalletDetail(""); }}
                  >
                    <MinusCircle className="h-4 w-4 mr-1.5" /> Withdraw
                  </Button>
                </div>
              </div>
            </div>

            {/* Topup panel */}
            {walletAction === "topup" && (
              <div className="p-6 bg-card/50 border border-cyan-500/20 rounded-xl space-y-4">
                <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" /> Add Funds to Wallet
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[100, 250, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWalletAmount(String(preset))}
                      className={`py-2 rounded-lg border text-sm font-mono font-semibold transition-all ${walletAmount === String(preset) ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-background/50 border-border/50 text-muted-foreground hover:border-cyan-500/30"}`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Custom Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 750"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <Tabs value={walletPayMethod} onValueChange={(v) => setWalletPayMethod(v as "upi" | "usdt")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upi">
                      <QrCode className="h-4 w-4 mr-2" /> UPI
                    </TabsTrigger>
                    <TabsTrigger value="usdt">
                      <WalletLogo className="h-4 w-4 mr-2" /> USDT
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upi" className="mt-4 space-y-4">
                    <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
                      <h4 className="font-semibold mb-3">Pay via UPI</h4>
                      {paymentInfo?.upiQrUrl ? (
                        <div className="mb-3">
                          <img src={paymentInfo.upiQrUrl} alt="UPI QR" className="w-40 h-40 mx-auto rounded-lg border border-border/50" />
                        </div>
                      ) : (
                        <div className="w-40 h-40 mx-auto rounded-lg border border-dashed border-border/50 flex items-center justify-center mb-3">
                          <QrCode className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="bg-background rounded-lg p-3 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-mono font-bold">{paymentInfo?.upiId ?? "Not configured"}</p>
                          {paymentInfo?.upiId && (
                            <button onClick={() => { navigator.clipboard.writeText(paymentInfo.upiId); toast({ title: "Copied!" }); }} className="text-muted-foreground hover:text-cyan-400">
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">UPI Transaction ID / UTR</label>
                      <Input placeholder="e.g., 123456789012" value={walletTransactionId} onChange={(e) => setWalletTransactionId(e.target.value)} />
                    </div>
                  </TabsContent>

                  <TabsContent value="usdt" className="mt-4 space-y-4">
                    <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
                      <h4 className="font-semibold mb-3">Pay via USDT</h4>
                      {paymentInfo?.usdtQrUrl ? (
                        <div className="mb-3">
                          <img src={paymentInfo.usdtQrUrl} alt="USDT QR" className="w-40 h-40 mx-auto rounded-lg border border-border/50" />
                        </div>
                      ) : (
                        <div className="w-40 h-40 mx-auto rounded-lg border border-dashed border-border/50 flex items-center justify-center mb-3">
                          <QrCode className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="bg-background rounded-lg p-3 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">USDT Address ({paymentInfo?.usdtNetwork ?? "BEP20"})</p>
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-mono font-bold text-xs break-all">{paymentInfo?.usdtAddress ?? "Not configured"}</p>
                          {paymentInfo?.usdtAddress && (
                            <button onClick={() => { navigator.clipboard.writeText(paymentInfo.usdtAddress); toast({ title: "Copied!" }); }} className="text-muted-foreground hover:text-cyan-400 shrink-0">
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Transaction Hash</label>
                      <Input placeholder="e.g., 0xabc..." value={walletTransactionId} onChange={(e) => setWalletTransactionId(e.target.value)} />
                    </div>
                  </TabsContent>
                </Tabs>

                <div>
                  <label className="text-sm font-medium mb-1 block">Payment Screenshot</label>
                  <input ref={walletFileRef} type="file" accept="image/*" className="hidden" onChange={handleWalletFileChange} />
                  <div
                    onClick={() => walletFileRef.current?.click()}
                    className="cursor-pointer border border-dashed border-border/50 rounded-xl p-4 hover:border-cyan-500/30 transition-colors text-center"
                  >
                    {walletScreenshot ? (
                      <div className="space-y-2">
                        <img src={walletScreenshot} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                        <p className="text-xs text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Click to upload payment screenshot</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" onClick={handleWalletTopup} disabled={walletLoading || !walletAmount || !walletTransactionId.trim()}>
                  {walletLoading ? "Submitting…" : "Submit Topup Request"}
                </Button>
              </div>
            )}

            {/* Withdraw panel */}
            {walletAction === "withdraw" && (
              <div className="p-6 bg-card/50 border border-primary/20 rounded-xl space-y-4">
                <h3 className="text-base font-semibold text-primary flex items-center gap-2">
                  <MinusCircle className="h-5 w-5" /> Withdraw Funds
                </h3>
                <p className="text-xs text-muted-foreground">
                  Available: <span className="font-mono text-cyan-400">${me?.walletBalance.toFixed(2) ?? "0.00"}</span>
                </p>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 50"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Bank / USDT Wallet Details</label>
                  <Input
                    placeholder="Account no + IFSC, or USDT TRC-20 address"
                    value={walletDetail}
                    onChange={(e) => setWalletDetail(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 font-bold" onClick={handleWalletWithdraw} disabled={walletLoading || !walletAmount || !walletDetail}>
                  {walletLoading ? "Processing…" : "Request Withdrawal"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Processed within 24 hours on business days</p>
              </div>
            )}

            <h3 className="text-lg font-semibold">Transaction History</h3>
            {txnsLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : !txns?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <WalletIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {txns.map((txn) => (
                  <div key={txn.id} data-testid={`row-txn-${txn.id}`}
                    className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        {txn.type === "credit" ? <TrendingUp className="h-4 w-4 text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
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
        </TabsContent>

        {/* ── Profile Settings ── */}
        <TabsContent value="profile">
          <div className="max-w-lg space-y-6">
            {/* Account info */}
            <div className="p-6 bg-card/50 border border-border/50 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Account Info
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
                  <p className="font-mono text-foreground mt-1">{me?.username ?? "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Role</label>
                  <p className="capitalize mt-1">{me?.role ?? "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Wallet Balance</label>
                  <p className="font-mono text-cyan-400 mt-1">${me?.walletBalance.toFixed(2) ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* Safe Key info */}
            <div className="p-6 bg-card/50 border border-border/50 rounded-xl space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" /> Safe Key
              </h3>
              <p className="text-sm text-muted-foreground">
                Your safe key is used to reset your password if you ever forget it. It was set during registration
                and is stored as a one-way hash — it cannot be shown again.
              </p>
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                Keep your safe key stored securely. If you lose it, contact support.
              </div>
            </div>

            {/* Change password */}
            <div className="p-6 bg-card/50 border border-border/50 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" /> Change Password
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Current password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">New Password</label>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm((f) => ({ ...f, newPassword: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 font-bold"
                  disabled={
                    !profileForm.newPassword ||
                    profileForm.newPassword !== profileForm.confirmPassword ||
                    passwordLoading
                  }
                  onClick={() => { void handlePasswordChange(); }}
                >
                  {passwordLoading ? "Updating…" : "Update Password"}
                </Button>
                {profileForm.newPassword && profileForm.confirmPassword && profileForm.newPassword !== profileForm.confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
