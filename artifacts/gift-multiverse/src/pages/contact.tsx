import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Clock, Shield } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast({ title: "Message sent! We'll get back to you within 24 hours." });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Touch</span>
        </h1>
        <p className="text-muted-foreground">Have a question, problem, or feedback? We're here to help.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-8">
          {[
            {
              icon: Clock,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              title: "Response Time",
              desc: "We typically respond within 24 hours on business days.",
            },
            {
              icon: Shield,
              color: "text-green-400",
              bg: "bg-green-500/10",
              title: "Buyer Protection",
              desc: "Got an invalid card? Report it here and we'll make it right.",
            },
            {
              icon: MessageSquare,
              color: "text-primary",
              bg: "bg-primary/10",
              title: "General Inquiries",
              desc: "Questions about your account, listings, or our policies.",
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 p-5 bg-card/30 border border-border/30 rounded-xl">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" /> Direct Email
            </h3>
            <p className="text-muted-foreground text-sm">support@giftmultiverse.io</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card/50 border border-border/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input data-testid="input-name" placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Username (optional)</label>
              <Input data-testid="input-username" placeholder="Your Gift Multiverse username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input data-testid="input-subject" placeholder="What's this about?" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                data-testid="input-message"
                placeholder="Describe your issue or question in detail..."
                className="min-h-[140px]"
                required
              />
            </div>
            <Button
              data-testid="button-submit"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
