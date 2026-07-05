/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  Store, 
  Truck, 
  Plus, 
  ShoppingBag, 
  CheckCircle, 
  ArrowLeft,
  X
} from 'lucide-react';
import { Address, CartItem, Order, TrackingStep, Coupon } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  addresses: Address[];
  onAddAddress: (addr: Omit<Address, 'id'>) => void;
  onNavigate: (page: string, params?: any) => void;
  isPickup: boolean;
  onTogglePickup: (pickup: boolean) => void;
  activeAddress: Address | null;
  onSelectAddress: (addr: Address) => void;
  onClearCart: () => void;
  onAddOrder: (order: Order) => void;
  checkoutMeta: {
    appliedCoupon: Coupon | null;
    subtotal: number;
    deliveryCharges: number;
    pickupDiscount: number;
    couponDiscount: number;
    total: number;
  };
}

export default function Checkout({
  cart,
  addresses,
  onAddAddress,
  onNavigate,
  isPickup,
  onTogglePickup,
  activeAddress,
  onSelectAddress,
  onClearCart,
  onAddOrder,
  checkoutMeta
}: CheckoutProps) {
  const [selectedSlot, setSelectedSlot] = useState('08:00 AM - 11:00 AM');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Card' | 'UPI' | 'Wallet'>('COD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // New address form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHouse, setNewHouse] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Guwahati');
  const [newState, setNewState] = useState('Assam');
  const [newPincode, setNewPincode] = useState('');
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Time Slot Options
  const slots = [
    '08:00 AM - 11:00 AM (Morning)',
    '11:00 AM - 02:00 PM (Noon)',
    '02:00 PM - 05:00 PM (Afternoon)',
    '05:00 PM - 08:00 PM (Evening)',
  ];

  // Handle address submit
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newHouse || !newArea || !newPincode) return;
    
    onAddAddress({
      name: newName,
      phone: newPhone,
      houseNumber: newHouse,
      area: newArea,
      landmark: newLandmark,
      city: newCity,
      state: newState,
      pincode: newPincode,
      type: newType
    });

    // Reset fields
    setNewName('');
    setNewPhone('');
    setNewHouse('');
    setNewArea('');
    setNewLandmark('');
    setNewPincode('');
    setShowAddressForm(false);
  };

  // Handle Placing Order
  const handlePlaceOrder = () => {
    if (!isPickup && !activeAddress) {
      alert('Please select or add a delivery address.');
      return;
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    
    const initialTracking: TrackingStep[] = [
      { title: 'Order Placed', description: 'Your order has been received.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), status: 'completed' },
      { title: 'Processing', description: 'Outlets packing your organic groceries.', status: 'current' },
      { title: 'Out for Delivery', description: 'Grocery executive assigned.', status: 'upcoming' },
      { title: 'Delivered', description: 'Handover complete.', status: 'upcoming' },
    ];

    const newOrder: Order = {
      id: orderId,
      userId: 'user-1',
      items: [...cart],
      status: 'Placed',
      subtotal: checkoutMeta.subtotal,
      deliveryCharges: checkoutMeta.deliveryCharges,
      discount: checkoutMeta.pickupDiscount + checkoutMeta.couponDiscount,
      total: checkoutMeta.total,
      address: isPickup ? undefined : activeAddress || undefined,
      isPickup,
      storePickupAddress: isPickup ? 'Arajuma Store Outlet, Christian Basti, Guwahati' : undefined,
      timeSlot: selectedSlot,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      createdAt: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      trackingSteps: initialTracking
    };

    onAddOrder(newOrder);
    onClearCart();
    onNavigate('track-order', { order: newOrder });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="checkout-page-root">
      {/* Back to Cart button */}
      <button
        onClick={() => onNavigate('cart')}
        className="flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-brand-green mb-8 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to Shopping Cart</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Checkout fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Fulfillment Type */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center">
              <span className="bg-brand-green text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 font-bold">1</span>
              Fulfillment Selection
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onTogglePickup(false)}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  !isPickup 
                    ? 'border-brand-green bg-emerald-50/20 text-brand-green ring-2 ring-emerald-50' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">Home Delivery</span>
                  <span className="text-[10px] text-gray-500 mt-1 block">Superfast deliveries right to your door.</span>
                </div>
              </button>

              <button
                onClick={() => onTogglePickup(true)}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  isPickup 
                    ? 'border-brand-orange bg-orange-50/20 text-brand-orange ring-2 ring-orange-50' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Store className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">Store Pickup</span>
                  <span className="text-[10px] text-gray-500 mt-1 block">Get 5% Off. Pick up packed box in 15 mins.</span>
                </div>
              </button>
            </div>
          </section>

          {/* Section 2: Address book (only for delivery) */}
          {!isPickup && (
            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wider flex items-center">
                  <span className="bg-brand-green text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 font-bold">2</span>
                  Delivery Address
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-brand-green hover:text-brand-green-hover flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Dynamic Address Adder Form */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-700 uppercase tracking-widest">New Address Form</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(false)} 
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name*"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                    />
                    <input
                      type="tel"
                      placeholder="10-Digit Mobile*"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Flat / House No. / Building Name*"
                    required
                    value={newHouse}
                    onChange={(e) => setNewHouse(e.target.value)}
                    className="w-full bg-white text-xs px-3.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Area / Street / Colony*"
                      required
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                    />
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      value={newLandmark}
                      onChange={(e) => setNewLandmark(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      disabled
                      value="Guwahati"
                      className="bg-gray-100 text-xs px-3 py-2 rounded-lg border border-gray-200 cursor-not-allowed"
                    />
                    <input
                      type="text"
                      disabled
                      value="Assam"
                      className="bg-gray-100 text-xs px-3 py-2 rounded-lg border border-gray-200 cursor-not-allowed"
                    />
                    <input
                      type="text"
                      placeholder="Pincode*"
                      required
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="bg-white text-xs px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-green"
                    />
                  </div>

                  {/* Address Type buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-2">Tag as:</span>
                    {['Home', 'Work', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewType(type as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          newType === type
                            ? 'bg-brand-green text-white shadow-sm'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow border border-emerald-500"
                  >
                    Save Address Location
                  </button>
                </form>
              )}

              {/* Saved Addresses list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = activeAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => onSelectAddress(addr)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                        isSelected 
                          ? 'border-brand-green bg-emerald-50/10 ring-2 ring-emerald-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          {addr.type}
                        </span>
                        {isSelected && (
                          <span className="text-brand-green font-bold text-xs flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-brand-green fill-current text-white" />
                            Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-800">{addr.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {addr.houseNumber}, {addr.area}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                      </p>
                      <span className="text-[10px] text-gray-400 font-bold block mt-3">Phone: +91 {addr.phone}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 3: Delivery Slots */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center">
              <span className="bg-brand-green text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 font-bold">
                {isPickup ? '2' : '3'}
              </span>
              Preferred Time Slot
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => {
                const isSel = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel 
                        ? 'border-brand-green bg-emerald-50/10 text-brand-green font-extrabold shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {slot}
                    </span>
                    {isSel && <div className="w-2 h-2 rounded-full bg-brand-green" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Secure Online/COD Payments */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center">
              <span className="bg-brand-green text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 font-bold">
                {isPickup ? '3' : '4'}
              </span>
              Secure Payment Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash on Delivery / Pay on Pickup */}
              <button
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod === 'COD' 
                    ? 'border-brand-green bg-emerald-50/10 text-brand-green font-extrabold shadow-sm' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="bg-emerald-100 text-brand-green p-2 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold block">
                    {isPickup ? 'Pay On Pickup' : 'Cash on Delivery (COD)'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block leading-tight font-medium">
                    No extra fees. Pay via Cash or UPI at your doorstep.
                  </span>
                </div>
              </button>

              {/* Online Payment (Unified Cards, Netbanking, UPI) */}
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod !== 'COD' 
                    ? 'border-brand-green bg-emerald-50/10 text-brand-green font-extrabold shadow-sm' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold block">
                    Instant Online Payments
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block leading-tight font-medium">
                    Safe payment via cards, secure Netbanking or PhonePe/GPay.
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Right column: Order Cart details invoice summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider pb-3 border-b border-gray-50">
            Order Inventory Checklist
          </h3>

          {/* Small items logs */}
          <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5 max-w-[70%]">
                  <img src={item.product.image} alt="" className="w-8 h-8 object-contain rounded" referrerPolicy="no-referrer" />
                  <div className="truncate">
                    <span className="font-extrabold text-gray-800 truncate block">{item.product.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold block">{item.quantity} x {item.product.unit}</span>
                  </div>
                </div>
                <span className="font-black text-gray-700">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Invoice block */}
          <div className="border-t border-gray-50 pt-4 space-y-2.5 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Items Total Subtotal</span>
              <span className="text-gray-800 font-bold">₹{checkoutMeta.subtotal}</span>
            </div>
            {isPickup ? (
              <div className="flex justify-between text-brand-green">
                <span>Pickup discount (5%)</span>
                <span className="font-bold">- ₹{checkoutMeta.pickupDiscount}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Fulfillment Delivery fee</span>
                {checkoutMeta.deliveryCharges === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  <span className="text-gray-800 font-bold">₹{checkoutMeta.deliveryCharges}</span>
                )}
              </div>
            )}
            {checkoutMeta.couponDiscount > 0 && (
              <div className="flex justify-between text-brand-green">
                <span>Applied Coupon Savings</span>
                <span className="font-bold">- ₹{checkoutMeta.couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3.5 flex justify-between text-sm text-gray-900 font-black">
              <span>Grand Payable Amount</span>
              <span className="text-brand-green text-base font-black">₹{checkoutMeta.total}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-brand-green hover:bg-brand-green-hover text-white h-12 rounded-xl font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer border border-emerald-500"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Place Secured Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
