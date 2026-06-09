import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogOut, Wallet, User as UserIcon } from "lucide-react";
import logoUrl from "@assets/brand_logo_giftcard_1780765797206.jpeg";

export function Layout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: ["getMe"],
    }
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={logoUrl} 
              alt="Gift Multiverse Logo" 
              className="h-10 w-10 object-cover rounded-lg group-hover:glow-cyan transition-all"
            />
            <span className="font-bold text-xl tracking-tight text-glow-cyan text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">
              GIFT MULTIVERSE
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/browse" className="hover:text-cyan-400 transition-colors">Marketplace</Link>
            <Link href="/sell" className="hover:text-purple-400 transition-colors">Sell Cards</Link>
            <Link href="/blog" className="hover:text-cyan-400 transition-colors">Intel</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <>
                <Link href="/dashboard" className="hidden sm:flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-sm">${user.walletBalance.toFixed(2)}</span>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hover:bg-amber-500/20 hover:text-amber-400 text-muted-foreground">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/20 hover:text-destructive text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:text-cyan-400 hover:bg-cyan-950/50">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    Join Nexus
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 opacity-50 grayscale">
              <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />
              <span className="font-bold">GIFT MULTIVERSE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premier marketplace for digital value exchange. Fast, secure, neon-lit.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Market</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-cyan-400">Browse Cards</Link></li>
              <li><Link href="/sell" className="hover:text-cyan-400">Sell Cards</Link></li>
              <li><Link href="/how-it-works" className="hover:text-cyan-400">How it Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-cyan-400">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-cyan-400">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-cyan-400">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-cyan-400">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-cyan-400">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Gift Multiverse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
