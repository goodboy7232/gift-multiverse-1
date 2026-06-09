/**
 * Brand-to-logo image mapping.
 * Uses clearbit logo API for real brand images.
 * Falls back to a branded placeholder for unknown brands.
 */

const BRAND_LOGO_MAP: Record<string, string> = {
  // Gaming
  "Steam": "https://logo.clearbit.com/steampowered.com",
  "PlayStation": "https://logo.clearbit.com/playstation.com",
  "Xbox": "https://logo.clearbit.com/xbox.com",
  "Nintendo": "https://logo.clearbit.com/nintendo.com",
  "Roblox": "https://logo.clearbit.com/roblox.com",
  "Minecraft": "https://logo.clearbit.com/minecraft.net",

  // Entertainment
  "Netflix": "https://logo.clearbit.com/netflix.com",
  "Spotify": "https://logo.clearbit.com/spotify.com",
  "Amazon Prime": "https://logo.clearbit.com/primevideo.com",
  "Disney+": "https://logo.clearbit.com/disneyplus.com",
  "BookMyShow": "https://logo.clearbit.com/bookmyshow.com",
  "Jio Cinema": "https://logo.clearbit.com/jiocinema.com",

  // Shopping
  "Amazon": "https://logo.clearbit.com/amazon.com",
  "Flipkart": "https://logo.clearbit.com/flipkart.com",
  "Myntra": "https://logo.clearbit.com/myntra.com",
  "Meesho": "https://logo.clearbit.com/meesho.com",
  "BigBasket": "https://logo.clearbit.com/bigbasket.com",
  "Apple Store": "https://logo.clearbit.com/apple.com",

  // Food & Dining
  "Zomato": "https://logo.clearbit.com/zomato.com",
  "Swiggy": "https://logo.clearbit.com/swiggy.com",
  "DoorDash": "https://logo.clearbit.com/doordash.com",
  "Uber Eats": "https://logo.clearbit.com/ubereats.com",
  "Starbucks": "https://logo.clearbit.com/starbucks.com",
  "McDonald's": "https://logo.clearbit.com/mcdonalds.com",

  // Travel
  "Airbnb": "https://logo.clearbit.com/airbnb.com",
  "MakeMyTrip": "https://logo.clearbit.com/makemytrip.com",
  "Booking.com": "https://logo.clearbit.com/booking.com",
  "Uber": "https://logo.clearbit.com/uber.com",
  "Ola": "https://logo.clearbit.com/olacabs.com",
  "Expedia": "https://logo.clearbit.com/expedia.com",

  // Finance
  "PayPal": "https://logo.clearbit.com/paypal.com",
  "Paytm": "https://logo.clearbit.com/paytm.com",
  "PhonePe": "https://logo.clearbit.com/phonepe.com",
  "Google Play": "https://logo.clearbit.com/google.com",
  "Visa Prepaid": "https://logo.clearbit.com/visa.com",
  "Mastercard Gift": "https://logo.clearbit.com/mastercard.com",
};

/** Brand accent colors for gradient backgrounds */
const BRAND_COLOR_MAP: Record<string, [string, string]> = {
  "Steam": ["#1b2838", "#2a475e"],
  "PlayStation": ["#003087", "#0070d1"],
  "Xbox": ["#107C10", "#0e5e0e"],
  "Nintendo": ["#e60012", "#b3000e"],
  "Roblox": ["#191919", "#333333"],
  "Minecraft": ["#3d8e3d", "#2a6b2a"],
  "Netflix": ["#141414", "#b9090b"],
  "Spotify": ["#191414", "#1DB954"],
  "Amazon Prime": ["#00A8E1", "#004C66"],
  "Disney+": ["#0e1b2e", "#113CCF"],
  "BookMyShow": ["#c4242b", "#8a1a1f"],
  "Jio Cinema": ["#1a1a2e", "#e50914"],
  "Amazon": ["#131921", "#232f3e"],
  "Flipkart": ["#047BD5", "#054a7f"],
  "Myntra": ["#e72744", "#b51b34"],
  "Meesho": ["#9e3085", "#6e1f5c"],
  "BigBasket": ["#4a9b3a", "#2e6b22"],
  "Apple Store": ["#1d1d1f", "#434344"],
  "Zomato": ["#cb202d", "#9a1a1f"],
  "Swiggy": ["#fc8019", "#c45e0e"],
  "DoorDash": ["#ff3008", "#c42400"],
  "Uber Eats": ["#06c167", "#048a49"],
  "Starbucks": ["#00704a", "#004d33"],
  "McDonald's": ["#ffc72c", "#da291c"],
  "Airbnb": ["#ff5a5f", "#c43c40"],
  "MakeMyTrip": ["#1a1a2e", "#e94e1b"],
  "Booking.com": ["#003580", "#001a40"],
  "Uber": ["#000000", "#333333"],
  "Ola": ["#d7e100", "#9da80b"],
  "Expedia": ["#ffcc00", "#b38f00"],
  "PayPal": ["#003087", "#0070ba"],
  "Paytm": ["#00baf2", "#0080a8"],
  "PhonePe": ["#5f259f", "#3e1a66"],
  "Google Play": ["#1a1a1a", "#34a853"],
  "Visa Prepaid": ["#1a1f71", "#0e1240"],
  "Mastercard Gift": ["#eb001b", "#f79e1b"],
};

const DEFAULT_COLORS: [string, string] = ["#0f172a", "#1e293b"];

export function getBrandLogo(brand: string): string {
  return BRAND_LOGO_MAP[brand] ?? "";
}

export function getBrandColors(brand: string): [string, string] {
  return BRAND_COLOR_MAP[brand] ?? DEFAULT_COLORS;
}

export function getCardImage(brand: string, id: number): string {
  const logo = getBrandLogo(brand);
  if (logo) {
    return logo;
  }
  // Fallback to a nice branded gradient placeholder using the ID
  const colors = getBrandColors(brand);
  return `https://placehold.co/600x400/${colors[0].replace("#", "")}/${colors[1].replace("#", "")}?text=${encodeURIComponent(brand)}`;
}
