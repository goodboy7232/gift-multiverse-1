import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ArrowLeft, CreditCard, QrCode, Wallet, Save } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

async function fetchPaymentInfo(token: string | null) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/payment-info`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch payment info");
  return res.json();
}

async function updatePaymentInfo(token: string | null, data: any) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/admin/payment-info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update payment info");
  return res.json();
}

export default function AdminPaymentInfo() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: info, isLoading } = useQuery({
    queryKey: ["payment-info"],
    queryFn: () => fetchPaymentInfo(token),
    enabled: !!token,
  });

  const [upiId, setUpiId] = useState("");
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdtNetwork, setUsdtNetwork] = useState("BEP20");
  const [usdtQrUrl, setUsdtQrUrl] = useState("");

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  useEffect(() => {
    if (info) {
      setUpiId(info.upiId ?? "");
      setUpiQrUrl(info.upiQrUrl ?? "");
      setUsdtAddress(info.usdtAddress ?? "");
      setUsdtNetwork(info.usdtNetwork ?? "BEP20");
      setUsdtQrUrl(info.usdtQrUrl ?? "");
    }
  }, [info]);

  const mutation = useMutation({
    mutationFn: (data: any) => updatePaymentInfo(token, data),
    onSuccess: () => {
      toast({ title: "Payment info updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["payment-info"] });
    },
    onError: () => {
      toast({ title: "Failed to update payment info", variant: "destructive" });
    },
  });

  if (!token || (me && me.role !== "admin")) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Settings</h1>
      <p className="text-muted-foreground mb-8">Configure UPI and USDT payment details shown to buyers</p>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* UPI Section */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold">UPI Payment</h2>
                <p className="text-xs text-muted-foreground">Indian UPI QR code and ID</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">UPI ID</label>
                <Input
                  placeholder="example@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">e.g., 9876543210@paytm or name@oksbi</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">UPI QR Code URL</label>
                <Input
                  placeholder="https://..."
                  value={upiQrUrl}
                  onChange={(e) => setUpiQrUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Link to hosted QR code image (optional)</p>
              </div>
            </div>
          </div>

          {/* USDT Section */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold">USDT Payment</h2>
                <p className="text-xs text-muted-foreground">Crypto wallet address and QR</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">USDT Wallet Address</label>
                <Input
                  placeholder="0x..."
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Network</label>
                <Input
                  value={usdtNetwork}
                  onChange={(e) => setUsdtNetwork(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">e.g., BEP20, TRC20, ERC20</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">USDT QR Code URL</label>
                <Input
                  placeholder="https://..."
                  value={usdtQrUrl}
                  onChange={(e) => setUsdtQrUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Link to hosted QR code image (optional)</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                upiId: upiId || undefined,
                upiQrUrl: upiQrUrl || undefined,
                usdtAddress: usdtAddress || undefined,
                usdtNetwork,
                usdtQrUrl: usdtQrUrl || undefined,
              })
            }
          >
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Saving..." : "Save Payment Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}
