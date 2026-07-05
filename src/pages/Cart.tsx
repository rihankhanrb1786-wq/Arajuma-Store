/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  Ticket, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Store, 
  Truck, 
  ArrowLeft 
} from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { COUPONS } from '../data/mockData';

interface CartProps {
  cart: CartItem[];
  onAddToCart: (p: any) => void;
  onRemoveFromCart: (p: any) => void;
  onDeleteFromCart: (p: any) => void;
  onNavigate: (page: string, params?: any) => void;
  isPickup: boolean;
  onTogglePickup: (pickup: boolean) => void;
}

export default function Cart({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onDeleteFromCart,
  onNavigate,
  isPickup,
  onTogglePickup
}: CartProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Cart financial summaries
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cart]);

  // Minimum Order Requirement
  const MIN_ORDER_AMOUNT = 149;
  const isBelowMinOrder = subtotal < MIN_ORDER_AMOUNT;

  // Delivery Charges: Flat ₹39, Free if subtotal >= ₹499. Store Pickup gets ₹0 delivery fees!
  const deliveryCharges = useMemo(() => {
    if (isPickup) return 0;
    if (subtotal >= 499) return 0;
    return 39;
  }, [subtotal, isPickup]);

  // Pickup Discount: Extra 5% Off if store pickup is selected
  const pickupDiscount = useMemo(() => {
    if (isPickup) {
      return Math.round(subtotal * 0.05);
    }
    return 0;
  }, [subtotal, isPickup]);

  // Coupon Discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minPurchase) {
      return 0; // fallback if state goes out of sync
    }
    if (appliedCoupon.discountType === 'fixed') {
      return appliedCoupon.discountValue;
    } else {
      // percentage
      return Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
  }, [appliedCoupon, subtotal]);

  // Total payable
  const total = useMemo(() => {
    const calculated = subtotal + deliveryCharges - pickupDiscount - couponDiscount;
    return calculated < 0 ? 0 : calculated;
  }, [subtotal, deliveryCharges, pickupDiscount, couponDiscount]);

  // Handle coupon validation
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const coupon = COUPONS.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (!coupon) {
      setCouponError('Invalid coupon code. Try ARAJUMA100 or SUPER20');
      return;
    }
    if (!coupon.isActive) {
      setCouponError('This coupon code is expired.');
      return;
    }
    if (subtotal < coupon.minPurchase) {
      setCouponError(`Minimum purchase of ₹${coupon.minPurchase} required to apply this coupon.`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="cart-page-root">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">
        Your Shopping Cart
      </h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart items */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="cart-items-wrapper">
            {/* Header list */}
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Grocery Items ({cart.length})
              </span>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs font-bold text-brand-green hover:text-brand-green-hover flex items-center cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Keep Adding Items</span>
              </button>
            </div>

            {/* List items */}
            <div className="divide-y divide-gray-100 px-6">
              {cart.map((item) => (
                <div key={item.product.id} className="py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Image and name */}
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain bg-gray-50 p-2 rounded-xl border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 
                        onClick={() => onNavigate('product-details', { product: item.product })}
                        className="font-bold text-gray-800 text-sm hover:text-brand-green transition-colors cursor-pointer line-clamp-2"
                      >
                        {item.product.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase mt-1">
                        <span>{item.product.brand}</span>
                        <span>•</span>
                        <span>{item.product.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Prices */}
                  <div className="flex items-center justify-between sm:justify-end space-x-6">
                    {/* Price calculation */}
                    <div className="text-right sm:text-left min-w-[70px]">
                      <span className="text-sm font-black text-gray-900 block">
                        ₹{item.product.price * item.quantity}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-gray-400 font-bold block">
                          ₹{item.product.price} each
                        </span>
                      )}
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center justify-between bg-brand-green text-white rounded-lg font-bold overflow-hidden h-[32px] w-[90px]">
                      <button
                        onClick={() => onRemoveFromCart(item.product)}
                        className="px-2 hover:bg-brand-green-hover flex justify-center items-center h-full cursor-pointer transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs px-1 select-none font-black min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onAddToCart(item.product)}
                        className="px-2 hover:bg-brand-green-hover flex justify-center items-center h-full cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => onDeleteFromCart(item.product)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Checkout details summaries */}
          <div className="lg:col-span-4 space-y-6">
            {/* Delivery charge details card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider pb-3 border-b border-gray-50">
                Delivery Settings
              </h3>

              {/* Fulfilment Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => onTogglePickup(false)}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isPickup 
                      ? 'bg-brand-green text-white shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Home Delivery</span>
                </button>
                <button
                  onClick={() => onTogglePickup(true)}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isPickup 
                      ? 'bg-brand-orange text-white shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Store Pickup</span>
                </button>
              </div>

              {isPickup ? (
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex items-start space-x-2 text-[11px] text-brand-orange font-semibold">
                  <Store className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Store pickup gets 5% extra discount. Pick up ready bags from GS Road outlet in 15 mins.</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-start space-x-2 text-[11px] text-brand-green font-semibold">
                  <Truck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {subtotal >= 499 ? (
                    <p>Woohoo! Free Home Delivery is automatically applied to your cart.</p>
                  ) : (
                    <p>Add products worth ₹{499 - subtotal} more to unlock Free Home Delivery (Save ₹39).</p>
                  )}
                </div>
              )}
            </div>

            {/* Coupons Promo Input card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">
                Coupons & Promos
              </h3>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ticket className="w-5 h-5 text-brand-green" />
                    <div>
                      <span className="font-black text-brand-green text-xs tracking-wider block">
                        {appliedCoupon.code} APPLIED
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold leading-none">
                        Saved ₹{couponDiscount}!
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter ARAJUMA100..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-gray-50 text-xs px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                  />
                  <button
                    type="submit"
                    className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all border border-emerald-500"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[10px] text-red-500 font-bold">{couponError}</p>
              )}

              {/* Suggestions */}
              {!appliedCoupon && (
                <div className="space-y-1.5 pt-2 border-t border-gray-50 text-[10px] text-gray-500 font-semibold">
                  <span className="block text-gray-400 uppercase tracking-widest text-[9px] font-black">Available Promos:</span>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>ARAJUMA100 (Flat ₹100 Off above ₹499)</span>
                    <button 
                      onClick={() => { setCouponCode('ARAJUMA100'); }}
                      className="text-brand-green font-bold hover:underline cursor-pointer"
                    >
                      Use
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span>SUPER20 (20% Off snacks above ₹299)</span>
                    <button 
                      onClick={() => { setCouponCode('SUPER20'); }}
                      className="text-brand-green font-bold hover:underline cursor-pointer"
                    >
                      Use
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider pb-3 border-b border-gray-50">
                Bill Invoice Summary
              </h3>

              <div className="space-y-2.5 text-xs font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Cart Items Subtotal</span>
                  <span className="text-gray-800 font-bold">₹{subtotal}</span>
                </div>
                {isPickup ? (
                  <div className="flex justify-between text-brand-green">
                    <span>Store Pickup Discount (5% Off)</span>
                    <span className="font-bold">- ₹{pickupDiscount}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span>Standard Delivery Charge</span>
                    {deliveryCharges === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      <span className="text-gray-800 font-bold">₹{deliveryCharges}</span>
                    )}
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>Promo Coupon Saved</span>
                    <span className="font-bold">- ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-gray-50 pt-3 flex justify-between text-sm text-gray-900">
                  <span className="font-black">Total Amount Payable</span>
                  <span className="font-black text-base text-brand-green">₹{total}</span>
                </div>
              </div>

              {/* Checkout Warnings & CTA buttons */}
              <div className="pt-4 space-y-3">
                {isBelowMinOrder ? (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-start space-x-2 text-[10px] text-amber-700 font-bold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-orange animate-bounce" />
                    <div>
                      <span>Minimum Order Amount is ₹{MIN_ORDER_AMOUNT}</span>
                      <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Please add item worth ₹{MIN_ORDER_AMOUNT - subtotal} more to checkout.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 font-bold justify-center">
                    <ShieldCheck className="w-4 h-4 text-brand-green" />
                    <span>Safe & Secure Grocery Escrow checkout</span>
                  </div>
                )}

                <button
                  disabled={isBelowMinOrder}
                  onClick={() => onNavigate('checkout', { 
                    appliedCoupon, 
                    subtotal, 
                    deliveryCharges, 
                    pickupDiscount, 
                    couponDiscount, 
                    total 
                  })}
                  className={`w-full h-12 rounded-xl font-extrabold text-xs tracking-wider uppercase shadow flex items-center justify-center space-x-1.5 transition-all ${
                    isBelowMinOrder 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                      : 'bg-brand-green hover:bg-brand-green-hover text-white cursor-pointer border border-emerald-500'
                  }`}
                >
                  <span>Proceed to Safe Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto space-y-4" id="empty-cart-fallback">
          <div className="bg-emerald-50 p-4 rounded-full w-16 h-16 flex items-center justify-center text-brand-green mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-black text-gray-800 text-lg">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            There are no items currently added to your shopping cart. Browse our fresh farm vegetables or dairy selection to add items now.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all border border-emerald-500"
          >
            Start Grocery Shopping
          </button>
        </div>
      )}
    </div>
  );
}
