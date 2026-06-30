import { Salad, Utensils, ChefHat, CupSoda, Cookie, Clock, CheckCircle, Package, Truck, XCircle, Coins, Landmark, CreditCard } from 'lucide-react';

export default function CategoryIcon({ name, size = 18, className = '' }) {
  switch (name?.toLowerCase()) {
    case 'salad': return <Salad size={size} className={className} />;
    case 'utensils': return <Utensils size={size} className={className} />;
    case 'chefhat': return <ChefHat size={size} className={className} />;
    case 'cupsoda': return <CupSoda size={size} className={className} />;
    case 'cookie': return <Cookie size={size} className={className} />;
    
    // Status
    case 'clock': return <Clock size={size} className={className} />;
    case 'checkcircle': return <CheckCircle size={size} className={className} />;
    case 'package': return <Package size={size} className={className} />;
    case 'truck': return <Truck size={size} className={className} />;
    case 'xcircle': return <XCircle size={size} className={className} />;

    // Payments
    case 'coins': return <Coins size={size} className={className} />;
    case 'landmark': return <Landmark size={size} className={className} />;
    case 'creditcard': return <CreditCard size={size} className={className} />;

    default: return <ChefHat size={size} className={className} />;
  }
}
