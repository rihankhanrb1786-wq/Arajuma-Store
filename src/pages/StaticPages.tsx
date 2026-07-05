/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  Award, 
  ShieldAlert, 
  FileCheck 
} from 'lucide-react';

interface StaticPagesProps {
  pageType: 'about' | 'contact' | 'privacy-policy' | 'terms';
  onNavigate: (page: string) => void;
}

export default function StaticPages({ pageType, onNavigate }: StaticPagesProps) {
  // Contact Form Submission Simulation
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="static-page-root">
      {/* Back to home */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-brand-green mb-6 cursor-pointer group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to storefront</span>
      </button>

      {/* Renders dynamic view based on pageType */}
      {pageType === 'about' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8 text-left">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-brand-green text-xs font-bold tracking-widest uppercase bg-emerald-100 px-3 py-1 rounded-full">
              Our Journey
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              About Jitu Moni Grocery
            </h1>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Serving premium household ingredients and organic freshness directly to Guwahati families since 2018
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-4 text-xs font-medium text-gray-600 leading-relaxed">
              <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Our Humble Story</h3>
              <p>
                Jitu Moni Grocery started as a small local fruit and vegetable outlet in Christian Basti, Guwahati. Over the years, driven by a deep love for absolute clean quality and farm-fresh ingredients, we grew into Guwahati's most trusted online grocery outlet.
              </p>
              <p>
                We collaborate directly with local organic farmers across Assam to source premium robusta bananas, sweet hybrid tomatoes, fresh leafy cauliflowers, and native grains. Every item undergoes a rigorous 4-step cleaning and grading process before being loaded into our trucks.
              </p>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 space-y-4 text-xs font-semibold text-gray-700">
              <h3 className="font-extrabold text-sm text-emerald-900 uppercase tracking-wider flex items-center">
                <Award className="w-5 h-5 mr-1.5 text-brand-orange" /> Our Core Values
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-brand-green mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>100% Sourced Honestly</strong>: No artificial preservatives or ripening agents on vegetables and fruits.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-brand-green mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Superfast Service</strong>: Reliable slot delivery or instant packing for quick 15-minute pickups.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-brand-green mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Fair Farm Pricing</strong>: We pay local Assam farmers fair rates while offering wholesale-like prices to our clients.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {pageType === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          {/* Info cards */}
          <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Customer Support
            </h1>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Have questions about your order or refund? Reach out to our Guwahati help desk instantly.
            </p>

            <div className="space-y-4 text-xs font-semibold text-gray-600">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-800 font-bold">Physical Outlet Address</h4>
                  <p className="mt-1 font-medium text-gray-500">Christian Basti, GS Road, Guwahati, Assam - 781005</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-800 font-bold">Support Hotlines</h4>
                  <p className="mt-1 font-medium text-gray-500">+91 98765 43210 / +91 91234 56789</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-800 font-bold">Email Help Desk</h4>
                  <p className="mt-1 font-medium text-gray-500">support@jitumonigrocery.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-800 font-bold">Store Operating Hours</h4>
                  <p className="mt-1 font-medium text-gray-500">Monday - Sunday: 07:00 AM - 09:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3">
              Send an Instant Message
            </h2>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase tracking-widest text-[9px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase tracking-widest text-[9px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase tracking-widest text-[9px]">How can we help?</label>
                <textarea
                  required
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="Type your feedback, bulk order requests, or query here..."
                  className="w-full bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green focus:bg-white transition-all leading-relaxed font-semibold text-gray-800"
                />
              </div>

              {contactSuccess && (
                <p className="text-emerald-600 text-xs font-bold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" />
                  Thanks! We received your message and will reply within 4 hours.
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-green-hover text-white py-2.5 rounded-xl font-bold uppercase cursor-pointer shadow transition-all border border-emerald-500"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {pageType === 'privacy-policy' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-left text-xs font-medium text-gray-600 leading-relaxed">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
            <span className="text-brand-green text-xs font-bold tracking-widest uppercase bg-emerald-100 px-3 py-1 rounded-full">
              Data Safety
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Privacy Policy Guidelines
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Last updated: July 2026
            </p>
          </div>

          <p>
            At Jitu Moni Grocery, we hold your household privacy and safety parameters in the highest regard. This document details how we securely compile, handle, and store user credentials when accessing our storefront.
          </p>

          <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider pt-4">1. Data We Securely Compile</h3>
          <p>
            We compile basic contact credentials (such as Google Authentication Email, Name, phone hotlines, and delivery address logs) solely to arrange fast slot delivery and handle order receipt workflows.
          </p>

          <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider pt-4">2. Cookies & Local Storage Usage</h3>
          <p>
            Our storefront accesses standard client-side <code>localStorage</code> purely to persist your shopping cart inventory, saved wishlist items, and default location tags. We do not use third-party tracking pixels or distribute analytical logs to advertisement agencies.
          </p>

          <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider pt-4">3. Security Audits</h3>
          <p>
            Your information is stored inside cloud-encrypted environments protected by rigorous authorization rules. Our payment partners conform strictly to PCI-DSS specifications to guarantee checkout safety.
          </p>
        </div>
      )}

      {pageType === 'terms' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-left text-xs font-medium text-gray-600 leading-relaxed">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
            <span className="text-brand-green text-xs font-bold tracking-widest uppercase bg-emerald-100 px-3 py-1 rounded-full">
              Legal Agreement
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Last updated: July 2026
            </p>
          </div>

          <p>
            Welcome to Jitu Moni Grocery. By accessing our web application, placing orders, or choosing store pickups, you agree to conform strictly to the terms of use listed below.
          </p>

          <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider pt-4">1. Fulfillment Delivery & Slot Capacities</h3>
          <p>
            Home deliveries are arranged strictly during your chosen slot duration. In case of heavy monsoon rains, roadblocks, or unavoidable traffic in Guwahati, delivery thresholds can extend by up to 45 minutes, which will be communicated proactively.
          </p>

          <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider pt-4">2. Minimum Checkout Amount & Charges</h3>
          <p>
            A minimum checkout threshold of ₹149 is mandatory to place orders. Deliveries are charged at ₹39 standard fee unless the order subtotal matches or exceeds the ₹499 free-delivery limit.
          </p>

          <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider pt-4">3. Returns & Immediate Refunds</h3>
          <p>
            We maintain an open return policy. Fresh fruits, dairy, or vegetables can be rejected directly at the doorstep if quality standards fail. Refund assets will be credited directly to your payment source within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}
