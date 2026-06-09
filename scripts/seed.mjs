import pg from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function generateSafeKey() {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

async function seed() {
  const client = await pool.connect();
  console.log("Seeding database...");

  // Admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const adminSafeKey = "ADMIN0SAFE00KEY1";
  const adminSafeKeyHash = await bcrypt.hash(adminSafeKey, 12);

  await client.query(`
    INSERT INTO users (username, password_hash, safe_key_hash, role, wallet_balance, is_active)
    VALUES ($1, $2, $3, 'admin', 500, true)
    ON CONFLICT (username) DO NOTHING
  `, ["admin", adminPasswordHash, adminSafeKeyHash]);

  // Demo user
  const demoPasswordHash = await bcrypt.hash("demo1234", 12);
  const demoSafeKeyHash = await bcrypt.hash("DEMO0000SAFE0001", 12);
  await client.query(`
    INSERT INTO users (username, password_hash, safe_key_hash, role, wallet_balance, is_active)
    VALUES ($1, $2, $3, 'user', 250, true)
    ON CONFLICT (username) DO NOTHING
  `, ["demo", demoPasswordHash, demoSafeKeyHash]);

  // Categories
  const categories = [
    { name: "Gaming", slug: "gaming" },
    { name: "Entertainment", slug: "entertainment" },
    { name: "Shopping", slug: "shopping" },
    { name: "Food & Dining", slug: "food-dining" },
    { name: "Travel", slug: "travel" },
    { name: "Finance", slug: "finance" },
  ];

  for (const cat of categories) {
    await client.query(`
      INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING
    `, [cat.name, cat.slug]);
  }

  const { rows: catRows } = await client.query("SELECT id, slug FROM categories");
  const catBySlug = Object.fromEntries(catRows.map((r) => [r.slug, r.id]));

  const subcategories = [
    // Gaming (global)
    { name: "Steam", slug: "steam", cat: "gaming" },
    { name: "PlayStation", slug: "playstation", cat: "gaming" },
    { name: "Xbox", slug: "xbox", cat: "gaming" },
    { name: "Nintendo", slug: "nintendo", cat: "gaming" },
    { name: "Roblox", slug: "roblox", cat: "gaming" },
    { name: "Minecraft", slug: "minecraft", cat: "gaming" },
    // Entertainment (global + India)
    { name: "Netflix", slug: "netflix", cat: "entertainment" },
    { name: "Spotify", slug: "spotify", cat: "entertainment" },
    { name: "Amazon Prime", slug: "amazon-prime", cat: "entertainment" },
    { name: "Disney+", slug: "disney-plus", cat: "entertainment" },
    { name: "BookMyShow", slug: "bookmyshow", cat: "entertainment" },
    { name: "Jio Cinema", slug: "jio-cinema", cat: "entertainment" },
    // Shopping (global + India)
    { name: "Amazon", slug: "amazon", cat: "shopping" },
    { name: "Flipkart", slug: "flipkart", cat: "shopping" },
    { name: "Myntra", slug: "myntra", cat: "shopping" },
    { name: "Meesho", slug: "meesho", cat: "shopping" },
    { name: "BigBasket", slug: "bigbasket", cat: "shopping" },
    { name: "Apple Store", slug: "apple-store", cat: "shopping" },
    // Food & Dining (global + India)
    { name: "Zomato", slug: "zomato", cat: "food-dining" },
    { name: "Swiggy", slug: "swiggy", cat: "food-dining" },
    { name: "DoorDash", slug: "doordash", cat: "food-dining" },
    { name: "Uber Eats", slug: "uber-eats", cat: "food-dining" },
    { name: "Starbucks", slug: "starbucks", cat: "food-dining" },
    { name: "McDonald's", slug: "mcdonalds", cat: "food-dining" },
    // Travel (global + India)
    { name: "Airbnb", slug: "airbnb", cat: "travel" },
    { name: "MakeMyTrip", slug: "makemytrip", cat: "travel" },
    { name: "Booking.com", slug: "booking-com", cat: "travel" },
    { name: "Uber", slug: "uber", cat: "travel" },
    { name: "Ola", slug: "ola", cat: "travel" },
    { name: "Expedia", slug: "expedia", cat: "travel" },
    // Finance (global + India)
    { name: "PayPal", slug: "paypal", cat: "finance" },
    { name: "Paytm", slug: "paytm", cat: "finance" },
    { name: "PhonePe", slug: "phonepe", cat: "finance" },
    { name: "Google Play", slug: "google-pay", cat: "finance" },
    { name: "Visa Prepaid", slug: "visa-gift", cat: "finance" },
    { name: "Mastercard Gift", slug: "mastercard-gift", cat: "finance" },
  ];

  for (const sub of subcategories) {
    const catId = catBySlug[sub.cat];
    if (!catId) continue;
    await client.query(`
      INSERT INTO subcategories (name, slug, category_id) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING
    `, [sub.name, sub.slug, catId]);
  }

  const { rows: subRows } = await client.query("SELECT id, slug, name FROM subcategories");
  const subBySlug = Object.fromEntries(subRows.map((r) => [r.slug, { id: r.id, name: r.name }]));

  // [sub_slug, name, code, denomination, sell_price, discount_pct, is_active]
  const giftCards = [
    ["steam", "Steam $5 Gift Card", "STEAM-5-XXXX-AAAA", 5, 4.25, 15, true],
    ["steam", "Steam $10 Gift Card", "STEAM-10-BBBB-CCCC", 10, 8.49, 15, true],
    ["steam", "Steam $20 Gift Card", "STEAM-20-DDDD-EEEE", 20, 16.99, 15, true],
    ["steam", "Steam $50 Gift Card", "STEAM-50-FFFF-GGGG", 50, 42.50, 15, true],
    ["steam", "Steam $100 Gift Card", "STEAM-100-HHHH-IIII", 100, 84.99, 15, true],
    ["playstation", "PSN $10 Credit", "PSN-10-0001-AAAA", 10, 8.99, 10, true],
    ["playstation", "PSN $20 Credit", "PSN-20-0002-BBBB", 20, 17.99, 10, true],
    ["playstation", "PSN $50 Credit", "PSN-50-0003-CCCC", 50, 44.99, 10, true],
    ["playstation", "PS Plus 1 Month", "PSPLUS-1M-DDDD-EEEE", 9.99, 7.99, 20, true],
    ["playstation", "PS Plus 3 Months", "PSPLUS-3M-FFFF-GGGG", 24.99, 19.99, 20, true],
    ["xbox", "Xbox $10 Gift Card", "XBOX-10-1111-AAAA", 10, 8.75, 13, true],
    ["xbox", "Xbox $25 Gift Card", "XBOX-25-2222-BBBB", 25, 21.99, 12, true],
    ["xbox", "Xbox $50 Gift Card", "XBOX-50-3333-CCCC", 50, 43.50, 13, true],
    ["xbox", "Game Pass 1 Month", "GAMEPASS-1M-DDDD", 14.99, 11.99, 20, true],
    ["xbox", "Game Pass 3 Months", "GAMEPASS-3M-EEEE", 44.99, 35.99, 20, true],
    ["nintendo", "Nintendo eShop $10", "NSHOP-10-AAAA-1111", 10, 8.99, 10, true],
    ["nintendo", "Nintendo eShop $20", "NSHOP-20-BBBB-2222", 20, 17.99, 10, true],
    ["nintendo", "Nintendo eShop $35", "NSHOP-35-CCCC-3333", 35, 30.99, 11, true],
    ["nintendo", "Nintendo Switch Online 1Y", "NSO-12M-DDDD-4444", 19.99, 15.99, 20, true],
    ["roblox", "Roblox 400 Robux", "ROBUX-400-AAAA", 4.99, 3.99, 20, true],
    ["roblox", "Roblox 800 Robux", "ROBUX-800-BBBB", 9.99, 7.99, 20, true],
    ["roblox", "Roblox 1700 Robux", "ROBUX-1700-CCCC", 19.99, 15.99, 20, true],
    ["roblox", "Roblox 4500 Robux", "ROBUX-4500-DDDD", 49.99, 39.99, 20, true],
    ["minecraft", "Minecraft Java Edition", "MC-JAVA-XXXX-AAAA", 26.95, 20.99, 22, true],
    ["minecraft", "Minecraft 1700 Minecoins", "MC-1700-BBBB-CCCC", 13.99, 10.99, 21, true],
    ["netflix", "Netflix $15 Gift Card", "NFLX-15-AAAA-BBBB", 15, 12.99, 13, true],
    ["netflix", "Netflix $30 Gift Card", "NFLX-30-CCCC-DDDD", 30, 25.99, 13, true],
    ["netflix", "Netflix $60 Gift Card", "NFLX-60-EEEE-FFFF", 60, 51.99, 13, true],
    ["spotify", "Spotify 1 Month Premium", "SPOT-1M-AAAA-XXXX", 9.99, 7.99, 20, true],
    ["spotify", "Spotify 3 Months Premium", "SPOT-3M-BBBB-YYYY", 29.97, 22.99, 23, true],
    ["spotify", "Spotify 6 Months Premium", "SPOT-6M-CCCC-ZZZZ", 59.94, 44.99, 25, true],
    ["amazon-prime", "Amazon Prime 1 Month", "PRIME-1M-AAAA-0001", 14.99, 11.99, 20, true],
    ["amazon-prime", "Amazon Prime 3 Months", "PRIME-3M-BBBB-0002", 44.97, 35.99, 20, true],
    ["disney-plus", "Disney+ 1 Month", "DPLUS-1M-AAAA-CCCC", 13.99, 11.49, 18, true],
    ["disney-plus", "Disney+ 12 Months", "DPLUS-12M-BBBB-DDDD", 139.99, 109.99, 21, true],
    // Entertainment — India
    ["bookmyshow", "BookMyShow $5 Gift Card", "BMS-5-AAAA-0001", 5, 4.25, 15, true],
    ["bookmyshow", "BookMyShow $10 Gift Card", "BMS-10-BBBB-0002", 10, 8.49, 15, true],
    ["bookmyshow", "BookMyShow $25 Gift Card", "BMS-25-CCCC-0003", 25, 21.24, 15, true],
    ["jio-cinema", "Jio Cinema Premium 1 Month", "JIOC-1M-AAAA-XXXX", 4.99, 3.99, 20, true],
    ["jio-cinema", "Jio Cinema Premium 3 Months", "JIOC-3M-BBBB-YYYY", 14.97, 11.49, 23, true],
    // Shopping — India
    ["flipkart", "Flipkart $10 Gift Card", "FLK-10-AAAA-0001", 10, 8.99, 10, true],
    ["flipkart", "Flipkart $25 Gift Card", "FLK-25-BBBB-0002", 25, 22.49, 10, true],
    ["flipkart", "Flipkart $50 Gift Card", "FLK-50-CCCC-0003", 50, 44.99, 10, true],
    ["flipkart", "Flipkart $100 Gift Card", "FLK-100-DDDD-0004", 100, 89.99, 10, true],
    ["myntra", "Myntra $10 Gift Card", "MYN-10-AAAA-XXXX", 10, 8.75, 13, true],
    ["myntra", "Myntra $25 Gift Card", "MYN-25-BBBB-YYYY", 25, 21.74, 13, true],
    ["myntra", "Myntra $50 Gift Card", "MYN-50-CCCC-ZZZZ", 50, 43.49, 13, true],
    ["meesho", "Meesho $10 Gift Card", "MSH-10-AAAA-1111", 10, 8.49, 15, true],
    ["meesho", "Meesho $25 Gift Card", "MSH-25-BBBB-2222", 25, 21.24, 15, true],
    ["bigbasket", "BigBasket $10 Gift Card", "BB-10-AAAA-CCCC", 10, 8.79, 12, true],
    ["bigbasket", "BigBasket $25 Gift Card", "BB-25-BBBB-DDDD", 25, 21.99, 12, true],
    ["bigbasket", "BigBasket $50 Gift Card", "BB-50-CCCC-EEEE", 50, 43.99, 12, true],
    ["amazon", "Amazon $10 Gift Card", "AMZN-10-AAAA-0001", 10, 8.99, 10, true],
    ["amazon", "Amazon $25 Gift Card", "AMZN-25-BBBB-0002", 25, 22.49, 10, true],
    ["amazon", "Amazon $50 Gift Card", "AMZN-50-CCCC-0003", 50, 44.99, 10, true],
    ["amazon", "Amazon $100 Gift Card", "AMZN-100-DDDD-0004", 100, 89.99, 10, true],
    ["amazon", "Amazon $200 Gift Card", "AMZN-200-EEEE-0005", 200, 179.99, 10, true],
    ["apple-store", "Apple Store $25 Gift Card", "APPLE-25-AAAA-ZZZZ", 25, 22.49, 10, true],
    ["apple-store", "Apple Store $50 Gift Card", "APPLE-50-BBBB-YYYY", 50, 44.99, 10, true],
    ["apple-store", "Apple Store $100 Gift Card", "APPLE-100-CCCC-XXXX", 100, 89.99, 10, true],
    // Food & Dining — India + Global
    ["zomato", "Zomato $5 Gift Card", "ZOM-5-AAAA-0001", 5, 4.24, 15, true],
    ["zomato", "Zomato $10 Gift Card", "ZOM-10-BBBB-0002", 10, 8.49, 15, true],
    ["zomato", "Zomato $25 Gift Card", "ZOM-25-CCCC-0003", 25, 21.24, 15, true],
    ["zomato", "Zomato $50 Gift Card", "ZOM-50-DDDD-0004", 50, 42.49, 15, true],
    ["swiggy", "Swiggy $5 Gift Card", "SWG-5-AAAA-XXXX", 5, 4.24, 15, true],
    ["swiggy", "Swiggy $10 Gift Card", "SWG-10-BBBB-YYYY", 10, 8.49, 15, true],
    ["swiggy", "Swiggy $25 Gift Card", "SWG-25-CCCC-ZZZZ", 25, 21.24, 15, true],
    ["swiggy", "Swiggy One 1 Month", "SWGONE-1M-DDDD-0001", 4.99, 3.74, 25, true],
    ["doordash", "DoorDash $15 Gift Card", "DD-15-AAAA-0001", 15, 12.99, 13, true],
    ["doordash", "DoorDash $25 Gift Card", "DD-25-BBBB-0002", 25, 21.99, 12, true],
    ["doordash", "DoorDash $50 Gift Card", "DD-50-CCCC-0003", 50, 42.99, 14, true],
    ["uber-eats", "Uber Eats $15 Gift Card", "UE-15-AAAA-BBBB", 15, 12.49, 17, true],
    ["uber-eats", "Uber Eats $25 Gift Card", "UE-25-CCCC-DDDD", 25, 20.99, 16, true],
    ["starbucks", "Starbucks $10 Gift Card", "SBX-10-AAAA-1111", 10, 8.99, 10, true],
    ["starbucks", "Starbucks $25 Gift Card", "SBX-25-BBBB-2222", 25, 22.49, 10, true],
    ["starbucks", "Starbucks $50 Gift Card", "SBX-50-CCCC-3333", 50, 44.99, 10, true],
    ["mcdonalds", "McDonald's $10 Gift Card", "MCD-10-AAAA-XXXX", 10, 8.75, 13, true],
    ["mcdonalds", "McDonald's $25 Gift Card", "MCD-25-BBBB-YYYY", 25, 21.99, 12, true],
    // Travel — India + Global
    ["airbnb", "Airbnb $50 Gift Card", "ABNB-50-AAAA-XXXX", 50, 42.99, 14, true],
    ["airbnb", "Airbnb $100 Gift Card", "ABNB-100-BBBB-YYYY", 100, 84.99, 15, true],
    ["airbnb", "Airbnb $200 Gift Card", "ABNB-200-CCCC-ZZZZ", 200, 169.99, 15, true],
    ["makemytrip", "MakeMyTrip $25 Gift Card", "MMT-25-AAAA-0001", 25, 21.24, 15, true],
    ["makemytrip", "MakeMyTrip $50 Gift Card", "MMT-50-BBBB-0002", 50, 42.49, 15, true],
    ["makemytrip", "MakeMyTrip $100 Gift Card", "MMT-100-CCCC-0003", 100, 84.99, 15, true],
    ["booking-com", "Booking.com $50 Gift Card", "BOOK-50-AAAA-1111", 50, 44.49, 11, true],
    ["booking-com", "Booking.com $100 Gift Card", "BOOK-100-BBBB-2222", 100, 88.99, 11, true],
    ["uber", "Uber $15 Gift Card", "UBER-15-AAAA-0001", 15, 12.99, 13, true],
    ["uber", "Uber $25 Gift Card", "UBER-25-BBBB-0002", 25, 21.99, 12, true],
    ["uber", "Uber $50 Gift Card", "UBER-50-CCCC-0003", 50, 43.99, 12, true],
    ["ola", "Ola $10 Gift Card", "OLA-10-AAAA-XXXX", 10, 8.49, 15, true],
    ["ola", "Ola $25 Gift Card", "OLA-25-BBBB-YYYY", 25, 21.24, 15, true],
    ["expedia", "Expedia $50 Gift Card", "EXP-50-AAAA-CCCC", 50, 43.49, 13, true],
    ["expedia", "Expedia $100 Gift Card", "EXP-100-BBBB-DDDD", 100, 86.99, 13, true],
    // Finance — India + Global
    ["paypal", "PayPal $10 Gift Card", "PPL-10-AAAA-0001", 10, 8.99, 10, true],
    ["paypal", "PayPal $25 Gift Card", "PPL-25-BBBB-0002", 25, 22.49, 10, true],
    ["paypal", "PayPal $50 Gift Card", "PPL-50-CCCC-0003", 50, 44.99, 10, true],
    ["paytm", "Paytm $10 Gift Card", "PAY-10-AAAA-XXXX", 10, 8.79, 12, true],
    ["paytm", "Paytm $25 Gift Card", "PAY-25-BBBB-YYYY", 25, 21.99, 12, true],
    ["paytm", "Paytm $50 Gift Card", "PAY-50-CCCC-ZZZZ", 50, 43.99, 12, true],
    ["phonepe", "PhonePe $10 Gift Card", "PPE-10-AAAA-1111", 10, 8.79, 12, true],
    ["phonepe", "PhonePe $25 Gift Card", "PPE-25-BBBB-2222", 25, 21.99, 12, true],
    ["google-pay", "Google Play $10", "GPLAY-10-AAAA-CCCC", 10, 8.99, 10, true],
    ["google-pay", "Google Play $25", "GPLAY-25-BBBB-DDDD", 25, 22.49, 10, true],
    ["google-pay", "Google Play $50", "GPLAY-50-CCCC-EEEE", 50, 44.99, 10, true],
    ["visa-gift", "Visa $25 Prepaid Card", "VISA-25-AAAA-XXXX", 25, 22.99, 8, true],
    ["visa-gift", "Visa $50 Prepaid Card", "VISA-50-BBBB-YYYY", 50, 45.99, 8, true],
    ["visa-gift", "Visa $100 Prepaid Card", "VISA-100-CCCC-ZZZZ", 100, 91.99, 8, true],
    ["mastercard-gift", "Mastercard $25 Gift Card", "MC-25-AAAA-1111", 25, 22.99, 8, true],
    ["mastercard-gift", "Mastercard $50 Gift Card", "MC-50-BBBB-2222", 50, 45.99, 8, true],
    ["mastercard-gift", "Mastercard $100 Gift Card", "MC-100-CCCC-3333", 100, 91.99, 8, true],
  ];

  let gcCount = 0;
  for (const [sub, name, code, denomination, sellPrice, discountPct, isActive] of giftCards) {
    const subEntry = subBySlug[sub];
    if (!subEntry) { console.warn(`Missing sub: ${sub}`); continue; }
    const brand = subEntry.name;
    const originalPrice = denomination;
    await client.query(`
      INSERT INTO gift_cards (subcategory_id, brand, name, code, denomination, original_price, sell_price, discount_pct, stock, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 20, $9)
      ON CONFLICT DO NOTHING
    `, [subEntry.id, brand, name, code, denomination, originalPrice, sellPrice, discountPct, isActive]);
    gcCount++;
  }

  const blogPosts = [
    ["How to Maximize Your Gift Card Savings in 2025", "maximize-gift-card-savings-2025", "Discover the top strategies for buying discounted gift cards and stretching every dollar further.", "Gift cards have become the ultimate currency of the digital economy. Buy them at a discount — sometimes up to 25% off face value.\n\nBuy at the right time. Seasonal sales and platform events are the best moments to scoop discounted cards. Stack discounts — buy a discounted Steam card, then use it during a sale. Use your Wallet balance for instant purchases. Sell unused cards to recoup 85-90% of face value."],
    ["The Complete Guide to Selling Gift Cards Online Safely", "selling-gift-cards-online-safely", "Learn how to sell your unused gift cards safely and get the best price for them.", "Selling gift cards online is one of the quickest ways to turn unused value into real cash. Popular brands like Amazon, Steam, and Apple command 88-92% of face value. Submit your card details through our secure form and our admin team reviews within 24 hours. Upon approval, credit lands directly in your wallet."],
    ["Top 10 Gift Cards Every Gamer Should Know About", "top-10-gift-cards-for-gamers", "From Steam to PlayStation to Nintendo — here are the must-have digital currencies for every gaming platform.", "Steam Wallet Cards are the king of PC gaming. PlayStation Store credit gives access to the full PSN store. Xbox gift cards work on console and PC. Nintendo eShop credit is the only way to buy digital Switch games without a credit card. Roblox Robux are essential for younger gamers. Game Pass Ultimate is one subscription that covers Xbox, PC, and cloud gaming."],
    ["Streaming Gift Cards: Which Subscriptions Are Worth It?", "streaming-gift-cards-comparison", "We break down Netflix, Spotify, Disney+, Apple TV+, and Amazon Prime to help you decide where to spend your streaming budget.", "Netflix still has the largest catalog with the most consistent new releases. Spotify Premium delivers ad-free music with excellent discovery algorithms. Disney+ covers Marvel, Star Wars, and Pixar — a no-brainer for families. Apple TV+ is small but consistently excellent quality. Buy discounted streaming gift cards and rotate subscriptions to save 15-25%."],
    ["How Gift Cards Work: The Economics Behind Digital Value", "gift-card-economics-explained", "Ever wondered why gift cards trade below face value? Here's the full economic story behind the secondary market.", "Gift cards trade at a discount for several reasons: liquidity premium (cash is universally useful), verification costs, and opportunity cost. Savvy shoppers buy discounted gift cards for purchases they'd make anyway — a 15% discount on a Steam card is equivalent to a 15% raise on your gaming budget."],
    ["Travel Hacks: Using Gift Cards to Book Cheaper Trips", "travel-hacks-gift-cards", "Smart travelers use discounted gift cards for hotels, flights, and rides to cut 10-20% off every trip.", "Buy an Expedia gift card at 13% discount, use it on sale prices, plus rewards points — effective discount 15-20%. Booking.com cards at 11% off work best for European hotels. Airbnb cards at 14-15% off are perfect for longer stays. Buy Uber or Lyft cards before trips involving airports. A family saving on hotels, flights, and rides can save $700+ on a $5,000 trip."],
    ["The Gift Card Safety Checklist: How to Avoid Scams", "gift-card-safety-checklist", "Gift card scams are real and growing. Use this checklist to protect yourself whether buying or selling.", "Red flags when buying: discounts over 25% are suspicious, unknown platforms lack verification, and urgency is a scam tactic. Red flags when selling: overpayment offers are always scams, never share your PIN before payment clears. Gift Multiverse verifies every card before listing — your purchase is backed by our guarantee."],
    ["Why the Digital Gift Card Market is Growing 20% Per Year", "digital-gift-card-market-growth", "The global gift card market is booming. Here's what's driving growth and what it means for buyers and sellers.", "The global gift card market sits at $285 billion in 2023, projected to reach $500 billion by 2028 with 19-22% annual growth. Drivers: digitalization of corporate rewards, crypto crossover, international gift giving, and Gen Z preferences. Gift Multiverse sits at the center of this growth as a verified secondary market platform."],
  ];

  for (const [title, slug, excerpt, content] of blogPosts) {
    await client.query(`
      INSERT INTO blog_posts (title, slug, content, excerpt, published, published_at)
      VALUES ($1, $2, $3, $4, true, NOW())
      ON CONFLICT (slug) DO NOTHING
    `, [title, slug, content, excerpt]);
  }

  client.release();
  await pool.end();

  console.log(`Seeding complete!`);
  console.log(`- Users: admin (admin123 / safe key: ADMIN0SAFE00KEY1) and demo (demo1234 / safe key: DEMO0000SAFE0001)`);
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Subcategories: ${subcategories.length}`);
  console.log(`- Gift cards: ${gcCount} inserted`);
  console.log(`- Blog posts: ${blogPosts.length}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
