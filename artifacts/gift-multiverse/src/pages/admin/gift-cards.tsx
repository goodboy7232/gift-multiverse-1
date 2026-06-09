import { useState } from "react";
import { useLocation } from "wouter";
import {
  useAdminGetGiftCards,
  getAdminGetGiftCardsQueryKey,
  useGetMe,
  getGetMeQueryKey,
  useAdminCreateGiftCard,
  useAdminUpdateGiftCard,
  useAdminDeleteGiftCard,
  useGetCategories,
  getGetCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Search, ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface GiftCardForm {
  brand: string;
  name: string;
  denomination: string;
  originalPrice: string;
  sellPrice: string;
  discountPct: string;
  stock: string;
  placeholderColor: string;
  imageUrl: string;
  subcategoryId: string;
  isActive: boolean;
}

function emptyForm(): GiftCardForm {
  return {
    brand: "",
    name: "",
    denomination: "",
    originalPrice: "",
    sellPrice: "",
    discountPct: "0",
    stock: "1",
    placeholderColor: "",
    imageUrl: "",
    subcategoryId: "",
    isActive: true,
  };
}

function formToInput(f: GiftCardForm) {
  return {
    brand: f.brand,
    name: f.name,
    denomination: parseFloat(f.denomination),
    originalPrice: parseFloat(f.originalPrice),
    sellPrice: parseFloat(f.sellPrice),
    discountPct: parseFloat(f.discountPct),
    stock: parseInt(f.stock),
    placeholderColor: f.placeholderColor || null,
    imageUrl: f.imageUrl || null,
    subcategoryId: parseInt(f.subcategoryId),
    isActive: f.isActive,
  };
}

function cardToForm(card: any): GiftCardForm {
  return {
    brand: card.brand ?? "",
    name: card.name ?? "",
    denomination: String(card.denomination ?? ""),
    originalPrice: String(card.originalPrice ?? ""),
    sellPrice: String(card.sellPrice ?? ""),
    discountPct: String(card.discountPct ?? 0),
    stock: String(card.stock ?? 1),
    placeholderColor: card.placeholderColor ?? "",
    imageUrl: card.imageUrl ?? "",
    subcategoryId: String(card.subcategoryId ?? ""),
    isActive: card.isActive ?? true,
  };
}

function GiftCardDialog({
  open,
  onClose,
  initial,
  onSave,
  isSaving,
  categories,
  isEdit,
}: {
  open: boolean;
  onClose: () => void;
  initial: GiftCardForm;
  onSave: (f: GiftCardForm) => void;
  isSaving: boolean;
  categories: any[];
  isEdit: boolean;
}) {
  const [form, setForm] = useState<GiftCardForm>(initial);
  useEffect(() => setForm(initial), [initial, open]);
  if (!open) return null;

  const valid =
    form.brand.trim() &&
    form.name.trim() &&
    form.denomination &&
    parseFloat(form.denomination) > 0 &&
    form.originalPrice &&
    parseFloat(form.originalPrice) > 0 &&
    form.sellPrice &&
    parseFloat(form.sellPrice) > 0 &&
    form.subcategoryId &&
    parseInt(form.subcategoryId) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Gift Card" : "Create Gift Card"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Brand</label>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Netflix, Amazon, etc." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Card Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Netflix Gift Card $25" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Denomination ($)</label>
              <Input type="number" value={form.denomination} onChange={(e) => setForm({ ...form, denomination: e.target.value })} placeholder="25" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stock</label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Original Price ($)</label>
              <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="25" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sale Price ($)</label>
              <Input type="number" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} placeholder="22" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Discount %</label>
            <Input type="number" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} placeholder="12" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subcategory</label>
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              value={form.subcategoryId}
              onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
            >
              <option value="">Select subcategory</option>
              {categories?.map((cat) =>
                cat.subcategories?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {cat.name} / {sub.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Placeholder Color (hex)</label>
            <Input value={form.placeholderColor} onChange={(e) => setForm({ ...form, placeholderColor: e.target.value })} placeholder="#e50914" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Image URL (optional)</label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.png" />
            {form.imageUrl && (
              <div className="mt-2 border border-border/50 rounded-lg overflow-hidden max-h-32">
                <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!valid || isSaving} onClick={() => onSave(form)}>
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Gift Card"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGiftCards() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; editId: number | null; form: GiftCardForm }>({
    open: false,
    editId: null,
    form: emptyForm(),
  });

  const { data: me } = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() } });
  const { data: cards, isLoading } = useAdminGetGiftCards({
    query: { enabled: !!token, queryKey: getAdminGetGiftCardsQueryKey() },
  });
  const { data: categories } = useGetCategories({
    query: { enabled: !!token, queryKey: getGetCategoriesQueryKey() },
  });

  const createMutation = useAdminCreateGiftCard({
    mutation: {
      onSuccess: () => {
        toast({ title: "Gift card created!" });
        queryClient.invalidateQueries({ queryKey: getAdminGetGiftCardsQueryKey() });
        setDialog({ open: false, editId: null, form: emptyForm() });
      },
      onError: () => {
        toast({ title: "Failed to create gift card", variant: "destructive" });
      },
    },
  });

  const updateMutation = useAdminUpdateGiftCard({
    mutation: {
      onSuccess: () => {
        toast({ title: "Gift card updated!" });
        queryClient.invalidateQueries({ queryKey: getAdminGetGiftCardsQueryKey() });
        setDialog({ open: false, editId: null, form: emptyForm() });
      },
      onError: () => {
        toast({ title: "Failed to update gift card", variant: "destructive" });
      },
    },
  });

  const deleteMutation = useAdminDeleteGiftCard({
    mutation: {
      onSuccess: () => {
        toast({ title: "Gift card deleted!" });
        queryClient.invalidateQueries({ queryKey: getAdminGetGiftCardsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete gift card", variant: "destructive" });
      },
    },
  });

  useEffect(() => {
    if (!token) setLocation("/login");
    else if (me && me.role !== "admin") setLocation("/");
  }, [token, me, setLocation]);

  if (!token || (me && me.role !== "admin")) return null;

  const filtered = search ? cards?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : cards;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <GiftCardDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, editId: null, form: emptyForm() })}
        initial={dialog.form}
        onSave={(form) => {
          if (dialog.editId) {
            updateMutation.mutate({ id: dialog.editId, data: formToInput(form) });
          } else {
            createMutation.mutate({ data: formToInput(form) });
          }
        }}
        isSaving={createMutation.isPending || updateMutation.isPending}
        categories={categories ?? []}
        isEdit={!!dialog.editId}
      />

      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-muted-foreground mt-1">Total: {cards?.length ?? "..."} cards</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-10 w-56 bg-background/50"
            />
          </div>
          <Button
            onClick={() => setDialog({ open: true, editId: null, form: emptyForm() })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-6 text-xs font-medium text-muted-foreground uppercase px-4 pb-2 border-b border-border/30">
            <span className="col-span-2">Name</span>
            <span>Original</span>
            <span>Sale Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          {filtered?.map((card) => (
            <div key={card.id} data-testid={`row-card-${card.id}`} className="grid grid-cols-6 items-center p-4 bg-card/30 border border-border/30 rounded-lg hover:border-primary/20 transition-colors">
              <div className="col-span-2">
                <p className="font-medium text-sm line-clamp-1">{card.name}</p>
                <p className="text-xs text-muted-foreground">{card.brand} · -{card.discountPct}% off</p>
              </div>
              <span className="font-mono text-sm text-muted-foreground line-through">${Number(card.originalPrice).toFixed(2)}</span>
              <span className="font-mono text-sm text-cyan-400">${Number(card.sellPrice).toFixed(2)}</span>
              <Badge
                variant="outline"
                className={card.stock > 0 && card.isActive ? "bg-green-500/10 text-green-400 border-green-500/20 text-xs" : "bg-red-500/10 text-red-400 border-red-500/20 text-xs"}
              >
                {card.isActive ? (card.stock > 0 ? `${card.stock} left` : "Sold Out") : "Inactive"}
              </Badge>
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => setDialog({ open: true, editId: card.id, form: cardToForm(card) })}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm("Delete this gift card? This action cannot be undone.")) {
                      deleteMutation.mutate({ id: card.id });
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
