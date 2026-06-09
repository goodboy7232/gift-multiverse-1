import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminGetOrders, getAdminGetOrdersQueryKey, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ShoppingBag, ArrowLeft, CheckCircle, X, Copy, Eye, ImageIcon, QrCode, Wallet } from "lucide-react";
import { Link } from "wouter";
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

async function fetchProofs(orderId: number, token: string | null) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/admin/orders/${orderId}/proofs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch proofs");
  return res.json();
}

async function approveOrder(token: string | null, orderId: number, proofId: number, giftCardCode?: string) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ proofId, giftCardCode }),
  });
  if (!res.ok) throw new Error("Failed to approve order");
  return res.json();
}

async function rejectProof(token: string | null, orderId: number, proofId: number, adminNote: string) {
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ proofId, adminNote }),
  });
  if (!res.ok) throw new Error("Failed to reject proof");
  return res.json();
}

interface Proof {
  id: number;
  orderId: number;
  paymentMethod: string;
  transactionId: string;
  screenshotUrl: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

interface ProofModalProps {
  orderId: number;
  totalPrice: number;
  cardName: string | null;
  cardBrand: string | null;
  username: string | null;
  onClose: () => void;
  onApprove: (code: string | null) => void;
}

function ProofModal({ orderId, totalPrice, cardName, cardBrand, username, onClose, onApprove }: ProofModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectNote, setRejectNote] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [approveProofId, setApproveProofId] = useState<number | null>(null);

  const { data: proofs, isLoading: proofsLoading } = useQuery({
    queryKey: ["order-proofs", orderId],
    queryFn: () => fetchProofs(orderId, token),
    enabled: !!token,
  });

