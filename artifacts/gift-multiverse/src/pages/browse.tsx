import { useState } from "react";
import { Link, useSearch } from "wouter";
import {
  useGetGiftCards,
  useGetCategories,
  getGetGiftCardsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Tag } from "lucide-react";
import BrandCardImage from "@/components/BrandCardImage";

export default function Browse() {
  const searchStr = useSearch();
  const urlParams = new URLSearchParams(searchStr);

  const [search, setSearch] = useState(urlParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    urlParams.get("categoryId") ? Number(urlParams.get("categoryId")) : null
  );
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [sort, setSort] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: categories } = useGetCategories();

  const queryParams = {
    search: search || undefined,
    categoryId: categoryId ?? undefined,
    subcategoryId: subcategoryId ?? undefined,
    sort: (sort || undefined) as any,
    page,
    limit: 24,
  };

  const { data, isLoading } = useGetGiftCards(queryParams, {
    query: { queryKey: getGetGiftCardsQueryKey(queryParams) },
  });

  const selectedCat = categories?.find((c) => c.id === categoryId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Marketplace</span>
        </h1>
        <p className="text-muted-foreground">Browse {data?.total ?? "..."} gift cards across all categories</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>

            <form onSubmit={handleSearch} className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cards..."
                  className="pl-10 bg-background/50"
                />
              </div>
              <Button type="submit" size="sm" className="w-full bg-primary/20 text-primary hover:bg-primary/30">
                Search
              </Button>
            </form>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
              <Select
                value={categoryId?.toString() ?? "all"}
                onValueChange={(v) => {
                  setCategoryId(v === "all" ? null : Number(v));
                  setSubcategoryId(null);
                  setPage(1);
                }}
              >
                <SelectTrigger data-testid="select-category" className="bg-background/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCat && (selectedCat.subcategories?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Subcategory</label>
                <Select
                  value={subcategoryId?.toString() ?? "all"}
                  onValueChange={(v) => { setSubcategoryId(v === "all" ? null : Number(v)); setPage(1); }}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {selectedCat.subcategories?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Sort By</label>
              <Select
                value={sort || "default"}
                onValueChange={(v) => { setSort(v === "default" ? "" : v); setPage(1); }}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="discount_desc">Biggest Discount</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => { setSearch(""); setCategoryId(null); setSubcategoryId(null); setSort(""); setPage(1); }}
            >
              Clear filters
            </Button>
          </div>

          {/* Category Quick Links */}
          <div className="bg-card/30 border border-border/30 rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Quick Browse</p>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                data-testid={`link-category-${cat.slug}`}
                onClick={() => { setCategoryId(cat.id); setSubcategoryId(null); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array(12).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50">
                  <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
                  <CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                  <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
                </Card>
              ))}
            </div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No cards found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-muted-foreground">
                  Showing {data?.items.length} of {data?.total} cards
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data?.items.map((card) => (
                  <Card key={card.id} data-testid={`card-product-${card.id}`} className="bg-card/50 border-border hover:border-primary/40 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-primary/10">
                    <div className="relative h-40 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                      <BrandCardImage brand={card.brand} categoryName={card.categoryName} imageUrl={card.imageUrl} />
                      <Badge className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground border-none font-bold text-xs">
                        -{card.discountPct}%
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="text-xs text-cyan-400 font-medium">{card.brand}</div>
                      <CardTitle className="text-base line-clamp-1">{card.name}</CardTitle>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-mono font-bold text-cyan-400">${card.sellPrice.toFixed(2)}</span>
                        <span className="text-xs font-mono text-muted-foreground line-through">${card.originalPrice.toFixed(2)}</span>
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Link href={`/gift-card/${card.id}`} className="w-full">
                        <Button size="sm" className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all">
                          View Deal
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {data && data.total > 24 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-border/50"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(data.total / 24)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(data.total / 24)}
                    className="border-border/50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
