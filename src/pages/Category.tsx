/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, Filter, SlidersHorizontal, Grid3X3, ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { Product, Category as CategoryType } from '../types';
import ProductCard from '../components/ProductCard';
import { listenCategories } from '../lib/firebase';

interface CategoryProps {
  categorySlug: string;
  onNavigate: (page: string, params?: any) => void;
  cart: any[];
  wishlist: string[];
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
  products: Product[];
}

export default function Category({
  categorySlug,
  onNavigate,
  cart,
  wishlist,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick,
  products
}: CategoryProps) {
  const [categoriesList, setCategoriesList] = useState<CategoryType[]>([]);

  useEffect(() => {
    const unsub = listenCategories((cats) => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats);
      }
    });
    return unsub;
  }, []);

  // Find current category details
  const currentCategory = useMemo(() => {
    const list = categoriesList.length ? categoriesList : CATEGORIES;
    return list.find(c => c.slug === categorySlug) || list[0];
  }, [categorySlug, categoriesList]);

  // Find products matching current category
  const categoryProducts = useMemo(() => {
    return products.filter(p => p.category === categorySlug);
  }, [categorySlug, products]);

  const getCartQty = (p: Product) => {
    const item = cart.find(c => c.product.id === p.id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="category-page-root">
      {/* Back Button and Navigation */}
      <div className="flex items-center justify-between mb-6" id="category-header">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center text-xs font-black text-gray-500 hover:text-brand-green uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Home
        </button>
        <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
          Catalog • {categorySlug.toUpperCase()}
        </span>
      </div>

      {/* Hero Banner Section */}
      {currentCategory && (
        <div 
          className="relative rounded-3xl overflow-hidden mb-8 h-44 sm:h-56 flex items-center bg-brand-dark"
          id="category-hero"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 to-brand-dark/40 z-10" />
          <img 
            src={currentCategory.image} 
            alt={currentCategory.name} 
            className="absolute inset-0 w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-20 px-6 sm:px-12 max-w-lg">
            <span className="bg-brand-orange text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-md">Fresh Deals</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 leading-tight">
              {currentCategory.name}
            </h1>
            <p className="text-xs text-gray-300 mt-1.5 font-medium">
              Handpicked premium items sourced directly from certified orchards and clean distribution channels.
            </p>
          </div>
        </div>
      )}

      {/* Catalog Filters Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl mb-8 shadow-sm text-xs" id="category-filter-bar">
        <div className="flex items-center space-x-2 font-bold text-gray-700">
          <SlidersHorizontal className="w-4 h-4 text-brand-green" />
          <span>Filters:</span>
          <span className="bg-gray-100 text-gray-600 font-extrabold px-2 py-0.5 rounded-lg text-[10px]">
            {categoryProducts.length} Products Found
          </span>
        </div>
        <div className="flex items-center space-x-2 font-black text-gray-500 uppercase tracking-wider">
          <Grid3X3 className="w-4 h-4 text-gray-400" />
          <span>Layout: Grid</span>
        </div>
      </div>

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="category-products-grid">
          {categoryProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              cartQuantity={getCartQty(p)}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlist.includes(p.id)}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm" id="empty-category-view">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-400 mb-3">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-black text-gray-800 text-sm">No Products Available</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
            We are currently stocking new items for this category. Please check back later or browse other grocery categories!
          </p>
          <button 
            onClick={() => onNavigate('home')}
            className="mt-4 px-5 py-2.5 bg-brand-green hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-sm transition-all uppercase tracking-wider cursor-pointer"
          >
            Browse Other Categories
          </button>
        </div>
      )}
    </div>
  );
}
