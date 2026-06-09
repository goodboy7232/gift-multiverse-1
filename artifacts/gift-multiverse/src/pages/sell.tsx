import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateSellRequest, getGetUserSellRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Upload, DollarSign, Shield, Clock, TrendingUp } from "lucide-react";

const schema = z.object({
  brand: z.string().min(2, "Brand name must be at least 2 characters"),
  websiteUrl: z.string().url("Please enter a valid URL (e.g. https://store.steampowered.com)"),
  cardFaceValue: z.coerce.number().min(1, "Face value must be at least $1"),
  askingPrice: z.coerce.number().min(1, "Asking price must be at least $1"),
  voucherCode: z.string().min(4, "Voucher code must be at least 4 characters"),
  cardType: z.enum(["digital", "physical"]),
  extraDetails: z.string().optional(),
}).refine((d) => d.askingPrice <= d.cardFaceValue, {
  message: "Asking price cannot exceed face value",
  path: ["askingPrice"],
});

type FormData = z.infer<typeof schema>;

export default function Sell() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: "",
      websiteUrl: "",
      cardFaceValue: 0,
      askingPrice: 0,
      voucherCode: "",
      cardType: "digital",
      extraDetails: "",
    },
  });

  const sellMutation = useCreateSellRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Listing submitted! Our team will review it within 24 hours." });
        queryClient.invalidateQueries({ queryKey: getGetUserSellRequestsQueryKey() });
        setLocation("/my-listings");
      },
      onError: (err: any) => {
        toast({
          title: "Submission failed",
          description: err?.data?.message ?? "Something went wrong",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (values: FormData) => {
    if (!token) {
      setLocation("/login");
      return;
    }
    sellMutation.mutate({
      data: {
        brand: values.brand,
        websiteUrl: values.websiteUrl,
        cardFaceValue: values.cardFaceValue,
        askingPrice: values.askingPrice,
        voucherCode: values.voucherCode,
        cardType: values.cardType,
        extraDetails: values.extraDetails || null,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Sell a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Gift Card</span>
        </h1>
        <p className="text-muted-foreground">Turn unused cards into real value. Submit your card for review.</p>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: Upload, label: "Submit", desc: "Fill in the details" },
          { icon: Clock, label: "Review", desc: "We verify in 24h" },
          { icon: DollarSign, label: "Get Paid", desc: "Wallet credited" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="text-center p-4 bg-card/30 border border-border/30 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {!token && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400 text-center">
          <Link href="/login" className="font-medium underline">Sign in</Link> or{" "}
          <Link href="/register" className="font-medium underline">register</Link> to submit a listing.
        </div>
      )}

      <div className="bg-card/50 border border-border/50 rounded-2xl p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input data-testid="input-brand" placeholder="e.g. Steam, Amazon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-card-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Website</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-website-url"
                      placeholder="https://store.steampowered.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The official website where this card is redeemed</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voucherCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher / Gift Card Code</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-voucher-code"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="font-mono tracking-wider"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Your code is encrypted and only revealed to a buyer after approval</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardFaceValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Face Value ($)</FormLabel>
                    <FormControl>
                      <Input data-testid="input-face-value" type="number" step="0.01" min="1" placeholder="50.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="askingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asking Price ($)</FormLabel>
                    <FormControl>
                      <Input data-testid="input-asking-price" type="number" step="0.01" min="1" placeholder="42.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("cardFaceValue") > 0 && form.watch("askingPrice") > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                <TrendingUp className="h-4 w-4 shrink-0" />
                You'll receive ~${(form.watch("askingPrice") * 0.9).toFixed(2)} after our 10% platform fee
              </div>
            )}

            <FormField
              control={form.control}
              name="extraDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extra Details <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-extra-details"
                      placeholder="Region restrictions, expiry date, balance remaining, or any other relevant info"
                      className="min-h-[100px] bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 p-3 bg-muted/20 border border-border/30 rounded-lg text-xs text-muted-foreground">
              <Shield className="h-4 w-4 shrink-0 text-green-400" />
              Your card code is securely stored. It will only be revealed to a buyer after your listing is approved and paid.
            </div>

            <Button
              data-testid="button-submit"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 font-bold"
              disabled={sellMutation.isPending || !token}
            >
              {sellMutation.isPending ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
