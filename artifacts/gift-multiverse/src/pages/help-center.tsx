import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ChevronDown, ChevronUp, ShoppingBag, Tag, Wallet, Shield, User, HelpCircle } from "lucide-react";

const categories = [
  {
    icon: ShoppingBag,
    label: "Buying",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    faqs: [
      { q: "How do I buy a gift card?", a: "Browse the marketplace, click on a card you want, then click 'Buy Now'. You'll confirm the purchase and the gift card code will be revealed instantly." },
      { q: "Is my purchase instant?", a: "Yes! Digital gift card codes are delivered immediately after purchase confirmation. No waiting periods." },
      { q: "What payment methods are accepted?", a: "You can pay using your wallet balance. Top up your wallet via bank transfer or USDT." },
      { q: "What if a code doesn't work?", a: "Contact our support team within 24 hours of purchase with proof that the code is invalid, and we'll resolve it promptly." },
      { q: "Can I get a refund?", a: "Refunds are handled case-by-case. See our Refund Policy for full details. Digital goods are generally non-refundable once a code is revealed." },
    ],
  },
  {
    icon: Tag,
    label: "Selling",
    color: "text-primary",
    bg: "bg-primary/10",
    faqs: [
      { q: "How do I sell a gift card?", a: "Go to the Sell page, fill in your card details including the brand, face value, asking price, and voucher code. Our team reviews within 24 hours." },
      { q: "How long does review take?", a: "Our admin team typically reviews sell requests within 24 hours. You'll see your listing status update in My Listings." },
      { q: "What's the platform fee?", a: "Gift Multiverse charges a 10% platform fee on the final sale price. Your wallet is credited with 90% of the approved payout." },
      { q: "What cards can I sell?", a: "We accept most major gift card brands — gaming, entertainment, shopping, travel, food, and finance. Physical cards are supported but take longer to verify." },
      { q: "Is my voucher code safe?", a: "Yes. Your code is encrypted and stored securely. It is only revealed to a buyer after your listing is approved and payment is confirmed." },
    ],
  },
  {
    icon: Wallet,
    label: "Wallet",
    color: "text-green-400",
    bg: "bg-green-500/10",
    faqs: [
      { q: "How do I add funds to my wallet?", a: "Contact our support team or use the wallet top-up options available in your account. We accept bank transfers and USDT." },
      { q: "When does my wallet get credited after a sale?", a: "Your wallet is credited automatically once an admin approves your sell request and sets the payout amount." },
      { q: "Can I withdraw my wallet balance?", a: "Wallet withdrawals are processed manually. Contact support with your preferred withdrawal method." },
      { q: "Is there a minimum balance?", a: "There is no minimum balance requirement. You can hold any amount in your wallet." },
    ],
  },
  {
    icon: User,
    label: "Account",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    faqs: [
      { q: "How do I reset my password?", a: "Go to the Reset Password page and enter your username and your Safe Key — the unique key you received when registering." },
      { q: "What is a Safe Key?", a: "Your Safe Key is a unique security code generated when you register. It's shown once and is required to reset your password. Store it safely!" },
      { q: "Can I change my username?", a: "Username changes are not currently supported. Contact support for special cases." },
      { q: "How do I contact support?", a: "Use the Contact page to send us a message. We respond within 24 hours on business days." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const filtered = categories[activeCategory].faqs.filter(
    (f) => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Help Center</h1>
        <p className="text-muted-foreground text-lg">Find answers to common questions</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles..."
          className="pl-12 h-12 bg-card/50 border-border/50 text-base"
        />
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-8">
        {categories.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => { setActiveCategory(i); setSearch(""); }}
            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${activeCategory === i ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
          >
            <cat.icon className={`h-4 w-4 ${activeCategory === i ? "text-primary" : cat.color}`} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">{categories[activeCategory].label} Questions</h2>
        {filtered.length > 0 ? (
          filtered.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)
        ) : (
          <p className="text-muted-foreground text-sm py-8 text-center">No results for "{search}"</p>
        )}
      </div>

      <div className="mt-10 text-center p-8 bg-card/30 border border-border/30 rounded-2xl">
        <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
        <p className="text-muted-foreground text-sm mb-4">Our support team is ready to assist you</p>
        <Link href="/contact">
          <Button className="bg-primary hover:bg-primary/90">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
}
