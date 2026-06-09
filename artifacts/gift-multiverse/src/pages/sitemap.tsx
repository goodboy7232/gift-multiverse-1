import { Link } from "wouter";
import { ArrowLeft, Map, ShoppingBag, Tag, User, FileText, Info, HelpCircle } from "lucide-react";

const sections = [
  {
    icon: ShoppingBag,
    label: "Marketplace",
    color: "text-cyan-400",
    links: [
      { href: "/", label: "Home" },
      { href: "/browse", label: "Browse Gift Cards" },
      { href: "/sell", label: "Sell a Card" },
      { href: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    icon: User,
    label: "Account",
    color: "text-primary",
    links: [
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Register" },
      { href: "/reset-password", label: "Reset Password" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/orders", label: "Order History" },
      { href: "/my-listings", label: "My Listings" },
      { href: "/wallet", label: "Wallet" },
    ],
  },
  {
    icon: FileText,
    label: "Intel Feed",
    color: "text-green-400",
    links: [
      { href: "/blog", label: "All Posts" },
      { href: "/blog/maximize-gift-card-savings-2025", label: "Maximize Your Savings" },
      { href: "/blog/selling-gift-cards-online-safely", label: "Selling Safely" },
      { href: "/blog/top-10-gift-cards-for-gamers", label: "Top Gaming Cards" },
      { href: "/blog/streaming-gift-cards-comparison", label: "Streaming Comparison" },
      { href: "/blog/travel-hacks-gift-cards", label: "Travel Hacks" },
      { href: "/blog/gift-card-safety-checklist", label: "Safety Checklist" },
    ],
  },
  {
    icon: Info,
    label: "Company",
    color: "text-amber-400",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/affiliate", label: "Affiliate Program" },
    ],
  },
  {
    icon: HelpCircle,
    label: "Help & Legal",
    color: "text-purple-400",
    links: [
      { href: "/help-center", label: "Help Center" },
      { href: "/faq", label: "FAQ" },
      { href: "/buyer-protection", label: "Buyer Protection" },
      { href: "/seller-guidelines", label: "Seller Guidelines" },
      { href: "/refund-policy", label: "Refund Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" },
      { href: "/security", label: "Security Center" },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sitemap</h1>
          <p className="text-muted-foreground text-sm mt-1">All pages on Gift Multiverse</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map(({ icon: Icon, label, color, links }) => (
          <div key={label}>
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`h-5 w-5 ${color}`} />
              <h2 className={`font-semibold ${color}`}>{label}</h2>
            </div>
            <ul className="space-y-2">
              {links.map(({ href, label: linkLabel }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                    {linkLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
