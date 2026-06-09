import { getBrandColors } from "@/lib/brandImages";
import { ShoppingBag, Gamepad2, Clapperboard, Utensils, Plane, CreditCard, Gift } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Gaming": <Gamepad2 className="w-10 h-10" />,
  "Entertainment": <Clapperboard className="w-10 h-10" />,
  "Shopping": <ShoppingBag className="w-10 h-10" />,
  "Food & Dining": <Utensils className="w-10 h-10" />,
  "Travel": <Plane className="w-10 h-10" />,
  "Finance": <CreditCard className="w-10 h-10" />,
};

interface BrandCardImageProps {
  brand: string;
  categoryName?: string | null;
  imageUrl?: string | null;
  className?: string;
}

export default function BrandCardImage({ brand, categoryName, imageUrl, className = "" }: BrandCardImageProps) {
  if (imageUrl) {
    return (
      <div className={`w-full h-full relative overflow-hidden ${className}`}>
        <img src={imageUrl} alt={brand} className="w-full h-full object-cover" />
      </div>
    );
  }

  const colors = getBrandColors(brand);
  const icon = categoryName ? CATEGORY_ICONS[categoryName] : <Gift className="w-10 h-10" />;

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
      }}
    >
      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
        }}
      />

      {/* Icon */}
      <div className="text-white/80 drop-shadow-lg z-10 mb-2">
        {icon}
      </div>

      {/* Brand Name */}
      <span className="text-white font-bold text-lg tracking-wide drop-shadow-md z-10 text-center px-2 leading-tight">
        {brand}
      </span>

      {/* Shine effect */}
      <div
        className="absolute -inset-[100%] rotate-12 opacity-20 animate-shine"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          animation: "shine 3s infinite",
        }}
      />
    </div>
  );
}
