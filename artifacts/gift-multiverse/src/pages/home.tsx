import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetFeaturedGiftCards, useGetCategories, useGetBlogPosts } from "@workspace/api-client-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, Zap, Shield, Wallet, CheckCircle, Clock,
  Globe, Users, TrendingUp, Lock, CreditCard, BookOpen, Mail
} from "lucide-react";
import { useState } from "react";
import BrandCardImage from "@/components/BrandCardImage";

const BUY_STEPS = [
  {
    num: "01",
    icon: Globe,
    title: "Browse & Choose",
    desc: "Pick any gift card from 100+ listings across gaming, streaming, food, shopping, and travel — all discounted.",
  },
  {
    num: "02",
    icon: CreditCard,
    title: "Buy & Pay",
    desc: "Place your order and send payment via Bank Transfer or USDT. Our team manually verifies every transaction.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Receive Code",
    desc: "Once confirmed, your verified gift card code is unlocked in your Orders dashboard — ready to redeem instantly.",
  },
];

const SELL_STEPS = [
  {
    num: "01",
    icon: CreditCard,
    title: "List Your Card",
    desc: "Submit your gift card details, face value, voucher code, and asking price through our simple form.",
  },
  {
    num: "02",
    icon: Shield,
    title: "We Verify",
    desc: "Our team reviews your submission and authenticates the code before it goes live on the marketplace.",
  },
  {
    num: "03",
    icon: Wallet,
    title: "Get Paid",
    desc: "Once approved, your wallet is credited with the agreed payout. Withdraw or use to buy more cards.",
  },
];

const STATS = [
  { value: "100+", label: "Gift Cards Listed", icon: CreditCard },
  { value: "6", label: "Product Categories", icon: Globe },
  { value: "24h", label: "Avg. Order Fulfillment", icon: Clock },
  { value: "100%", label: "Seller Verification", icon: Shield },
];

export default function Home() {
  const { data: featuredCards, isLoading: isLoadingCards } = useGetFeaturedGiftCards();
  const { data: categories } = useGetCategories();
  const { data: blogPosts } = useGetBlogPosts({ limit: 3 });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="w-full">

      {/* ── Section 1: Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 lg:py-32 flex items-center justify-center min-h-[80vh]">
        <div
          className="absolute inset-0 bg-center bg-cover pointer-events-none"
          style={{ backgroundImage: "url('/hero-cyberpunk.png')" }}
        />
        <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="container px-4 relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1">
            <Zap className="w-4 h-4 mr-2" /> Live Market Active
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Trade Gift Cards Across the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Multiverse
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The premier neon-lit bazaar for gift cards. Buy at a discount, sell for cash.
            Verified codes, USDT &amp; bank payments, admin-confirmed fulfillment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold">
                Explore Market <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10">
                Sell a Card
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2: Browse by Category ─────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-card/30 border-y border-border/30">
          <div className="container px-4">
            <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">
              Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Category</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/browse?categoryId=${cat.id}`}>
                  <div className="p-4 bg-background border border-border/50 rounded-xl text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(cat.subcategories?.length ?? 0)} brands</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Key Features ───────────────────────────────────── */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Why the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Multiverse</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Admin-Confirmed Delivery</h3>
              <p className="text-muted-foreground">Gift card codes unlocked immediately after our team verifies your payment — no extra delays.</p>
            </div>
            <div className="space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Verified Sellers</h3>
              <p className="text-muted-foreground">Every sell request is manually reviewed. Codes are authenticated before any listing goes live on the grid.</p>
            </div>
            <div className="space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Nexus Wallet</h3>
              <p className="text-muted-foreground">Hold balance in your secure nexus wallet. Credit from sell payouts, spend on your next purchase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Hot Deals (Featured Cards) ─────────────────────── */}
      <section className="py-24 bg-card/20 border-t border-border/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Hot Deals</h2>
              <p className="text-muted-foreground mt-2">Highest discounts currently on the grid</p>
            </div>
            <Link href="/browse">
              <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingCards ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="bg-card overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))
            ) : featuredCards?.map((card) => (
              <Card key={card.id} className="bg-card/50 backdrop-blur-sm border-border hover:border-cyan-500/50 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-cyan-500/10">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                  <BrandCardImage brand={card.brand} categoryName={card.categoryName} />
                  <Badge className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground border-none font-bold">
                    -{card.discountPct}%
                  </Badge>
                </div>
                <CardHeader className="relative z-20 -mt-6">
                  <div className="text-xs text-cyan-400 font-medium mb-1">{card.brand}</div>
                  <CardTitle className="line-clamp-1 text-base">{card.name}</CardTitle>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-mono font-bold text-cyan-400">${Number(card.sellPrice).toFixed(2)}</span>
                    <span className="text-sm font-mono text-muted-foreground line-through">${Number(card.originalPrice).toFixed(2)}</span>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Link href={`/gift-card/${card.id}`} className="w-full">
                    <Button className="w-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground border border-secondary/20">
                      Acquire
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: How It Works ───────────────────────────────────── */}
      <section className="py-24 border-y border-border/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're buying or selling, the process is simple and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Buy side */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-cyan-400">Buy a Card</h3>
              </div>
              <div className="space-y-6">
                {BUY_STEPS.map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/browse" className="inline-block mt-8">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold">
                  Start Buying <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Sell side */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary">Sell a Card</h3>
              </div>
              <div className="space-y-6">
                {SELL_STEPS.map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/sell" className="inline-block mt-8">
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 font-bold">
                  Start Selling <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Trust Stats ─────────────────────────────────────── */}
      <section className="py-10 border-b border-border/50 bg-card/20">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
                <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Intel Feed (Blog Preview) ─────────────────────── */}
      <section className="py-24 bg-card/20 border-t border-border/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-mono tracking-widest uppercase">Intel Feed</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Latest from the Grid</h2>
              <p className="text-muted-foreground mt-2">Strategies, guides, and market insights for the smart trader</p>
            </div>
            <Link href="/blog">
              <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                All Posts <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts?.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group p-6 bg-background border border-border/50 rounded-2xl hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col">
                  <div
                    className="h-32 rounded-xl mb-4 flex items-center justify-center"
                    style={{ background: post.coverColor ? `linear-gradient(135deg, ${post.coverColor}33, ${post.coverColor}11)` : "linear-gradient(135deg, #1a0533, #0a1628)" }}
                  >
                    <BookOpen className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
            {!blogPosts && Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 bg-background border border-border/50 rounded-2xl space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Newsletter CTA ─────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/15 via-background to-background pointer-events-none" />
        <div className="container px-4 relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3 text-cyan-400">
            <Mail className="w-6 h-6" />
            <span className="text-sm font-mono tracking-widest uppercase">Stay in the Loop</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Never Miss a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Hot Deal</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get notified about new listings, flash discounts, and market intelligence delivered to your inbox.
            No spam — just signal.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">You're on the list. Welcome to the multiverse.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-card border-border/50 focus:border-primary/50"
              />
              <Button
                className="bg-primary hover:bg-primary/90 font-bold shrink-0"
                onClick={() => { if (email) setSubscribed(true); }}
                disabled={!email}
              >
                Join the Grid
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-6 justify-center pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-400" /> No spam, ever</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Join 2,400+ traders</span>
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan-400" /> Weekly market intel</span>
          </div>
        </div>
      </section>

    </div>
  );
}
