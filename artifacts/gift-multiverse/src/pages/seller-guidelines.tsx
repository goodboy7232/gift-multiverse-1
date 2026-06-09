import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, CheckCircle, XCircle, AlertTriangle, DollarSign, Clock, Shield } from "lucide-react";

export default function SellerGuidelines() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Tag className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Guidelines</h1>
          <p className="text-muted-foreground text-sm mt-1">Everything you need to know to sell successfully</p>
        </div>
      </div>

      <div className="space-y-10 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Getting Started</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Tag, label: "Submit", desc: "Fill in card details on the Sell page", color: "text-primary", bg: "bg-primary/10" },
              { icon: Clock, label: "Wait for Review", desc: "Admin team verifies within 24h", color: "text-amber-400", bg: "bg-amber-500/10" },
              { icon: DollarSign, label: "Get Paid", desc: "Wallet credited on approval", color: "text-green-400", bg: "bg-green-500/10" },
            ].map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="text-center p-4 bg-card/50 border border-border/50 rounded-xl">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Accepted Cards</h2>
          <div className="space-y-2">
            {[
              "Gaming: Steam, PlayStation, Xbox, Nintendo, Roblox, and more",
              "Entertainment: Netflix, Spotify, Disney+, Apple TV+, YouTube Premium",
              "Shopping: Amazon, eBay, Target, Walmart, Best Buy, Apple Store",
              "Food & Dining: DoorDash, Uber Eats, Starbucks, McDonald's",
              "Travel: Airbnb, Expedia, Booking.com, Uber, Lyft, Delta",
              "Finance: PayPal, Venmo, Google Play, Cash App, Visa, Mastercard",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Pricing Your Card</h2>
          <div className="bg-card/50 border border-border/50 rounded-xl p-5 space-y-3">
            <p className="text-sm">Set your asking price competitively to maximize your chances of approval and a fast payout. Our platform fee is <strong className="text-foreground">10%</strong> of the approved payout.</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Gaming cards", range: "85-90% of face value" },
                { label: "Entertainment", range: "85-92% of face value" },
                { label: "Shopping", range: "88-93% of face value" },
                { label: "Travel/Finance", range: "88-92% of face value" },
              ].map(({ label, range }) => (
                <div key={label} className="p-3 bg-background/50 rounded-lg">
                  <p className="font-medium text-foreground text-xs mb-1">{label}</p>
                  <p className="text-cyan-400 font-mono text-xs">{range}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Rules & Prohibited Actions</h2>
          <div className="space-y-2">
            {[
              "Do not submit cards that have already been fully or partially used",
              "Do not submit expired cards",
              "Do not submit fraudulently obtained cards",
              "Do not create duplicate listings for the same code",
              "Do not misrepresent the denomination or region of a card",
              "Do not submit someone else's card without their permission",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" /> Consequences of Violations
          </h2>
          <p className="text-sm">Violations of these guidelines may result in rejection of the listing, temporary or permanent suspension of your account, and potential legal action in the case of fraudulent activity.</p>
        </section>

        <div className="pt-4 flex gap-4">
          <Link href="/sell">
            <Button className="bg-primary hover:bg-primary/90">Start Selling</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-border/50">Ask a Question</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
