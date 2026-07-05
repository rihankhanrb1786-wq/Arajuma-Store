/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

interface WishlistProps {
  wishlist: string[];
  onNavigate: (page: string, params?: any) => void;
  cart: any[];
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
}

export default function Wishlist({
  wishlist,
  onNavigate,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick
}: WishlistProps) {
  // Find products matching wishlist IDs
  const wishlistProducts = useMemo(() => {
    return PRODUCTS.filter(p => wishlist.includes(p.id));
  }, [wishlist]);

  const getCartQty = (p: Product) => {
    const item = cart.find(c => c.product.id === p.id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="wishlist-page-root">
      {/* Title & back buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-brand-green mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to storefront</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Saved Wishlist
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Review and easily move your favorite groceries to your shopping cart
          </p>
        </div>

        <span className="text-xs font-black text-gray-500 bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-lg">
          {wishlistProducts.length} Items Saved
        </span>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="wishlist-products-grid">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInWishlist={true}
              cartQuantity={getCartQty(product)}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              onToggleWishlist={onToggleWishlist}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto space-y-4" id="empty-wishlist-fallback">
          <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center text-red-500 mx-auto">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h2 className="font-black text-gray-800 text-lg">Your Wishlist is Empty</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            You haven't saved any grocery items to your wishlist yet. Tap the heart icons on product cards while browsing to save them here.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all border border-emerald-500"
          >
            Explore Fresh Groceries
          </button>
        </div>
      )}
    </div>
  );
}
