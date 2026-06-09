import { useState } from "react";
import { useLocation } from "wouter";
import {
  useAdminGetSellRequests,
  getAdminGetSellRequestsQueryKey,
  useAdminApproveSellRequest,
  useAdminRejectSellRequest,
  useGetMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return map[status] ?? "bg-muted/20 text-muted-foreground";
}

export default function AdminSellRequests() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [approveTarget, setApproveTarget] = useState<{ id: number; askingPrice: number } | null>(null);
  const [approvePayout, setApprovePayout] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: requests, isLoading } = useAdminGetSellRequests(
    undefined,
    { query: { enabled: !!token, queryKey: getAdminGetSellRequestsQueryKey() } }
  );

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  const approveMutation = useAdminApproveSellRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Sell request approved and live!" });
        queryClient.invalidateQueries({ queryKey: getAdminGetSellRequestsQueryKey() });
        setApproveTarget(null);
        setApprovePayout("");
      },
      onError: (err: any) => toast({ title: "Failed to approve", description: err?.data?.message, variant: "destructive" }),
    },
  });

  const rejectMutation = useAdminRejectSellRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Sell request rejected." });
        queryClient.invalidateQueries({ queryKey: getAdminGetSellRequestsQueryKey() });
        setRejectTarget(null);
        setRejectNote("");
      },
      onError: (err: any) => toast({ title: "Failed to reject", description: err?.data?.message, variant: "destructive" }),
    },
  });

  if (!token || (me && me.role !== "admin")) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Sell Requests</h1>
      <p className="text-muted-foreground mb-8">Review and approve user card submissions</p>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      ) : !requests?.length ? (
        <p className="text-center py-16 text-muted-foreground">No sell requests found</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} data-testid={`row-sell-request-${req.id}`} className="p-5 bg-card/50 border border-border/50 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{req.brand}</p>
                  <p className="text-sm text-muted-foreground">
                    by {req.username ?? "unknown"} · <a href={req.websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{req.websiteUrl}</a>
                  </p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{req.cardType} card</p>
                </div>
                <Badge variant="outline" className={statusBadge(req.status)}>{req.status}</Badge>
              </div>
              <div className="bg-background/50 border border-border/30 rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Voucher / Gift Card Code</p>
                <p className="font-mono text-sm text-cyan-400 break-all">{req.voucherCode}</p>
              </div>
              {req.extraDetails && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{req.extraDetails}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">Face: <span className="font-mono text-foreground">${req.cardFaceValue.toFixed(2)}</span></span>
                  <span className="text-muted-foreground">Ask: <span className="font-mono text-green-400">${req.askingPrice.toFixed(2)}</span></span>
                </div>
                {req.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      data-testid={`button-approve-${req.id}`}
                      size="sm"
                      onClick={() => { setApproveTarget({ id: req.id, askingPrice: req.askingPrice }); setApprovePayout(req.askingPrice.toString()); }}
                      className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      data-testid={`button-reject-${req.id}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => { setRejectTarget(req.id); setRejectNote(""); }}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
              {req.adminNote && (
                <div className="mt-3 p-3 bg-muted/10 border border-border/30 rounded-lg text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Admin note: </span>{req.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent className="bg-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve & Set Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Approved Payout ($)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={approvePayout}
                onChange={(e) => setApprovePayout(e.target.value)}
                placeholder="e.g. 42.50"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Asking price: ${approveTarget?.askingPrice.toFixed(2)}</p>
            </div>
            <Button
              className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20"
              onClick={() => {
                if (!approveTarget) return;
                approveMutation.mutate({ id: approveTarget.id, data: { approvedPayout: parseFloat(approvePayout) } });
              }}
              disabled={approveMutation.isPending || !approvePayout || parseFloat(approvePayout) <= 0}
            >
              {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectTarget !== null} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="bg-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Sell Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Reason for rejection</label>
              <Input
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Card already used, Invalid code"
              />
            </div>
            <Button
              className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
              onClick={() => {
                if (rejectTarget === null) return;
                rejectMutation.mutate({ id: rejectTarget, data: { adminNote: rejectNote } });
              }}
              disabled={rejectMutation.isPending || !rejectNote.trim()}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
