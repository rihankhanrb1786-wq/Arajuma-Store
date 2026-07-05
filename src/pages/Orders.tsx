/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Package, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ShoppingBag, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Store,
  ArrowLeft
} from 'lucide-react';
import { Order } from '../types';

interface OrdersProps {
  orders: Order[];
  onNavigate: (page: string, params?: any) => void;
}

export default function Orders({ orders, onNavigate }: OrdersProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="orders-page-root">
      {/* Header breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-brand-green mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Storefront</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Order History Log
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Track active live grocery boxes and review past purchases
          </p>
        </div>

        <span className="text-xs font-black text-gray-500 bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-lg self-start">
          {orders.length} Orders Placed
        </span>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6" id="orders-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Top Order Meta */}
              <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 text-xs">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px]">Order ID</span>
                    <span className="font-extrabold text-gray-800 text-sm font-mono">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px]">Date Placed</span>
                    <span className="font-extrabold text-gray-700">{order.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px]">Total Amount</span>
                    <span className="font-black text-brand-green text-sm">₹{order.total}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'Delivered' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : order.status === 'Cancelled' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-brand-orange animate-pulse'
                  }`}>
                    {order.status}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center ${
                    order.isPickup ? 'bg-amber-50 text-brand-orange' : 'bg-blue-50 text-blue-800'
                  }`}>
                    {order.isPickup ? <Store className="w-3 h-3 mr-1" /> : <Truck className="w-3 h-3 mr-1" />}
                    {order.isPickup ? 'Pickup' : 'Delivery'}
                  </span>
                </div>
              </div>

              {/* Order Contents */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Items list */}
                  <div className="flex-1 space-y-4">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3.5">
                        <img 
                          src={item.product.image} 
                          alt="" 
                          className="w-10 h-10 object-contain bg-gray-50 border border-gray-100 p-1.5 rounded-lg flex-shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-gray-800 hover:text-brand-green cursor-pointer block leading-tight">
                            {item.product.name}
                          </span>
                          <span className="text-gray-400 font-bold block mt-1 uppercase text-[9px]">
                            {item.quantity} x {item.product.unit} @ ₹{item.product.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery slot & Tracking button */}
                  <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6 text-xs text-gray-500 font-semibold space-y-4">
                    <div className="space-y-2">
                      <span className="block text-gray-400 uppercase tracking-widest text-[9px] font-black">Fulfillment Information</span>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-brand-green" />
                        <span>{order.timeSlot}</span>
                      </div>
                      {order.address ? (
                        <div className="flex items-start space-x-1.5">
                          <MapPin className="w-4 h-4 text-brand-green mt-0.5" />
                          <p className="line-clamp-2 leading-relaxed">{order.address.houseNumber}, {order.address.area}</p>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-1.5">
                          <MapPin className="w-4 h-4 text-brand-green mt-0.5" />
                          <span className="font-extrabold text-gray-700">Self Pickup: Christian Basti Outlet</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('track-order', { order })}
                      className="w-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold py-2 rounded-xl cursor-pointer flex items-center justify-center space-x-1 shadow-sm transition-all border border-emerald-500"
                    >
                      <span>Track Active Box</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto mt-8 space-y-4" id="empty-orders-fallback">
          <div className="bg-emerald-50 p-4 rounded-full w-16 h-16 flex items-center justify-center text-brand-green mx-auto animate-pulse">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="font-black text-gray-800 text-lg">No Orders Placed Yet</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            You haven't placed any grocery orders yet. Explore our kitchen staples, dairy items, or fresh vegetable catalog to check out.
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
