/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Truck, 
  Package, 
  FileText, 
  Store, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Order } from '../types';

interface TrackOrderProps {
  order: Order;
  onNavigate: (page: string, params?: any) => void;
}

export default function TrackOrder({ order, onNavigate }: TrackOrderProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8" id="track-order-root">
      {/* Back to Orders list button */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
        <div>
          <button
            onClick={() => onNavigate('orders')}
            className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-brand-green mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>My Orders list</span>
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Live Order Tracking
          </h1>
        </div>

        <div className="text-right text-xs">
          <span className="text-gray-400 font-bold block uppercase tracking-wider text-[8px]">Order Reference</span>
          <span className="font-extrabold text-gray-800 font-mono text-sm">{order.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Stepper timeline */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="font-black text-gray-800 text-sm uppercase tracking-wider pb-3 border-b border-gray-50 flex items-center">
            <Clock className="w-4.5 h-4.5 mr-2 text-brand-green" />
            Active Delivery Timeline
          </h2>

          {/* Stepper items */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {order.trackingSteps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isUpcoming = step.status === 'upcoming';

              return (
                <div key={index} className="relative flex items-start space-x-4">
                  {/* Circle Indicator */}
                  <div className={`absolute -left-[21.5px] w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm ${
                    isCompleted 
                      ? 'bg-brand-green' 
                      : isCurrent 
                      ? 'bg-brand-orange animate-ping' 
                      : 'bg-gray-200'
                  }`} />
                  
                  {/* Secondary Static Circle for the current pulsing anchor */}
                  {isCurrent && (
                    <div className="absolute -left-[21.5px] w-4.5 h-4.5 rounded-full border-4 border-white bg-brand-orange z-10 shadow-sm" />
                  )}

                  <div className="text-xs">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-black uppercase tracking-wider ${
                        isCompleted ? 'text-gray-900' : isCurrent ? 'text-brand-orange' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      {step.time && (
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                          {step.time}
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 font-semibold ${isUpcoming ? 'text-gray-300' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Fulfillment Summary details box */}
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="font-black text-gray-800 text-sm uppercase tracking-wider pb-3 border-b border-gray-50 flex items-center">
            <FileText className="w-4.5 h-4.5 mr-2 text-brand-green" />
            Receipt Summary
          </h2>

          <div className="space-y-4">
            {/* Products logs */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700 truncate max-w-[70%]">{item.product.name}</span>
                  <span className="text-gray-500 font-bold text-[11px]">{item.quantity} x ₹{item.product.price}</span>
                </div>
              ))}
            </div>

            {/* Financial ledger */}
            <div className="border-t border-gray-50 pt-4 space-y-2 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-gray-800 font-bold">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment Fees</span>
                <span>{order.deliveryCharges === 0 ? 'FREE' : `₹${order.deliveryCharges}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-brand-green">
                  <span>Discount Saved</span>
                  <span>- ₹{order.discount}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm text-gray-900 font-black">
                <span>Amount Paid</span>
                <span className="text-brand-green font-black">₹{order.total}</span>
              </div>
            </div>

            {/* Meta details */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600 font-semibold space-y-3">
              <div className="flex items-center space-x-2">
                {order.isPickup ? <Store className="w-4 h-4 text-brand-orange" /> : <Truck className="w-4 h-4 text-brand-green" />}
                <span className="font-extrabold uppercase text-[9px] tracking-widest text-gray-400 block">Fulfilment Slot:</span>
              </div>
              <span className="block pl-6 -mt-1 font-bold text-gray-800">{order.timeSlot}</span>
              
              <div className="flex items-start space-x-2 pt-1">
                <MapPin className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase text-[9px] tracking-widest text-gray-400 block">Deliver Location:</span>
                  <p className="mt-0.5 text-gray-800 font-bold">
                    {order.address ? `${order.address.houseNumber}, ${order.address.area}` : 'Arajuma Store GS Road Outlet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
