import { useLocation } from "wouter";
import { useGetUserSellRequests, getGetUserSellRequestsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Tag } from "lucide-react";
import { Link } from "wouter";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[status] ?? "bg-muted/20 text-muted-foreground";
}

export default function MyListings() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token, setLocation]);

  const { data: sells, isLoading } = useGetUserSellRequests({
    query: { enabled: !!token, queryKey: getGetUserSellRequestsQueryKey() },
  });

  if (!token) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground mt-1">Gift cards you've submitted for sale</p>
        </div>
        <Link href="/sell">
          <Button className="bg-primary hover:bg-primary/90">+ New Listing</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !sells?.length ? (
        <div className="text-center py-24">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">Submit your unused gift cards for review</p>
          <Link href="/sell">
            <Button className="bg-primary hover:bg-primary/90">Sell a Card</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sells.map((sell) => (
            <div
              key={sell.id}
              data-testid={`row-sell-${sell.id}`}
              className="p-5 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{sell.brand}</p>
                  <p className="text-sm text-muted-foreground capitalize">{sell.cardType} · {sell.websiteUrl}</p>
                </div>
                <Badge variant="outline" className={statusBadge(sell.status)}>
                  {sell.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">
                    Face value: <span className="font-mono text-foreground">${sell.cardFaceValue.toFixed(2)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Asking: <span className="font-mono text-green-400">${sell.askingPrice.toFixed(2)}</span>
                  </span>
                  {sell.approvedPayout != null && (
                    <span className="text-muted-foreground">
                      Payout: <span className="font-mono text-cyan-400">${sell.approvedPayout.toFixed(2)}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(sell.createdAt).toLocaleDateString()}
                </p>
              </div>
              {sell.adminNote && (
                <div className="mt-3 p-3 bg-muted/10 border border-border/30 rounded-lg text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Admin note: </span>{sell.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
