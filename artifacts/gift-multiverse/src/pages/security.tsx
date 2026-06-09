import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle } from "lucide-react";

export default function Security() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Security Center</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">Gift Multiverse is built with security-first principles. Here's how we protect your account and transactions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {[
          { icon: Lock, title: "Encrypted Accounts", color: "text-primary", bg: "bg-primary/10", desc: "All passwords are hashed using bcrypt with 12 rounds. We never store plaintext passwords. Your Safe Key provides an additional recovery layer that only you possess." },
          { icon: Eye, title: "Safe Key System", color: "text-cyan-400", bg: "bg-cyan-500/10", desc: "Every account is issued a unique Safe Key upon registration — shown only once. This key is required to reset your password, ensuring only you can recover your account." },
          { icon: Shield, title: "JWT Authentication", color: "text-green-400", bg: "bg-green-500/10", desc: "All API requests are authenticated using signed JWT tokens with short expiry windows. Tokens are stored securely and never exposed in URLs or logs." },
          { icon: AlertTriangle, title: "Fraud Prevention", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Our admin team manually reviews every sell request before a card goes live. This human verification step prevents fraudulent or already-used cards from reaching buyers." },
        ].map(({ icon: Icon, title, color, bg, desc }) => (
          <div key={title} className="p-6 bg-card/50 border border-border/50 rounded-xl">
            <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card/50 border border-border/50 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Security Best Practices</h2>
        <div className="space-y-4">
          {[
            "Store your Safe Key in a secure location — it cannot be recovered if lost.",
            "Use a unique, strong password for your Gift Multiverse account.",
            "Never share your account credentials or Safe Key with anyone.",
            "Log out from shared devices after use.",
            "Contact support immediately if you notice unauthorized activity.",
            "Be wary of phishing — we will never ask for your Safe Key via email.",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Report a Vulnerability
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          If you discover a security vulnerability in Gift Multiverse, please report it responsibly. We take all reports seriously and will respond within 48 hours.
        </p>
        <Link href="/contact">
          <Button className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20">
            Report a Security Issue
          </Button>
        </Link>
      </div>
    </div>
  );
}
