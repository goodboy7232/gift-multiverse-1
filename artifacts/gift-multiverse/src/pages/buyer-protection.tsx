import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, CheckCircle, Eye, Lock, Zap, HeartHandshake } from "lucide-react";

export default function BuyerProtection() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Buyer <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Protection</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Every purchase on Gift Multiverse is backed by our comprehensive buyer protection guarantee. Buy with complete confidence.
        </p>
      </div>

      {/* Guarantees */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        {[
          {
            icon: Eye,
            title: "Human Verification",
            color: "text-primary",
            bg: "bg-primary/10",
            desc: "Every sell request is manually reviewed by our admin team before a card goes live. We verify authenticity before any card is listed for purchase.",
          },
          {
            icon: Lock,
            title: "Code Security",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            desc: "Gift card codes are encrypted at rest and only decrypted at the moment of purchase. Your code is never exposed until payment is confirmed.",
          },
          {
            icon: Zap,
            title: "Instant Delivery",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            desc: "Codes are delivered instantly after purchase. No waiting for manual processing — you get your code the moment your payment is confirmed.",
          },
          {
            icon: HeartHandshake,
            title: "Invalid Code Guarantee",
            color: "text-green-400",
            bg: "bg-green-500/10",
            desc: "If you receive an already-used or invalid code, contact us within 24 hours with evidence and we'll issue a full wallet credit — no questions asked.",
          },
        ].map(({ icon: Icon, title, color, bg, desc }) => (
          <div key={title} className="p-6 bg-card/50 border border-border/50 rounded-xl hover:border-green-500/20 transition-colors">
            <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* What's Covered */}
      <div className="bg-card/50 border border-border/50 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">What's Covered</h2>
        <div className="space-y-3">
          {[
            "Card code is invalid or already redeemed",
            "Wrong denomination delivered vs. what was listed",
            "Payment charged but no code received",
            "Technical error during code delivery",
            "Card redeemed for wrong region despite listing not mentioning restrictions",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Claim */}
      <div className="bg-gradient-to-br from-green-500/5 to-cyan-500/5 border border-green-500/20 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">How to File a Protection Claim</h2>
        <ol className="space-y-3">
          {[
            "Contact Gift Multiverse support within 24 hours of purchase",
            "Provide your Order ID",
            "Share a screenshot showing the error or invalid code message",
            "Our team will review within 48 hours",
            "If approved, wallet credit is issued immediately",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <Link href="/contact">
            <Button className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20">
              File a Claim
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
