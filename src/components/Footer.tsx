/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Store, ShieldCheck, Clock, MapPin, Phone, Mail, Award, RotateCcw } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-brand-dark text-gray-300 pt-16 pb-8 border-t border-gray-800" id="footer-root">
      {/* 4 Pillars of Arajuma Store */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-gray-800" id="footer-pillars">
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-950 p-3 rounded-xl border border-emerald-800 text-brand-green">
            <Clock className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Superfast Delivery</h4>
            <p className="text-xs text-gray-400 mt-1">Get your groceries delivered to your doorstep within 90 minutes or your scheduled slot.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-950 p-3 rounded-xl border border-emerald-800 text-brand-green">
            <Store className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Instant Store Pickup</h4>
            <p className="text-xs text-gray-400 mt-1">Order online and pick up your packed items from our store in less than 15 minutes. Save 5%.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-950 p-3 rounded-xl border border-emerald-800 text-brand-green">
            <ShieldCheck className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">100% Quality Assured</h4>
            <p className="text-xs text-gray-400 mt-1">If you are not satisfied with the quality of vegetables, fruits, or dairy products, we refund instantly.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-950 p-3 rounded-xl border border-emerald-800 text-brand-green">
            <RotateCcw className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Hassle-Free Returns</h4>
            <p className="text-xs text-gray-400 mt-1">No questions asked return policy. Return at the door during delivery or directly at our outlet.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-12" id="footer-links-grid">
        {/* Brand Block */}
        <div className="space-y-4">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-black text-white tracking-tight">
              ARAJUMA
              <span className="text-brand-orange ml-1 text-xl font-bold">STORE</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase -mt-1">Guwahati\'s Favourite Outlet</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            We are Assam\'s premier grocery delivery service. Providing the absolute highest grade of handpicked fruits, organic vegetables, dairy, grains, and kitchen essentials to your homes.
          </p>
          <div className="flex space-x-3 pt-2">
            <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white hover:bg-brand-green cursor-pointer">Fb</span>
            <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white hover:bg-brand-green cursor-pointer">Insta</span>
            <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white hover:bg-brand-green cursor-pointer">X</span>
          </div>
        </div>

        {/* Quick Navigate */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Quick Navigate</h4>
          <ul className="space-y-3 text-xs">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                Home / Main Hub
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                Browse All Products
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('cart')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                View My Shopping Cart
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('wishlist')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                My Saved Wishlist
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('orders')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                My Order History
              </button>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Trust & Policies</h4>
          <ul className="space-y-3 text-xs">
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                About Our Story
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                Privacy Policy Guidelines
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                Terms of Use & Delivery Conditions
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-brand-green transition-colors cursor-pointer text-left">
                Help Center & Return Queries
              </button>
            </li>
          </ul>
        </div>

        {/* Store Contacts */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Physical Store Outlet</h4>
          <div className="flex items-start space-x-2 text-xs text-gray-400">
            <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Arajuma Store, Christian Basti, GS Road, Guwahati, Assam - 781005
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Phone className="w-4 h-4 text-brand-green flex-shrink-0" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Mail className="w-4 h-4 text-brand-green flex-shrink-0" />
            <span>support@arajumastore.com</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom info */}
      <div className="max-w-7xl mx-auto px-4 pt-8 mt-4 border-t border-gray-800 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0" id="footer-base">
        <p>© 2026 Arajuma Store Private Limited. All Rights Reserved.</p>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-gray-400">
            <Award className="w-4 h-4 text-brand-orange mr-1" />
            Assam Premium Quality Award 2026
          </span>
          <span className="hidden sm:inline">|</span>
          <span>Made for Guwahati & Assam Food Lovers</span>
        </div>
      </div>
    </footer>
  );
}
