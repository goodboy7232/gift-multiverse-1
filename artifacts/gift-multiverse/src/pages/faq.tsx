import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem { q: string; a: string }
interface FaqGroup { group: string; items: FaqItem[] }

const faqGroups: FaqGroup[] = [
  {
    group: "Buying Gift Cards",
    items: [
      { q: "How do I buy a gift card?", a: "Browse the Marketplace, select the card you want, and click 'Buy Now'. After placing your order, send your payment via Bank Transfer or USDT and note the reference. Our admin team verifies and confirms the payment, after which your gift card code is revealed in your Orders page." },
      { q: "What payment methods do you accept?", a: "We currently accept Bank Transfer and USDT (Tether). You provide the payment reference or transaction hash when submitting your order. Once we verify it, your order is marked complete." },
      { q: "How long does it take to receive my gift card code?", a: "Most orders are confirmed within a few minutes to a few hours during business hours. After admin verification of your payment, the code appears instantly on your Orders page." },
      { q: "Are all gift cards verified?", a: "Yes. Our admin team manually checks every card submitted by sellers before it appears in the marketplace. We verify the balance and validity before approving any listing." },
      { q: "Can I buy multiple cards at once?", a: "Yes — you can specify a quantity when adding to your order, up to the available stock. Each card denomination is priced separately." },
      { q: "What happens if a card I bought doesn't work?", a: "Contact our support team via the Contact page. Our Buyer Protection policy means that if a code is invalid or already used, we will issue a replacement or a full refund to your wallet." },
      { q: "Are there any buying fees?", a: "No hidden fees for buyers. You pay the listed sell price and nothing more. The discount you see is your saving versus the original face value." },
      { q: "Can I buy gift cards from India-based brands?", a: "Yes! We carry popular Indian brands including Zomato, Swiggy, Flipkart, Myntra, and more in our Food & Dining and Shopping categories." },
    ],
  },
  {
    group: "Selling Gift Cards",
    items: [
      { q: "How do I sell a gift card?", a: "Go to 'Sell Cards', fill in your card details (brand, website, denomination, asking price, voucher code), and submit for admin review. Our team verifies the card within 24 hours. Once approved, the payout is credited to your Nexus wallet." },
      { q: "What brands can I sell?", a: "We accept most major gift cards — gaming (Steam, Xbox, PlayStation), streaming (Netflix, Spotify, Disney+), shopping (Amazon, Flipkart, Myntra), food delivery (Zomato, Swiggy, DoorDash), travel, and finance cards." },
      { q: "How is my payout calculated?", a: "You set your asking price when you submit. Our admin reviews and may propose an adjusted payout based on market rates. You'll see the final approved payout in your My Listings page before proceeds hit your wallet." },
      { q: "How long does the review process take?", a: "Typically within 24 hours. High-demand brands are often reviewed within a few hours." },
      { q: "What is the seller platform fee?", a: "We retain 10% of the approved payout to cover verification, secure storage, and processing. For example, if your card is approved for $20.00, $18.00 is credited to your wallet." },
      { q: "Can I cancel a submission before it's approved?", a: "Yes — contact support before approval and we can cancel the review. Once a card is approved and listed, cancellation is not possible as the code has been committed to the marketplace." },
      { q: "When will my wallet be credited?", a: "Immediately upon admin approval of your sell request. Funds appear in your Nexus wallet and can be used to purchase other cards right away." },
    ],
  },
  {
    group: "Account & Security",
    items: [
      { q: "What is the Safe Key?", a: "Your Safe Key is a unique 16-character code generated when you register. It is shown only once — store it securely. You'll need it to reset your password if you forget it. It cannot be recovered, so save it in a password manager." },
      { q: "How do I reset my password?", a: "Go to the Login page and click 'Forgot password? Use your safe key'. Enter your username and Safe Key to verify your identity, then set a new password." },
      { q: "Can I have multiple accounts?", a: "No. One account per person is permitted. Creating multiple accounts to exploit the platform violates our Terms of Service and will result in all accounts being permanently suspended." },
      { q: "Is my personal information safe?", a: "We do not collect personally identifiable information beyond your username. We do not store credit card numbers. All sensitive data is encrypted at rest and in transit." },
      { q: "How do I contact support?", a: "Use the Contact page to send us a message. We aim to respond within 24 hours on business days." },
      { q: "What should I do if I suspect unauthorized access?", a: "Immediately change your password using your Safe Key. Then contact support so we can investigate and lock down your account if needed." },
    ],
  },
  {
    group: "Wallet & Payments",
    items: [
      { q: "What is the Nexus Wallet?", a: "Your Nexus Wallet holds your Gift Multiverse balance. It is credited when your sell requests are approved and debited when you complete a purchase using wallet balance." },
      { q: "How do I use my wallet balance?", a: "Wallet balance is applied automatically when purchasing. If your wallet has sufficient balance, it reduces or covers the order total. Partial wallet payments are not currently supported — the full amount must come from one source." },
      { q: "Can I withdraw my wallet balance?", a: "Wallet withdrawals are processed by admin request. Contact support with your preferred payout method (Bank Transfer or USDT). Minimum withdrawal is $10." },
      { q: "Are there transaction fees for wallet payouts?", a: "Withdrawals via USDT are free. Bank transfer withdrawals may incur a small processing fee depending on your region." },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(null);

  const allItems = faqGroups.flatMap((g, gi) => g.items.map((item, ii) => ({ ...item, key: `${gi}-${ii}`, group: g.group })));

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Frequently Asked{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Questions</span>
        </h1>
        <p className="text-muted-foreground">Everything you need to know about Gift Multiverse</p>
        <p className="text-sm text-muted-foreground mt-1">{allItems.length} questions across {faqGroups.length} categories</p>
      </div>

      <div className="space-y-10">
        {faqGroups.map((group, gi) => (
          <div key={gi}>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              {group.group}
            </h2>
            <div className="space-y-2">
              {group.items.map((faq, ii) => {
                const key = `${gi}-${ii}`;
                return (
                  <div
                    key={key}
                    className={`border rounded-xl overflow-hidden transition-colors ${open === key ? "border-primary/30 bg-card/60" : "border-border/50 bg-card/30 hover:border-border"}`}
                  >
                    <button
                      data-testid={`faq-question-${gi * 10 + ii}`}
                      className="w-full flex items-center justify-between p-5 text-left gap-4"
                      onClick={() => setOpen(open === key ? null : key)}
                    >
                      <span className="font-medium">{faq.q}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${open === key ? "rotate-180 text-primary" : ""}`}
                      />
                    </button>
                    {open === key && (
                      <div className="px-5 pb-5">
                        <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
