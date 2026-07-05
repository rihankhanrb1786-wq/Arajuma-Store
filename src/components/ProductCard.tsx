/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Plus, Minus, Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  cartQuantity: number;
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
  key?: React.Key;
}

export default function ProductCard({
  product,
  isInWishlist,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick
}: ProductCardProps) {
  // Calculate discount percentage
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Determine if it's out of stock
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex flex-col relative group overflow-hidden h-full"
      id={`product-card-${product.id}`}
    >
      {/* Badges and Wishlist on top of image */}
      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1">
        {discountPercent > 0 && !isOutOfStock && (
          <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-brand-dark text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Bestseller
          </span>
        )}
        {product.isDealsOfTheDay && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Today's Deal
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full border border-gray-100 shadow-sm cursor-pointer transition-all ${
          isInWishlist 
            ? 'bg-red-50 text-red-500 hover:bg-red-100' 
            : 'bg-white text-gray-400 hover:text-red-500 hover:bg-gray-50'
        }`}
        title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className="w-4 h-4 fill-current" />
      </button>

      {/* Product Image Wrapper */}
      <div 
        onClick={() => onProductClick(product)}
        className="w-full h-40 sm:h-44 bg-gray-50 relative overflow-hidden flex items-center justify-center cursor-pointer p-4"
      >
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between text-left">
        <div className="cursor-pointer" onClick={() => onProductClick(product)}>
          {/* Brand & Unit Size */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold tracking-wide uppercase">
            <span>{product.brand}</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{product.unit}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-800 text-sm mt-1.5 line-clamp-2 leading-tight group-hover:text-brand-green transition-colors">
            {product.name}
          </h3>

          {/* Star Ratings */}
          <div className="flex items-center space-x-1 mt-1">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-gray-700">{product.rating}</span>
            <span className="text-gray-300 text-[10px]">•</span>
            <span className="text-[10px] text-gray-400 font-medium">{product.reviewsCount} reviews</span>
          </div>
        </div>

        {/* Price & Cart Actions Block */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-800 font-black text-base">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-xs font-semibold">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Blinkit/BigBasket style Add to Cart or Quantity Selector */}
          <div className="w-[100px]" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button 
                disabled
                className="w-full bg-gray-100 text-gray-400 border border-gray-200 py-1.5 rounded-lg text-xs font-bold uppercase cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-brand-green text-white border border-brand-green-hover rounded-lg shadow-sm font-bold overflow-hidden h-[34px]">
                <button
                  onClick={() => onRemoveFromCart(product)}
                  className="flex-1 py-1 px-2.5 hover:bg-brand-green-hover flex justify-center items-center cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs px-1 select-none font-black min-w-[16px] text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex-1 py-1 px-2.5 hover:bg-brand-green-hover flex justify-center items-center cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-white text-brand-green hover:bg-brand-green hover:text-white border border-emerald-500 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center space-x-1 shadow-sm hover:shadow transition-all cursor-pointer h-[34px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
