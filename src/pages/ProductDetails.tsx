/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Plus, 
  Minus, 
  Star, 
  ShieldCheck, 
  ShoppingBag, 
  Truck, 
  RefreshCw, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

interface ProductDetailsProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
  cart: any[];
  wishlist: string[];
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
}

export default function ProductDetails({
  product,
  onNavigate,
  cart,
  wishlist,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick
}: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'benefits'>('details');
  const [zoomedImage, setZoomedImage] = useState(false);

  // Find dynamic cart quantity
  const cartQty = useMemo(() => {
    const item = cart.find(c => c.product.id === product.id);
    return item ? item.quantity : 0;
  }, [cart, product.id]);

  // Find related products in same category
  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product.category, product.id]);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="product-detail-page">
      {/* Back button */}
      <button
        onClick={() => onNavigate('products')}
        className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-brand-green mb-8 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        <span>Return to Catalog Browse</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Left: Interactive Image and Zoom */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div 
            onClick={() => setZoomedImage(!zoomedImage)}
            className={`w-full aspect-square bg-gray-50 rounded-2xl p-6 flex items-center justify-center relative cursor-zoom-in group overflow-hidden border border-gray-50 ${
              zoomedImage ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <img
              src={product.image}
              alt={product.name}
              className={`max-h-full max-w-full object-contain transition-transform duration-500 ${
                zoomedImage ? 'scale-150' : 'group-hover:scale-105'
              }`}
              referrerPolicy="no-referrer"
            />
            {discountPercent > 0 && !isOutOfStock && (
              <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Save {discountPercent}%
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center font-black text-white tracking-widest text-lg uppercase">
                Out Of Stock
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-3">
            * Click Image to toggle Zoom Scale
          </p>
        </div>

        {/* Right: Specifications & Active cart buttons */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand, Unit & Stock alert */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-brand-orange uppercase tracking-widest">
                {product.brand}
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full">
                  Unit: {product.unit}
                </span>
                {product.stock > 0 && product.stock <= 20 ? (
                  <span className="bg-orange-50 text-brand-orange font-bold px-3 py-1 rounded-full animate-pulse border border-orange-100">
                    Only {product.stock} left in stock!
                  </span>
                ) : product.stock > 20 ? (
                  <span className="bg-emerald-50 text-brand-green font-bold px-3 py-1 rounded-full border border-emerald-100">
                    In Stock (Instant Pickup)
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full border border-red-100">
                    Out Of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary block */}
            <div className="flex items-center space-x-3 py-2 border-y border-gray-100">
              <div className="flex items-center space-x-1 text-xs">
                <div className="bg-amber-400 text-white font-black px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-sm">
                  <span>{product.rating}</span>
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-gray-500 font-bold pl-1">
                  {product.reviewsCount} Customer Reviews
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Ref: {product.id.toUpperCase()}
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-black text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 line-through text-lg font-bold">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md">
                    You Save ₹{product.originalPrice - product.price}!
                  </span>
                </div>
              )}
            </div>

            {/* Shopping info box */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-600">
                <Truck className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>90-Min Fast Home Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-600">
                <ShieldCheck className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>100% Quality Assured Refund</span>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="pt-4">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-4 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'details' 
                      ? 'border-b-2 border-brand-green text-brand-green' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 px-4 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'ingredients' 
                      ? 'border-b-2 border-brand-green text-brand-green' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Ingredients Info
                </button>
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`pb-2 px-4 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'benefits' 
                      ? 'border-b-2 border-brand-green text-brand-green' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Health Benefits
                </button>
              </div>

              {/* Tab Contents */}
              <div className="py-4 text-xs text-gray-600 leading-relaxed font-medium">
                {activeTab === 'details' && (
                  <p>{product.description}</p>
                )}
                {activeTab === 'ingredients' && (
                  <p>{product.ingredients || 'Natural, organic single-ingredient source. 100% clean and processed under state audits.'}</p>
                )}
                {activeTab === 'benefits' && (
                  <p>{product.benefits || 'Packed with trace minerals, fibers, and essential micronutrients. Great choice for dietary nutrition.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cart Buttons & Wishlist */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Quantity Selector or Add Button */}
            <div className="flex-1 flex items-stretch h-12">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 border border-gray-200 rounded-xl font-bold uppercase cursor-not-allowed text-xs flex items-center justify-center"
                >
                  Sold Out / Temporarily Unavailable
                </button>
              ) : cartQty > 0 ? (
                <div className="w-full flex items-center justify-between bg-brand-green text-white rounded-xl shadow-sm border border-brand-green-hover font-bold text-sm overflow-hidden p-1">
                  <button
                    onClick={() => onRemoveFromCart(product)}
                    className="w-12 hover:bg-brand-green-hover flex justify-center items-center cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-center text-base font-black min-w-[40px]">
                    {cartQty} {cartQty === 1 ? 'Unit' : 'Units'} in Cart
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-12 hover:bg-brand-green-hover flex justify-center items-center cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-brand-green hover:bg-brand-green-hover text-white rounded-xl font-extrabold text-sm shadow flex items-center justify-center space-x-2 cursor-pointer transition-all border border-emerald-500"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO SHOPPING CART</span>
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`h-12 px-6 rounded-xl border flex items-center justify-center font-bold text-xs space-x-2 cursor-pointer transition-all ${
                wishlist.includes(product.id)
                  ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
              <span>{wishlist.includes(product.id) ? 'SAVED' : 'SAVE TO WISHLIST'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ratings Graph & Visual Review Log */}
      <section className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm" id="product-reviews-section">
        <h2 className="font-black text-gray-900 text-lg sm:text-xl mb-6">
          Ratings & Reviews Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-gray-100 pb-8 mb-8">
          {/* Average circle */}
          <div className="md:col-span-4 text-center space-y-2">
            <span className="text-5xl font-black text-gray-900 leading-none">{product.rating}</span>
            <div className="flex items-center justify-center text-amber-400 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
              Based on {product.reviewsCount} customer audits
            </p>
          </div>

          {/* Bar chart */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center text-xs font-semibold text-gray-600 space-x-2">
              <span className="w-12">5 Star</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[78%]" />
              </div>
              <span className="w-8 text-right font-bold">78%</span>
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-600 space-x-2">
              <span className="w-12">4 Star</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[14%]" />
              </div>
              <span className="w-8 text-right font-bold">14%</span>
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-600 space-x-2">
              <span className="w-12">3 Star</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[6%]" />
              </div>
              <span className="w-8 text-right font-bold">6%</span>
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-600 space-x-2">
              <span className="w-12">2 Star</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-orange-400 h-full w-[2%]" />
              </div>
              <span className="w-8 text-right font-bold">2%</span>
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-600 space-x-2">
              <span className="w-12">1 Star</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[0%]" />
              </div>
              <span className="w-8 text-right font-bold">0%</span>
            </div>
          </div>
        </div>

        {/* Written Review list */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2 font-bold text-gray-800">
                <span className="bg-emerald-100 text-brand-green w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">PK</span>
                <span>Prashant Kalita</span>
              </div>
              <span className="text-gray-400 font-semibold">2 days ago</span>
            </div>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              "Outstanding freshness. The item is exactly as pictured, properly cleaned, and delivered in perfect temperature-controlled baskets. Will buy again!"
            </p>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" id="product-related-section">
          <h2 className="font-black text-gray-900 text-lg sm:text-xl mb-6">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isInWishlist={wishlist.includes(p.id)}
                cartQuantity={cartQty} // using calculated cart quantity
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                onToggleWishlist={onToggleWishlist}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
