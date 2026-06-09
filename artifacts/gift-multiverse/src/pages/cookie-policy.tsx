import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Cookie className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm mt-1">Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit Gift Multiverse. They help us remember your preferences, keep you logged in, and understand how our platform is used.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Types of Cookies We Use</h2>
          <div className="space-y-4">
            {[
              { name: "Essential Cookies", desc: "Required for the platform to function. These include session tokens, authentication cookies, and security cookies. You cannot opt out of these." },
              { name: "Preference Cookies", desc: "Remember your settings like theme, language, and display preferences to provide a personalized experience." },
              { name: "Analytics Cookies", desc: "Help us understand how visitors interact with our platform, which pages are popular, and where users drop off. All data is anonymized." },
              { name: "Security Cookies", desc: "Used to detect and prevent fraudulent activity, verify your identity, and protect your account." },
            ].map(({ name, desc }) => (
              <div key={name} className="p-4 bg-card/50 border border-border/50 rounded-xl">
                <h3 className="font-semibold text-foreground mb-1">{name}</h3>
                <p className="text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Cookies</h2>
          <p>We may use trusted third-party services that also set cookies. These include analytics providers and fraud prevention services. These parties have their own privacy policies governing the use of such data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Managing Cookies</h2>
          <p>You can control and delete cookies through your browser settings. Note that disabling certain cookies may affect the functionality of Gift Multiverse. Essential cookies cannot be disabled without impacting your ability to use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Updates to This Policy</h2>
          <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes acceptance of the new policy.</p>
        </section>

        <div className="pt-4 border-t border-border/30">
          <p className="text-sm">Questions about our cookie practices? <Link href="/contact" className="text-cyan-400 hover:underline">Contact us</Link>.</p>
        </div>
      </div>
    </div>
  );
}
