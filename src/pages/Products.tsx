/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  Search, 
  X, 
  Tag, 
  Star, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, PRODUCTS, BRANDS } from '../data/mockData';
import { listenCategories, listenBrands } from '../lib/firebase';
import { Product, Category, Brand } from '../types';
import ProductCard from '../components/ProductCard';

interface ProductsProps {
  onNavigate: (page: string, params?: any) => void;
  cart: any[];
  wishlist: string[];
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
  searchQuery?: string;
  initialFilter?: string; // 'deals' | 'best' | 'new'
  initialBrand?: string;
  products?: Product[];
}

export default function Products({
  onNavigate,
  cart,
  wishlist,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick,
  searchQuery = '',
  initialFilter,
  initialBrand,
  products = PRODUCTS
}: ProductsProps) {
  // Real-time categories and brands list state
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const [brandsList, setBrandsList] = useState<Brand[]>(BRANDS);

  useEffect(() => {
    const unsubCats = listenCategories((cats) => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats);
      }
    });
    const unsubBrands = listenBrands((brands) => {
      if (brands && brands.length > 0) {
        setBrandsList(brands);
      }
    });
    return () => {
      unsubCats();
      unsubBrands();
    };
  }, []);

  // Filters State
  const [search, setSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || 'all');
  const [priceRange, setPriceRange] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity');
  
  // Tag filter states (Deals, Best seller, New arrival)
  const [onlyDeals, setOnlyDeals] = useState(initialFilter === 'deals');
  const [onlyBestsellers, setOnlyBestsellers] = useState(initialFilter === 'best');
  const [onlyNew, setOnlyNew] = useState(initialFilter === 'new');

  // Sync initial brand or search changes if any
  React.useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  // Handle clearing all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange(500);
    setMinRating(0);
    setSortBy('popularity');
    setOnlyDeals(false);
    setOnlyBestsellers(false);
    setOnlyNew(false);
  };

  // Filter and sort items dynamically
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || 
             p.description.toLowerCase().includes(q) ||
             p.brand.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 3. Brand Filter
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // 4. Price Filter
    result = result.filter(p => p.price <= priceRange);

    // 5. Rating Filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // 6. Badges Filters
    if (onlyDeals) result = result.filter(p => p.isDealsOfTheDay);
    if (onlyBestsellers) result = result.filter(p => p.isBestSeller);
    if (onlyNew) result = result.filter(p => p.isNewArrival);

    // 7. Sort Logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [search, selectedCategory, selectedBrand, priceRange, minRating, onlyDeals, onlyBestsellers, onlyNew, sortBy]);

  const getCartQty = (p: Product) => {
    const item = cart.find(c => c.product.id === p.id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="products-catalog-page">
      {/* Title & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">Catalog</span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Browse Groceries
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Found <span className="text-brand-green font-bold">{filteredProducts.length}</span> high-grade items
          </p>
        </div>

        {/* Search & Sort controllers */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 md:w-64 max-w-sm">
            <input
              type="text"
              placeholder="Search in results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-gray-800 text-xs pl-8 pr-8 py-2 rounded-lg border border-gray-200 focus:border-brand-green outline-none focus:ring-2 focus:ring-green-50"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Menu */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg outline-none focus:border-brand-green font-bold cursor-pointer"
          >
            <option value="popularity">Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Filter Sidebar */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 h-fit sticky top-28" id="filters-sidebar">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-1.5 text-brand-green" />
              Filter Board
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-brand-orange hover:text-brand-orange-hover font-bold flex items-center space-x-1 cursor-pointer"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category List Filter */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all' 
                    ? 'bg-emerald-50 text-brand-green' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                    selectedCategory === cat.slug 
                      ? 'bg-emerald-50 text-brand-green' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Brands</h4>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg outline-none focus:border-brand-green font-semibold cursor-pointer"
            >
              <option value="all">All Brands</option>
              {brandsList.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
              <option value="Local Fresh">Local Fresh</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-bold text-brand-green">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
              <span>₹20</span>
              <span>₹500</span>
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Minimum Rating</h4>
            <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              {[0, 3, 4, 4.5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`flex-1 text-[10px] sm:text-xs font-bold py-1.5 rounded-md transition-all cursor-pointer text-center ${
                    minRating === stars
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {stars === 0 ? 'All' : `${stars}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* Filters by badges (Deals, Best, New) */}
          <div className="space-y-3 pt-3 border-t border-gray-50">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Quick Filters</h4>
            
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-gray-600 select-none">
              <input
                type="checkbox"
                checked={onlyDeals}
                onChange={(e) => setOnlyDeals(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green cursor-pointer accent-brand-green"
              />
              <span className="flex items-center">
                Today's Deals
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-gray-600 select-none">
              <input
                type="checkbox"
                checked={onlyBestsellers}
                onChange={(e) => setOnlyBestsellers(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green cursor-pointer accent-brand-green"
              />
              <span>Popular Bestsellers</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-gray-600 select-none">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(e) => setOnlyNew(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green cursor-pointer accent-brand-green"
              />
              <span>New Arrivals</span>
            </label>
          </div>
        </aside>

        {/* Right Side: Product Catalog Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6" id="catalog-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isInWishlist={wishlist.includes(product.id)}
                  cartQuantity={getCartQty(product)}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  onToggleWishlist={onToggleWishlist}
                  onProductClick={onProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto mt-12 space-y-4" id="no-products-fallback">
              <div className="bg-orange-50 p-4 rounded-full w-16 h-16 flex items-center justify-center text-brand-orange mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-black text-gray-800 text-lg">No Groceries Found</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                We couldn't find any grocery items matching your selected filter criteria. Try resetting the filter board or modifying your search words.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all border border-emerald-500"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
