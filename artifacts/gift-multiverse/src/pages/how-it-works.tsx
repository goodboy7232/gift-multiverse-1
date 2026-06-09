import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Eye, Upload, CheckCircle, DollarSign, Shield, Zap } from "lucide-react";

const buySteps = [
  { icon: Search, title: "Browse the Market", desc: "Explore 100+ discounted gift cards across gaming, streaming, shopping, food, travel, and finance categories." },
  { icon: ShoppingBag, title: "Select & Purchase", desc: "Choose a card, pick your payment method (card or wallet balance), and confirm your purchase in seconds." },
  { icon: Eye, title: "Code Revealed Instantly", desc: "Your gift card code appears immediately after purchase. Copy it and redeem it on the issuer's platform." },
];

const sellSteps = [
  { icon: Upload, title: "Submit Your Card", desc: "Fill in the card title, category, face value, asking price, and the full card code. Submit for review." },
  { icon: CheckCircle, title: "We Verify It", desc: "Our team reviews and verifies the card within 24 hours. We check the balance and confirm it's valid." },
  { icon: DollarSign, title: "Get Paid", desc: "Once approved, your listing goes live. When it sells, 90% of the asking price is credited to your wallet." },
];

export default function HowItWorks() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Works</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Buying and selling gift cards is simple, secure, and instant on Gift Multiverse.
          </p>
        </div>
      </section>

      {/* Buy Flow */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold">Buying a Gift Card</h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-cyan-500/40 to-transparent hidden md:block" />
          <div className="space-y-8">
            {buySteps.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-cyan-950 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/browse">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold">
              Browse Gift Cards
            </Button>
          </Link>
        </div>
      </section>

      <div className="border-t border-border/30" />

      {/* Sell Flow */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Selling a Gift Card</h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary/40 to-transparent hidden md:block" />
          <div className="space-y-8">
            {sellSteps.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/sell">
            <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 font-bold">
              Sell a Card
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-card/20 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Built on Trust</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Manual Verification", desc: "Every card is reviewed by a human before going live. No automated listing." },
              { icon: Zap, title: "Instant Payouts", desc: "Proceeds go directly to your wallet the moment your card sells." },
              { icon: CheckCircle, title: "Buyer Protection", desc: "Invalid card? We'll refund or replace it. Zero risk to buyers." },
              { icon: DollarSign, title: "Transparent Fees", desc: "Sellers pay 10%. Buyers pay exactly the listed price. No surprises." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 bg-card/30 border border-border/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
