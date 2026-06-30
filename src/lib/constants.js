// Delivery zone configuration for Fresh Choice Sri Lanka
// Prices in LKR

export const DELIVERY_ZONES = [
  { id: 'zone1', name: 'Colombo City (Colombo 1-15)', fee: 150, freeAbove: 2000 },
  { id: 'zone2', name: 'Colombo Suburbs (Nugegoda, Maharagama, Kottawa)', fee: 250, freeAbove: 2500 },
  { id: 'zone3', name: 'Extended Area (Panadura, Homagama, Kaduwela)', fee: 350, freeAbove: 3000 },
];

export function getDeliveryFee(zoneId, subtotal) {
  const zone = DELIVERY_ZONES.find(z => z.id === zoneId);
  if (!zone) return 0;
  return subtotal >= zone.freeAbove ? 0 : zone.fee;
}

export const ORDER_STATUSES = [
  { key: 'pending', label: 'Pending', color: '#f59e0b', icon: 'Clock' },
  { key: 'confirmed', label: 'Confirmed', color: '#3b82f6', icon: 'CheckCircle' },
  { key: 'preparing', label: 'Preparing', color: '#8b5cf6', icon: 'ChefHat' },
  { key: 'ready', label: 'Ready', color: '#10b981', icon: 'Package' },
  { key: 'delivered', label: 'Delivered', color: '#22c55e', icon: 'Truck' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: 'XCircle' },
];

export const CATEGORIES = [
  { id: 'salads', label: 'Salads', icon: 'Salad', slug: 'salads' },
  { id: 'rice-curry', label: 'Rice & Curry', icon: 'Utensils', slug: 'rice-curry' },
  { id: 'bowls', label: 'Healthy Bowls', icon: 'ChefHat', slug: 'bowls' },
  { id: 'drinks', label: 'Drinks', icon: 'CupSoda', slug: 'drinks' },
  { id: 'snacks', label: 'Snacks', icon: 'Cookie', slug: 'snacks' },
];

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: 'Coins', active: true },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: 'Landmark', active: true },
  { id: 'card', label: 'Card Payment', icon: 'CreditCard', active: false, comingSoon: true },
];

export const BANK_DETAILS = {
  bankName: 'Commercial Bank of Ceylon',
  accountName: 'Fresh Choice',
  accountNumber: '1234567890',
  branch: 'Colombo Branch',
};

export const USER_ROLES = [
  { 
    id: 'super_admin', 
    label: 'Super Admin', 
    permissions: ['all_permissions']
  },
  { 
    id: 'admin', 
    label: 'Admin', 
    permissions: ['manage_meals', 'manage_orders', 'view_inventory', 'view_customers']
  },
  { 
    id: 'staff', 
    label: 'Staff', 
    permissions: ['manage_orders', 'view_inventory'] 
  },
];

export function formatPrice(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-LK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Schedule slots for pre-ordering (next 3 days)
export function getAvailableScheduleSlots() {
  const slots = [];
  const today = new Date();
  for (let d = 0; d < 3; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : date.toLocaleDateString('en-LK', { weekday: 'long' });
    ['11:00 AM', '12:00 PM', '1:00 PM', '6:00 PM', '7:00 PM'].forEach(time => {
      slots.push({ date: dateStr, time, label: `${label}, ${time}` });
    });
  }
  return slots;
}
