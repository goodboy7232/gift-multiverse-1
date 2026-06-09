import { useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetGiftCard, getGetGiftCardQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ArrowLeft, QrCode, Wallet, Upload, CheckCircle, Copy, ImageIcon, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import BrandCardImage from "@/components/BrandCardImage";

async function fetchPaymentInfo() {
  const res = await fetch(`/api/payment-info`);
  if (!res.ok) throw new Error("Failed to fetch payment info");
  return res.json();
}

async function createOrderAfterPayment(token: string | null, giftCardId: number, data: any) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ giftCardId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export default function CheckoutPage() {
  const [, params] = useRoute("/checkout/:giftCardId");
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const giftCardId = parseInt(params?.giftCardId ?? "0");

  const { data: card, isLoading } = useGetGiftCard(giftCardId, {
    query: { queryKey: getGetGiftCardQueryKey(giftCardId), enabled: giftCardId > 0 },
  });

  const { data: paymentInfo } = useQuery({
    queryKey: ["payment-info"],
    queryFn: fetchPaymentInfo,
  });

  const [activeTab, setActiveTab] = useState<"upi" | "usdt">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token, setLocation]);

  const mutation = useMutation({
    mutationFn: (data: any) => createOrderAfterPayment(token, giftCardId, data),
    onSuccess: (data) => {
      toast({ title: "Payment proof submitted! Order created." });
      setSubmitted(true);
      setOrderId(data.orderId);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setScreenshotBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  if (!token) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Link href="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>
        <div className="text-center py-20 text-muted-foreground">
          <p>Gift card not found</p>
        </div>
      </div>
    );
  }

  if (submitted && orderId) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Link href="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <div className="text-center py-16 bg-card/50 border border-green-500/30 rounded-2xl">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-400 mb-2">Payment Proof Submitted!</h2>
          <p className="text-muted-foreground mb-1">Your order is under review.</p>
          <p className="text-sm text-muted-foreground">Order #{orderId} · {card.name}</p>
          <Button className="mt-6" onClick={() => setLocation("/orders")}>View My Orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <Link href={`/gift-card/${giftCardId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Card
      </Link>

      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden mb-4 border border-border/50">
          <BrandCardImage brand={card.brand} imageUrl={card.imageUrl} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{card.name}</h1>
        <p className="text-muted-foreground mt-1">{card.brand}</p>
        <p className="text-xl font-mono font-bold text-cyan-400 mt-2">${card.sellPrice.toFixed(2)}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upi" | "usdt")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upi">
            <QrCode className="h-4 w-4 mr-2" /> UPI
          </TabsTrigger>
          <TabsTrigger value="usdt">
            <Wallet className="h-4 w-4 mr-2" /> USDT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upi" className="mt-6 space-y-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 text-center">
            <h3 className="font-semibold mb-4">Pay via UPI</h3>
            {paymentInfo?.upiQrUrl ? (
              <div className="mb-4">
                <img src={paymentInfo.upiQrUrl} alt="UPI QR" className="w-48 h-48 mx-auto rounded-lg border border-border/50" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto rounded-lg border border-dashed border-border/50 flex items-center justify-center mb-4">
                <QrCode className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="bg-background rounded-lg p-4 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-mono font-bold text-lg">{paymentInfo?.upiId ?? "Not configured"}</p>
                {paymentInfo?.upiId && (
                  <button onClick={() => copyToClipboard(paymentInfo.upiId)} className="text-muted-foreground hover:text-cyan-400">
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Upload Payment Proof</h4>
            <div>
              <label className="text-sm font-medium mb-1 block">UPI Transaction ID / UTR</label>
              <Input
                placeholder="e.g., 123456789012"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Screenshot</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 transition-colors"
              >
                {screenshotBase64 ? (
                  <img src={screenshotBase64} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">JPG, PNG, max 5MB</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!transactionId.trim() || mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  paymentMethod: "upi",
                  transactionId,
                  screenshotUrl: screenshotBase64,
                })
              }
            >
              <Upload className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Submitting..." : "Pay & Place Order"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="usdt" className="mt-6 space-y-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 text-center">
            <h3 className="font-semibold mb-4">Pay via USDT</h3>
            {paymentInfo?.usdtQrUrl ? (
              <div className="mb-4">
                <img src={paymentInfo.usdtQrUrl} alt="USDT QR" className="w-48 h-48 mx-auto rounded-lg border border-border/50" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto rounded-lg border border-dashed border-border/50 flex items-center justify-center mb-4">
                <QrCode className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="bg-background rounded-lg p-4 border border-border/50 mb-3">
              <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-mono text-sm break-all">{paymentInfo?.usdtAddress ?? "Not configured"}</p>
                {paymentInfo?.usdtAddress && (
                  <button onClick={() => copyToClipboard(paymentInfo.usdtAddress)} className="text-muted-foreground hover:text-cyan-400 shrink-0">
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Network</p>
              <p className="font-mono font-bold text-sm">{paymentInfo?.usdtNetwork ?? "BEP20"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Upload Payment Proof</h4>
            <div>
              <label className="text-sm font-medium mb-1 block">Transaction Hash</label>
              <Input
                placeholder="e.g., 0xabc123..."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Screenshot</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 transition-colors"
              >
                {screenshotBase64 ? (
                  <img src={screenshotBase64} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">JPG, PNG, max 5MB</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!transactionId.trim() || mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  paymentMethod: "usdt",
                  transactionId,
                  screenshotUrl: screenshotBase64,
                })
              }
            >
              <Upload className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Submitting..." : "Pay & Place Order"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground/50 mt-8">
        Payment proofs are manually reviewed. Your order will be placed after payment proof submission.
      </p>
    </div>
  );
}
