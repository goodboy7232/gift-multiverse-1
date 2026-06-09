import { Link } from "wouter";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
          <p className="text-muted-foreground text-sm mt-1">Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-400">Digital goods are inherently non-returnable once delivered. Please read this policy carefully before purchasing.</p>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Eligible Refund Scenarios</h2>
          <div className="space-y-3">
            {[
              "The gift card code delivered was already used or invalid",
              "You were charged but did not receive a code",
              "The code does not match the product description (wrong denomination or region)",
              "A technical error prevented the code from being delivered",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Non-Eligible Scenarios</h2>
          <div className="space-y-3">
            {[
              "You revealed the code and then changed your mind",
              "The code was valid but you were unable to redeem it due to regional restrictions not disclosed in the listing",
              "You purchased the wrong denomination or product",
              "The issuer's platform was down at the time of redemption",
              "More than 24 hours have passed since the purchase without reporting an issue",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">How to Request a Refund</h2>
          <ol className="space-y-3 list-decimal list-inside">
            {[
              "Contact us within 24 hours of purchase via the Contact page.",
              "Include your Order ID and a description of the issue.",
              "Provide evidence — screenshot of the error when attempting to redeem the code.",
              "Our team will review your request and respond within 48 hours.",
              "If approved, a wallet credit equal to the purchase amount will be applied.",
            ].map((step, i) => (
              <li key={i} className="text-sm">{step}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Refund Method</h2>
          <p>Approved refunds are issued as wallet balance credits. We do not process refunds to original payment methods. Wallet credits can be used for any future purchase on Gift Multiverse.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Seller Disputes</h2>
          <p>If a buyer files a valid refund claim against a card you sold, the payout for that card may be reversed or withheld. We encourage sellers to only submit valid, unused cards.</p>
        </section>

        <div className="pt-4 border-t border-border/30">
          <p className="text-sm">Have a question about a refund? <Link href="/contact" className="text-cyan-400 hover:underline">Contact our support team</Link>.</p>
        </div>
      </div>
    </div>
  );
}
