import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";

import { Layout } from "./components/layout";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

const Browse = lazy(() => import("@/pages/browse"));
const GiftCard = lazy(() => import("@/pages/gift-card"));
const Sell = lazy(() => import("@/pages/sell"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Orders = lazy(() => import("@/pages/orders"));
const MyListings = lazy(() => import("@/pages/my-listings"));
const Wallet = lazy(() => import("@/pages/wallet"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const About = lazy(() => import("@/pages/about"));
const FAQ = lazy(() => import("@/pages/faq"));
const HowItWorks = lazy(() => import("@/pages/how-it-works"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Contact = lazy(() => import("@/pages/contact"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const Security = lazy(() => import("@/pages/security"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const Affiliate = lazy(() => import("@/pages/affiliate"));
const RefundPolicy = lazy(() => import("@/pages/refund-policy"));
const SellerGuidelines = lazy(() => import("@/pages/seller-guidelines"));
const BuyerProtection = lazy(() => import("@/pages/buyer-protection"));
const Sitemap = lazy(() => import("@/pages/sitemap"));
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminSellRequests = lazy(() => import("@/pages/admin/sell-requests"));
const AdminGiftCards = lazy(() => import("@/pages/admin/gift-cards"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminBlog = lazy(() => import("@/pages/admin/blog"));
const AdminUserDetail = lazy(() => import("@/pages/admin/user-detail"));
const AdminPaymentInfo = lazy(() => import("@/pages/admin/payment-info"));
const Payment = lazy(() => import("@/pages/payment"));
const Checkout = lazy(() => import("@/pages/checkout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AppSetup() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "")}>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/reset-password" component={ResetPassword} />
              <Route path="/browse" component={Browse} />
              <Route path="/gift-card/:id" component={GiftCard} />
              <Route path="/sell" component={Sell} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/orders" component={Orders} />
              <Route path="/my-listings" component={MyListings} />
              <Route path="/wallet" component={Wallet} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={BlogPost} />
              <Route path="/about" component={About} />
              <Route path="/faq" component={FAQ} />
              <Route path="/how-it-works" component={HowItWorks} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/privacy-policy" component={Privacy} />
              <Route path="/contact" component={Contact} />
              <Route path="/cookie-policy" component={CookiePolicy} />
              <Route path="/security" component={Security} />
              <Route path="/help-center" component={HelpCenter} />
              <Route path="/affiliate" component={Affiliate} />
              <Route path="/refund-policy" component={RefundPolicy} />
              <Route path="/seller-guidelines" component={SellerGuidelines} />
              <Route path="/buyer-protection" component={BuyerProtection} />
              <Route path="/sitemap" component={Sitemap} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/orders" component={AdminOrders} />
              <Route path="/admin/sell-requests" component={AdminSellRequests} />
              <Route path="/admin/gift-cards" component={AdminGiftCards} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/blog" component={AdminBlog} />
              <Route path="/admin/users/:id" component={AdminUserDetail} />
              <Route path="/admin/payment-info" component={AdminPaymentInfo} />
              <Route path="/payment/:orderId" component={Payment} />
              <Route path="/checkout/:giftCardId" component={Checkout} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </Layout>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSetup />
    </QueryClientProvider>
  );
}

export default App;