  const approveMutation = useMutation({
    mutationFn: (proofId: number) => approveOrder(token, orderId, proofId, giftCardCode.trim() || undefined),
    onSuccess: (data) => {
      toast({ title: "Order approved!", description: `Order #${orderId} confirmed.` });
      queryClient.invalidateQueries({ queryKey: getAdminGetOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["order-proofs", orderId] });
      setShowCodeInput(false);
      setGiftCardCode("");
      setApproveProofId(null);
      onApprove((data as any).giftCardCode ?? null);
    },
    onError: () => {
      toast({ title: "Failed to approve", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (proofId: number) => rejectProof(token, orderId, proofId, rejectNote),
    onSuccess: () => {
      toast({ title: "Order rejected" });
      queryClient.invalidateQueries({ queryKey: getAdminGetOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["order-proofs", orderId] });
      setRejectTarget(null);
      setRejectNote("");
    },
    onError: () => {
      toast({ title: "Failed to reject", variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Payment Proof</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
          Order #{orderId} · {cardName ?? "Gift Card"} · <span className="font-mono font-bold">${totalPrice.toFixed(2)}</span>
          <br />
          <span className="text-xs text-muted-foreground">User: {username ?? `#${orderId}`}</span>
        </div>

        {proofsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !proofs?.length ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No payment proofs submitted yet</p>
            <p className="text-xs mt-1">User will upload proof via the payment page</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proofs.map((proof: Proof) => (
              <div key={proof.id} className="border border-border/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {proof.paymentMethod === "upi" ? (
                      <QrCode className="h-4 w-4 text-green-400" />
                    ) : (
                      <Wallet className="h-4 w-4 text-purple-400" />
                    )}
                    <span className="font-medium text-sm capitalize">{proof.paymentMethod}</span>
                    <Badge variant="outline" className={`text-xs ${statusBadge(proof.status)}`}>{proof.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(proof.createdAt).toLocaleString()}</span>
                </div>

                <div className="bg-background rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Transaction ID / Hash</p>
                  <p className="font-mono text-sm break-all">{proof.transactionId}</p>
                </div>

                {proof.screenshotUrl && (
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <img
                      src={proof.screenshotUrl}
                      alt="Payment proof"
                      className="w-full max-h-64 object-contain"
                      onClick={() => window.open(proof.screenshotUrl!, "_blank")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                )}

                {proof.adminNote && (
                  <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                    Rejected: {proof.adminNote}
                  </div>
                )}

                {proof.status === "pending" && (
                  <div className="space-y-3">
                    {showCodeInput && approveProofId === proof.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block text-green-400">Enter Gift Card / Coupon Code</label>
                          <input
                            className="w-full bg-background border border-green-500/30 rounded-lg px-3 py-2 text-sm font-mono"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={giftCardCode}
                            onChange={(e) => setGiftCardCode(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowCodeInput(false); setGiftCardCode(""); setApproveProofId(null); }}>
                            Cancel
                          </Button>
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-500" disabled={!giftCardCode.trim() || approveMutation.isPending} onClick={() => approveMutation.mutate(proof.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" /> {approveMutation.isPending ? "Approving..." : "Approve"}
                          </Button>
                        </div>
                      </div>
                    ) : rejectTarget === proof.id ? (
                      <div className="space-y-2">
                        <input
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                          placeholder="Reason for rejection"
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => { setRejectTarget(null); setRejectNote(""); }}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" disabled={!rejectNote.trim() || rejectMutation.isPending} onClick={() => rejectMutation.mutate(proof.id)}>
                            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setRejectTarget(proof.id)}>
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-500" onClick={() => { setShowCodeInput(true); setApproveProofId(proof.id); }}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CodeRevealProps {
  code: string;
  orderId: number;
  onClose: () => void;
}

function CodeReveal({ code, orderId, onClose }: CodeRevealProps) {
  const { toast } = useToast();
  function copy() {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-green-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-400">Order Approved!</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Order #{orderId} is now complete. Gift card code:</p>
        <div className="flex items-center gap-2 p-4 bg-background rounded-xl border border-border font-mono text-cyan-400 text-sm break-all">
          <span className="flex-1">{code}</span>
          <button onClick={copy} className="shrink-0 hover:text-cyan-300 transition-colors">
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <Button className="w-full" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useAdminGetOrders(
    undefined,
    { query: { enabled: !!token, queryKey: getAdminGetOrdersQueryKey() } }
  );

  const [proofModal, setProofModal] = useState<{ id: number; totalPrice: number; cardName: string | null; cardBrand: string | null; username: string | null } | null>(null);
  const [revealCode, setRevealCode] = useState<{ code: string; orderId: number } | null>(null);

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  if (!token || (me && me.role !== "admin")) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {proofModal && (
        <ProofModal
          orderId={proofModal.id}
          totalPrice={proofModal.totalPrice}
          cardName={proofModal.cardName}
          cardBrand={proofModal.cardBrand}
          username={proofModal.username}
          onClose={() => {
            setProofModal(null);
            queryClient.invalidateQueries({ queryKey: getAdminGetOrdersQueryKey() });
          }}
          onApprove={(code) => {
            setProofModal(null);
            if (code) setRevealCode({ code, orderId: proofModal.id });
          }}
        />
      )}
      {revealCode && (
        <CodeReveal code={revealCode.code} orderId={revealCode.orderId} onClose={() => setRevealCode(null)} />
      )}

      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">All Orders</h1>
      <p className="text-muted-foreground mb-8">
        Platform-wide order history · Pending orders show payment proofs submitted by users
      </p>

      {isLoading ? (
        <div className="space-y-3">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : !orders?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              data-testid={`row-order-${order.id}`}
              className="flex items-center justify-between p-5 bg-card/50 border border-border/50 rounded-xl gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{order.giftCardName ?? `Order #${order.id}`}</p>
                {order.giftCardBrand && <p className="text-xs text-cyan-400">{order.giftCardBrand}</p>}
                <p className="text-sm text-muted-foreground">User: {order.username ?? `#${order.userId}`}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                  {order.paymentMethod ? ` · via ${order.paymentMethod.replace("_", " ")}` : ""}
                  {order.paymentRef ? ` · ref: ${order.paymentRef.slice(0, 12)}…` : ""}
                </p>
              </div>
              <div className="text-right space-y-2 shrink-0">
                <p className="font-mono font-bold text-cyan-400">${order.totalPrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">qty: {order.quantity}</p>
                <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>
                  {order.status}
                </Badge>
                {order.status === "pending" && (
                  <div>
                    <Button
                      size="sm"
                      className="mt-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs h-7"
                      onClick={() => setProofModal({ id: order.id, totalPrice: order.totalPrice, cardName: order.giftCardName ?? null, cardBrand: order.giftCardBrand ?? null, username: order.username ?? null })}
                    >
                      <Eye className="w-3 h-3 mr-1" /> View Proof
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
