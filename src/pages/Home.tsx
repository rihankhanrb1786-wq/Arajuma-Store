/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  ShoppingBag, 
  ChevronRight, 
  Tag, 
  Award, 
  Star, 
  CheckCircle, 
  Store, 
  Truck,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';
import { CATEGORIES, BRANDS, PRODUCTS } from '../data/mockData';
import { listenCategories, listenBrands } from '../lib/firebase';
import { Product, Category, Brand } from '../types';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
  cart: any[];
  wishlist: string[];
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onProductClick: (p: Product) => void;
  isPickup: boolean;
  onTogglePickup: (pickup: boolean) => void;
  products?: Product[];
}

export default function Home({
  onNavigate,
  cart,
  wishlist,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick,
  isPickup,
  onTogglePickup,
  products = PRODUCTS
}: HomeProps) {
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

  // Flash sale products (p-7, p-9)
  const flashSaleProducts = products.filter(p => p.isFlashSale);
  // Today's deals
  const dealsProducts = products.filter(p => p.isDealsOfTheDay);
  // Best sellers
  const bestSellers = products.filter(p => p.isBestSeller);
  // New arrivals
  const newArrivals = products.filter(p => p.isNewArrival);

  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 48, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 3, minutes: 0, seconds: 0 }; // Restart loop
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      onNavigate('products', { search: mobileSearchQuery });
    }
  };

  const getCartQty = (p: Product) => {
    const item = cart.find(c => c.product.id === p.id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-12 pb-16" id="homepage-root">
      {/* Search Bar for Mobile View Only */}
      <div className="px-4 mt-4 md:hidden" id="mobile-only-search">
        <form onSubmit={handleMobileSearch} className="relative flex">
          <input
            type="text"
            placeholder="Search milk, butter, apples, cauliflower..."
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            className="w-full bg-white text-gray-800 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-brand-green text-sm transition-all"
          />
          <button type="submit" className="absolute right-0 top-0 bottom-0 px-3.5 text-brand-green cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Hero Banner Section */}
      <section className="px-4" id="home-hero-slider-section">
        <HeroSlider onNavigate={onNavigate} />
      </section>

      {/* Categories Grid Section */}
      <section className="px-4 max-w-7xl mx-auto" id="home-categories-section">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center">
              Explore Categories
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Fresh ingredients & essentials sorted for you</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoriesList.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('category', { categorySlug: cat.slug })}
              className="bg-white p-3.5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md text-center cursor-pointer transition-all flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-md" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-brand-green transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section with Real Countdown */}
      <section className="px-4 max-w-7xl mx-auto bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-orange-400" id="home-flash-sale-section">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full translate-x-12 translate-y-12 z-0" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center w-max">
              <Flame className="w-3.5 h-3.5 text-yellow-300 mr-1 animate-pulse" />
              Hurry Up! Limited Stock
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2.5">
              FLASH SALE DEALS
            </h2>
            <p className="text-xs sm:text-sm text-orange-50 font-medium mt-1">
              Top premium groceries at rock bottom prices. Max 2 units per customer.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-3 bg-black/20 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
            <span className="text-xs font-bold text-orange-100 flex items-center mr-1">
              <Clock className="w-4 h-4 mr-1 text-yellow-300" />
              Ends In:
            </span>
            <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <span className="bg-white text-brand-orange text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center shadow">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-orange-100 uppercase mt-1 font-bold">Hrs</span>
              </div>
              <span className="text-white font-black text-lg self-start mt-0.5">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-white text-brand-orange text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center shadow">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-orange-100 uppercase mt-1 font-bold">Min</span>
              </div>
              <span className="text-white font-black text-lg self-start mt-0.5">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-white text-brand-orange text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center shadow">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-orange-100 uppercase mt-1 font-bold">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10 text-gray-800">
          {flashSaleProducts.slice(0, 4).map((product) => {
            // Apply flash sale price instead of standard price
            const finalProduct = { ...product, price: product.flashSalePrice || product.price };
            return (
              <ProductCard
                key={product.id}
                product={finalProduct}
                isInWishlist={wishlist.includes(product.id)}
                cartQuantity={getCartQty(product)}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                onToggleWishlist={onToggleWishlist}
                onProductClick={onProductClick}
              />
            );
          })}
        </div>
      </section>

      {/* Today's Deals Section */}
      <section className="px-4 max-w-7xl mx-auto" id="home-deals-section">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center">
              <Tag className="w-5 h-5 mr-1.5 text-brand-orange" />
              Today's Super Deals
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Exclusive prices refreshed every day at midnight</p>
          </div>
          <button
            onClick={() => onNavigate('products', { filter: 'deals' })}
            className="text-brand-green hover:text-brand-green-hover text-xs font-bold flex items-center cursor-pointer"
          >
            <span>See All Deals</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dealsProducts.map((product) => (
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
      </section>

      {/* Home Delivery vs Store Pickup Promotion */}
      <section className="px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6" id="home-delivery-pickup-banner">
        {/* Pickup banner */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-emerald-800 shadow relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
            <Store className="w-48 h-48" />
          </div>
          <div>
            <span className="bg-brand-orange text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              Get Extra 5% Off
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-3">PICKUP DIRECT FROM STORE</h3>
            <p className="text-xs text-emerald-100 mt-2 max-w-md leading-relaxed">
              Skip delivery wait times completely! Order via app, select 'Store Pickup', and we will keep your grocery box ready to carry within 15 minutes.
            </p>
          </div>
          <button
            onClick={() => { onTogglePickup(true); onNavigate('products'); }}
            className="mt-6 bg-white text-emerald-950 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 w-max cursor-pointer transition-all shadow-sm"
          >
            <span>Activate Store Pickup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Delivery banner */}
        <div className="bg-gradient-to-br from-gray-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-gray-800 shadow relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
            <Truck className="w-48 h-48" />
          </div>
          <div>
            <span className="bg-brand-green text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              Slot-Based Safety
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-3">CONTACTLESS HOME DELIVERY</h3>
            <p className="text-xs text-gray-300 mt-2 max-w-md leading-relaxed">
              Enjoy high-standard home delivery from our dedicated executives. Pick a convenient time slot that fits your day perfectly. Standard safety protocols strictly followed.
            </p>
          </div>
          <button
            onClick={() => { onTogglePickup(false); onNavigate('products'); }}
            className="mt-6 bg-brand-green hover:bg-brand-green-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 w-max cursor-pointer transition-all shadow-sm"
          >
            <span>Browse for Home Delivery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="px-4 max-w-7xl mx-auto" id="home-bestsellers-section">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center">
              <Award className="w-5 h-5 mr-1.5 text-amber-500 animate-spin-slow" />
              Popular Best Sellers
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Guwahati's most frequently ordered kitchen staples</p>
          </div>
          <button
            onClick={() => onNavigate('products', { filter: 'best' })}
            className="text-brand-green hover:text-brand-green-hover text-xs font-bold flex items-center cursor-pointer"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
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
      </section>

      {/* Popular Brands Section */}
      <section className="px-4 max-w-7xl mx-auto" id="home-brands-section">
        <div className="text-center max-w-lg mx-auto mb-8">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Trusted Partner Brands</h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">We source from 100% genuine and verified brands</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          {brandsList.map((b) => (
            <div
              key={b.id}
              onClick={() => onNavigate('products', { brand: b.name })}
              className="flex flex-col items-center justify-center p-4 border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/20 rounded-2xl transition-all cursor-pointer group"
            >
              <img 
                src={b.logo} 
                alt={b.name} 
                className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors mt-2">{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="px-4 max-w-7xl mx-auto" id="home-new-arrivals-section">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center">
              <ShoppingBag className="w-5 h-5 mr-1.5 text-teal-600" />
              Just Landed / New Arrivals
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Check out our latest fresh arrivals this week</p>
          </div>
          <button
            onClick={() => onNavigate('products', { filter: 'new' })}
            className="text-brand-green hover:text-brand-green-hover text-xs font-bold flex items-center cursor-pointer"
          >
            <span>See New Arrivals</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
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
      </section>

      {/* Customer Reviews Slider */}
      <section className="px-4 max-w-7xl mx-auto bg-gray-50 py-12 rounded-3xl border border-gray-100" id="home-reviews-section">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-brand-green text-xs font-bold tracking-widest uppercase bg-emerald-100 px-3 py-1 rounded-full">
            Our Happy Shoppers
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-3 tracking-tight">Loved by Assam Households</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Real ratings left by active families in Guwahati</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between relative">
            <div className="absolute top-6 right-6 text-gray-100 text-5xl font-serif">“</div>
            <div className="space-y-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                "Arajuma Store is my go-to for daily fresh vegetables. The Robusta Bananas and Hybrid Tomatoes are super clean and priced cheaper than open market vendours!"
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-50">
              <span className="w-10 h-10 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center font-black text-sm">
                NB
              </span>
              <div>
                <h4 className="font-bold text-xs text-gray-800">Nayanmoni Bora</h4>
                <p className="text-[10px] text-gray-400 font-bold flex items-center">
                  <CheckCircle className="w-3 h-3 text-brand-green mr-0.5" /> Verified Customer • Christian Basti
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between relative">
            <div className="absolute top-6 right-6 text-gray-100 text-5xl font-serif">“</div>
            <div className="space-y-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                "The Store Pickup option is incredible. I place my order while leaving office and the packed bag is ready at the desk. Saving that extra 5% is a sweet cherry on top."
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-50">
              <span className="w-10 h-10 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center font-black text-sm">
                DK
              </span>
              <div>
                <h4 className="font-bold text-xs text-gray-800">Diganta Kalita</h4>
                <p className="text-[10px] text-gray-400 font-bold flex items-center">
                  <CheckCircle className="w-3 h-3 text-brand-green mr-0.5" /> Verified Customer • Zoo Road
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between relative">
            <div className="absolute top-6 right-6 text-gray-100 text-5xl font-serif">“</div>
            <div className="space-y-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                "We get Aashirvaad Atta and Amul Butter delivered under 90 minutes. I have stopped visiting offline supermarkets since trying Arajuma Store!"
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-50">
              <span className="w-10 h-10 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center font-black text-sm">
                PD
              </span>
              <div>
                <h4 className="font-bold text-xs text-gray-800">Pratima Das</h4>
                <p className="text-[10px] text-gray-400 font-bold flex items-center">
                  <CheckCircle className="w-3 h-3 text-brand-green mr-0.5" /> Verified Customer • Beltola
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
