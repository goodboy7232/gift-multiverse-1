import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Globe, Users } from "lucide-react";
import logoUrl from "@assets/brand_logo_giftcard_1780765797206.jpeg";

export default function About() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <img src={logoUrl} alt="Gift Multiverse" className="h-20 w-20 mx-auto rounded-2xl mb-6 ring-2 ring-primary/20 shadow-[0_0_40px_rgba(168,85,247,0.2)]" />
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Gift Multiverse</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The premier peer-to-peer marketplace for digital gift cards. We connect buyers who want to save with sellers who want to convert unused value into cash.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-card/20 border-y border-border/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe digital value should flow freely. Every unused gift card is wasted potential — and every buyer deserves a fair price. Gift Multiverse creates a trusted, verified marketplace where both sides win.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Shield, color: "text-green-400", bg: "bg-green-500/10", title: "Trust & Safety", desc: "Every listing is manually verified before it goes live. Zero tolerance for fraud." },
            { icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10", title: "Instant Delivery", desc: "Codes delivered immediately after purchase. No waiting, no friction." },
            { icon: Globe, color: "text-primary", bg: "bg-primary/10", title: "Global Reach", desc: "Cards for platforms used around the world. Gaming, streaming, shopping." },
            { icon: Users, color: "text-amber-400", bg: "bg-amber-500/10", title: "Community First", desc: "Buyers and sellers treated equally. Fair fees, transparent policies." },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="text-center p-6 bg-card/30 border border-border/30 rounded-2xl">
              <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="py-16 bg-card/20 border-y border-border/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { label: "Cards Listed", value: "100+" },
              { label: "Categories", value: "6" },
              { label: "Happy Traders", value: "1,000+" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">{value}</p>
                <p className="text-muted-foreground mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
        <p className="text-muted-foreground mb-8">Join the multiverse. Buy at a discount, sell for cash.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/browse"><Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold">Browse Cards</Button></Link>
          <Link href="/register"><Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">Create Account</Button></Link>
        </div>
      </section>
    </div>
  );
}
