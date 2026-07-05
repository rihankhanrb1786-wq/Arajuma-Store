/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'delivery';
  createdAt: string;
  uid?: string;
  fullName?: string;
  photoURL?: string;
  lastLogin?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  houseNumber: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
}

export interface Product {
  id: string;
  name: string;
  category: string; // matches Category slug
  brand: string; // matches Brand ID/name
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  stock: number;
  unit: string; // e.g., "1 kg", "500 g", "1 Pack", "1 L"
  isDealsOfTheDay?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  isNewArrival?: boolean;
  flashSalePrice?: number;
  ingredients?: string;
  benefits?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Placed' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface TrackingStep {
  title: string;
  description: string;
  time?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  total: number;
  address?: Address;
  isPickup: boolean;
  storePickupAddress?: string;
  timeSlot: string;
  paymentMethod: 'COD' | 'Card' | 'UPI' | 'Wallet';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  createdAt: string;
  trackingSteps: TrackingStep[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  title: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discountText: string;
  image: string;
  code?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface DeliverySlot {
  id: string;
  slot: string; // e.g., "08:00 AM - 11:00 AM"
  capacity: number;
  isAvailable: boolean;
}

export interface StockInfo {
  productId: string;
  currentStock: number;
  minAlertStock: number;
  warehouseLocation: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  productsSupplied: string[]; // Product IDs
}

export interface StoreSettings {
  minimumOrderAmount: number;
  deliveryChargeStandard: number;
  deliveryChargeFreeThreshold: number;
  storeAddress: string;
  supportEmail: string;
  supportPhone: string;
}
