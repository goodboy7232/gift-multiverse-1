import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users, DollarSign, Share2, Star, Zap } from "lucide-react";

export default function Affiliate() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Hero */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-3xl pointer-events-none" />
        <div className="relative py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Earn with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Affiliate Program</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Refer users to Gift Multiverse and earn a commission on every transaction they make. The more you refer, the more you earn.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            Apply to Join
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        {[
          { value: "5%", label: "Base Commission", icon: DollarSign, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { value: "30 days", label: "Cookie Window", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
          { value: "Instant", label: "Wallet Credits", icon: Star, color: "text-green-400", bg: "bg-green-500/10" },
        ].map(({ value, label, icon: Icon, color, bg }) => (
          <div key={label} className="text-center p-6 bg-card/50 border border-border/50 rounded-xl">
            <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <p className={`text-3xl font-mono font-bold ${color} mb-1`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", icon: Users, title: "Apply & Get Link", desc: "Submit your affiliate application. Upon approval you'll receive a unique referral link to share anywhere." },
            { step: "02", icon: Share2, title: "Share & Refer", desc: "Share your link on social media, YouTube, blogs, Discord servers, or anywhere your audience hangs out." },
            { step: "03", icon: DollarSign, title: "Earn Commissions", desc: "Earn 5% on every purchase made by users who signed up through your link within the 30-day cookie window." },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative p-6 bg-card/50 border border-border/50 rounded-xl">
              <span className="absolute top-4 right-4 text-4xl font-mono font-bold text-primary/10">{step}</span>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Tiers */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Commission Tiers</h2>
        <div className="space-y-3">
          {[
            { tier: "Starter", refs: "1–10 referrals/month", rate: "5%", color: "border-border/50" },
            { tier: "Silver", refs: "11–50 referrals/month", rate: "7%", color: "border-cyan-500/30 bg-cyan-500/5" },
            { tier: "Gold", refs: "51–200 referrals/month", rate: "10%", color: "border-primary/30 bg-primary/5" },
            { tier: "Elite", refs: "200+ referrals/month", rate: "15%", color: "border-amber-500/30 bg-amber-500/5" },
          ].map(({ tier, refs, rate, color }) => (
            <div key={tier} className={`flex items-center justify-between p-5 rounded-xl border ${color}`}>
              <div>
                <p className="font-semibold">{tier}</p>
                <p className="text-sm text-muted-foreground">{refs}</p>
              </div>
              <p className="text-2xl font-mono font-bold text-primary">{rate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20 rounded-2xl">
        <h2 className="text-2xl font-bold mb-3">Ready to Start Earning?</h2>
        <p className="text-muted-foreground mb-6">Join the Gift Multiverse affiliate program and turn your audience into income.</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold">Apply Now</Button>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-border/50">Contact Us</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
