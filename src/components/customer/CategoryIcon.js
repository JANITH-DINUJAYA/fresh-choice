import { Salad, Utensils, ChefHat, CupSoda, Cookie, Clock, CheckCircle, Package, Truck, XCircle, Coins, Landmark, CreditCard } from 'lucide-react';

// Map of lowercase lucide icon names → components
const ICON_MAP = {
  salad: Salad,
  utensils: Utensils,
  chefhat: ChefHat,
  cupsoda: CupSoda,
  cookie: Cookie,
  clock: Clock,
  checkcircle: CheckCircle,
  package: Package,
  truck: Truck,
  xcircle: XCircle,
  coins: Coins,
  landmark: Landmark,
  creditcard: CreditCard,
};

// Detect if a string contains emoji (non-ASCII Unicode)
function isEmoji(str) {
  return /[^\u0000-\u007F]/.test(str);
}

export default function CategoryIcon({ name, size = 18, className = '' }) {
  if (!name) return <ChefHat size={size} className={className} />;

  const key = name.trim().toLowerCase();

  // Check if it matches a known Lucide icon name
  const IconComponent = ICON_MAP[key];
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // If it contains emoji / non-ASCII characters, render it directly
  if (isEmoji(name)) {
    return (
      <span
        style={{ fontSize: `${size}px`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
        className={className}
      >
        {name}
      </span>
    );
  }

  // Fallback: unknown string that is NOT an emoji → show default icon
  return <ChefHat size={size} className={className} />;
}
