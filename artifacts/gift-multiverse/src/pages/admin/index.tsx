import { useLocation } from "wouter";
import { useGetAdminStats, getGetAdminStatsQueryKey, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, Tag, FileText, DollarSign, Clock, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: stats, isLoading } = useGetAdminStats({
    query: { enabled: !!token, queryKey: getGetAdminStatsQueryKey() },
  });

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  if (!token || (me && me.role !== "admin")) return null;

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
    { label: "Gift Cards", value: stats?.totalGiftCards, icon: Tag, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Revenue", value: stats?.totalRevenue != null ? `$${stats.totalRevenue.toFixed(2)}` : null, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Pending Reviews", value: stats?.pendingSellRequests, icon: Clock, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Pending Orders", value: stats?.pendingOrders, icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Command Center</span>
        </h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              {isLoading || value == null ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nav */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/orders", label: "Manage Orders", icon: ShoppingBag, desc: "View and manage all platform orders" },
          { href: "/admin/sell-requests", label: "Sell Requests", icon: Clock, desc: "Review and approve seller submissions" },
          { href: "/admin/gift-cards", label: "Gift Cards", icon: Tag, desc: "Manage marketplace listings" },
          { href: "/admin/users", label: "Users", icon: Users, desc: "View and manage user accounts" },
          { href: "/admin/blog", label: "Blog", icon: FileText, desc: "Manage blog posts and content" },
          { href: "/admin/payment-info", label: "Payment Info", icon: CreditCard, desc: "Configure UPI and USDT payment details" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <div className="p-5 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
