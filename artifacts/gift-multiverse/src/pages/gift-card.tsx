import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetGiftCard,
  getGetGiftCardQueryKey,
  useGetGiftCards,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ShoppingBag, Shield, ArrowLeft, Package, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import BrandCardImage from "@/components/BrandCardImage";

export default function GiftCardDetail() {
  const [, params] = useRoute("/gift-card/:id");
  const id = parseInt(params?.id ?? "0");
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ orderId: number; totalPrice: number } | null>(null);

  const { data: card, isLoading } = useGetGiftCard(id, {
    query: { queryKey: getGetGiftCardQueryKey(id), enabled: id > 0 },
  });

  // Fetch sibling cards (same brand) for denomination selection
  const { data: siblingData } = useGetGiftCards(
    { search: card?.brand ?? "", limit: 20 },
    { query: { enabled: !!card?.brand, queryKey: ["gift-cards-siblings", card?.brand] } }
  );
  const siblings = (siblingData?.items ?? []).filter(
    (c: { id: number; brand: string; subcategoryId: number; isActive: boolean; stock: number }) =>
      c.brand === card?.brand && c.subcategoryId === card?.subcategoryId && c.isActive && c.stock > 0
  );

  const handleBuy = () => {
    if (!token) {
      setLocation("/login");
      return;
    }
    setShowBuyModal(true);
  };

  const confirmPurchase = () => {
    setShowBuyModal(false);
    // Redirect to payment page first, order will be created after payment proof
    setLocation(`/checkout/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Card not found</h2>
        <Link href="/browse"><Button variant="outline">Back to Marketplace</Button></Link>
      </div>
    );
  }

  const savings = card.originalPrice - card.sellPrice;
  const inStock = card.stock > 0 && card.isActive;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Link href="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden h-72 md:h-auto border border-border/50 bg-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/10" />
          <BrandCardImage brand={card.brand} categoryName={card.categoryName} imageUrl={card.imageUrl} />
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground border-none font-bold text-sm px-3 py-1">
            -{card.discountPct}% OFF
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-cyan-400 mb-1">{card.brand}</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">{card.name}</h1>
            {card.subcategoryName && (
              <p className="text-sm text-muted-foreground">{card.categoryName} › {card.subcategoryName}</p>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-mono font-bold text-cyan-400">${card.sellPrice.toFixed(2)}</span>
            <div className="space-y-1">
              <span className="text-lg font-mono text-muted-foreground line-through">${card.originalPrice.toFixed(2)}</span>
              <p className="text-sm text-green-400 font-medium">You save ${savings.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              Face value: <span className="font-mono text-foreground ml-1">${card.denomination.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              Stock: <span className={`font-mono ml-1 ${card.stock > 5 ? "text-green-400" : "text-amber-400"}`}>{card.stock}</span>
            </div>
          </div>

          {/* Denomination selector — other denominations from same brand */}
          {siblings.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Denomination</p>
              <div className="flex flex-wrap gap-2">
                {(siblings as Array<{ id: number; denomination: number; sellPrice: number }>)
                  .sort((a, b) => a.denomination - b.denomination)
                  .map((sibling) => (
                    <Link key={sibling.id} href={`/gift-card/${sibling.id}`}>
                      <button
                        className={`px-4 py-2 rounded-lg border text-sm font-mono font-semibold transition-all ${
                          sibling.id === card.id
                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                            : "bg-background border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        ₹{sibling.denomination.toFixed(0)}
                        <span className="ml-1 text-xs opacity-70">→${sibling.sellPrice.toFixed(0)}</span>
                      </button>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Order Placed — Pending Confirmation */}
          {orderPlaced && (
            <Card className="bg-amber-500/10 border-amber-500/30 p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Clock className="h-5 w-5" />
                Order Placed — Awaiting Payment Confirmation
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your order <span className="font-mono font-bold text-foreground">#{orderPlaced.orderId}</span> for{" "}
                <span className="font-bold text-cyan-400">${orderPlaced.totalPrice.toFixed(2)}</span> has been placed.
                Please send your payment via <strong>Bank Transfer</strong> or <strong>USDT</strong> and provide the reference in your order.
                Once our team confirms your payment, your gift card code will be revealed in your Orders page.
              </p>
              <div className="flex gap-3">
                <Link href="/orders">
                  <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30">
                    <CheckCircle className="w-4 h-4 mr-1" /> View My Orders
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button size="sm" variant="ghost" className="text-muted-foreground">
                    Continue Shopping <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Trust Badges */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-green-400" />
              Verified Code
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-cyan-400" />
              Admin-Confirmed Delivery
            </div>
          </div>

          {!orderPlaced && (
            <Button
              data-testid="button-buy"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-[0_0_25px_rgba(168,85,247,0.4)]"
              onClick={handleBuy}
              disabled={!inStock}
            >
              {inStock ? (
                <><ShoppingBag className="mr-2 h-5 w-5" /> Buy Now — ${card.sellPrice.toFixed(2)}</>
              ) : "Out of Stock"}
            </Button>
          )}

          {!token && !orderPlaced && (
            <p className="text-xs text-muted-foreground text-center">
              <Link href="/login" className="text-cyan-400 hover:underline">Sign in</Link> or{" "}
              <Link href="/register" className="text-primary hover:underline">register</Link> to purchase
            </p>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="bg-background/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{card.name}</span>
                <span className="font-mono font-bold text-cyan-400">${card.sellPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Face value ${card.denomination.toFixed(2)} · {card.discountPct}% off
              </p>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> How delivery works
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Place your order — stock is reserved instantly</li>
                <li>Send payment via Bank Transfer or USDT</li>
                <li>Our team verifies your payment (usually minutes)</li>
                <li>Gift card code revealed in your Orders page</li>
              </ol>
            </div>

            <Button
              data-testid="button-confirm-purchase"
              className="w-full bg-primary hover:bg-primary/90 font-bold"
              onClick={confirmPurchase}
            >
              Proceed to Payment — ${card.sellPrice.toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
