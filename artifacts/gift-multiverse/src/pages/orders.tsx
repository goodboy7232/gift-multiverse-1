import { useLocation } from "wouter";
import { useGetUserOrders, getGetUserOrdersQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ShoppingBag, Eye, Clock, CheckCircle, Copy } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[status] ?? "bg-muted/20 text-muted-foreground";
}

export default function Orders() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token, setLocation]);

  const { data: orders, isLoading } = useGetUserOrders({
    query: { enabled: !!token, queryKey: getGetUserOrdersQueryKey() },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({ title: "Code copied to clipboard!" });
    });
  };

  if (!token) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
      <p className="text-muted-foreground mb-8">All your gift card purchases</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-24">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Start shopping in the marketplace</p>
          <Link href="/browse">
            <Button className="bg-primary hover:bg-primary/90">Browse Gift Cards</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              data-testid={`row-order-${order.id}`}
              className="bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Order header */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "completed" ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                    {order.status === "completed"
                      ? <CheckCircle className="h-5 w-5 text-green-400" />
                      : <Clock className="h-5 w-5 text-amber-400" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{order.giftCardName ?? `Order #${order.id}`}</p>
                    {order.giftCardBrand && (
                      <p className="text-xs text-cyan-400">{order.giftCardBrand}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                    {order.paymentMethod && (
                      <p className="text-xs text-muted-foreground capitalize">via {order.paymentMethod.replace("_", " ")}</p>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xl font-mono font-bold text-cyan-400">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">qty: {order.quantity}</p>
                  <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              {/* Gift card code — only shown when order is completed */}
              {order.status === "completed" && (order as any).giftCardCode && (
                <Card className="mx-5 mb-5 bg-green-500/5 border-green-500/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                    <Eye className="h-4 w-4" />
                    Gift Card Code — Ready to Use
                  </div>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 font-mono text-lg tracking-widest text-foreground font-bold bg-background/60 px-4 py-2 rounded-lg border border-border/50"
                      data-testid={`text-gift-code-${order.id}`}
                    >
                      {(order as any).giftCardCode}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => copyCode((order as any).giftCardCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Redeem this code on the brand's official website or app.
                  </p>
                </Card>
              )}

              {/* Pending — payment instructions */}
              {order.status === "pending" && (
                <div className="mx-5 mb-5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Awaiting payment confirmation
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Send your Bank Transfer or USDT payment and our team will confirm it shortly.
                    Your gift card code will appear here once verified.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
