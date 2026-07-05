/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User as UserIcon, 
  MapPin, 
  Percent, 
  Store, 
  Truck, 
  ChevronDown, 
  LogOut, 
  Package, 
  Bell, 
  Settings,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { listenCategories } from '../lib/firebase';
import { CartItem, Address, User, Category } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  cart: CartItem[];
  wishlist: string[];
  activeAddress: Address | null;
  isPickup: boolean;
  onTogglePickup: (pickup: boolean) => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
  onShowAuthModal: () => void;
  onSelectAddressClick: () => void;
}

export default function Navbar({
  currentUser,
  onNavigate,
  cart,
  wishlist,
  activeAddress,
  isPickup,
  onTogglePickup,
  onSearch,
  onLogout,
  onShowAuthModal,
  onSelectAddressClick
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    const unsub = listenCategories((cats) => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats);
      }
    });
    return unsub;
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigate('products');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100" id="header-root">
      {/* Top Banner - Utility Bar */}
      <div className="bg-brand-dark text-white text-xs py-1.5 px-4 flex justify-between items-center" id="utility-banner">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-medium">
            <Store className="w-3.5 h-3.5 mr-1 text-brand-orange" />
            Pickup from store available (Get 5% Off)
          </span>
          <span className="hidden md:inline text-gray-400">|</span>
          <span className="hidden md:inline">
            Free Home Delivery on orders above ₹499
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('about')} 
            className="hover:text-brand-orange transition-colors cursor-pointer"
          >
            About Us
          </button>
          <span>|</span>
          <button 
            onClick={() => onNavigate('contact')} 
            className="hover:text-brand-orange transition-colors cursor-pointer"
          >
            Contact
          </button>
          <span>|</span>
          <button 
            onClick={() => onNavigate('privacy-policy')} 
            className="hover:text-brand-orange transition-colors cursor-pointer"
          >
            Privacy
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between" id="navbar-main">
        {/* Left: Logo & Location */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="cursor-pointer flex flex-col items-start select-none"
            id="nav-logo"
          >
            <span className="text-xl md:text-2xl font-black text-brand-green tracking-tight flex items-center">
              ARAJUMA
              <span className="text-brand-orange ml-1 text-lg font-bold">STORE</span>
            </span>
            <span className="text-[9px] text-gray-500 font-mono tracking-widest -mt-1 uppercase">Freshness Delivered</span>
          </div>

          {/* Delivery / Store Pickup Toggle */}
          <div className="hidden lg:flex bg-gray-100 p-0.5 rounded-full border border-gray-200" id="delivery-toggle-container">
            <button
              onClick={() => onTogglePickup(false)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                !isPickup 
                  ? 'bg-brand-green text-white shadow-sm' 
                  : 'text-gray-600 hover:text-brand-green'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => onTogglePickup(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isPickup 
                  ? 'bg-brand-orange text-white shadow-sm' 
                  : 'text-gray-600 hover:text-brand-orange'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store Pickup</span>
            </button>
          </div>

          {/* Location Selector */}
          <div 
            onClick={onSelectAddressClick}
            className="hidden sm:flex items-center space-x-1 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-100 cursor-pointer transition-all max-w-[180px] md:max-w-[220px]"
            id="nav-location-selector"
          >
            <MapPin className="w-4 h-4 text-brand-green flex-shrink-0" />
            <div className="text-left text-xs truncate">
              <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider leading-none">Deliver to</span>
              <span className="font-semibold text-gray-800 truncate block">
                {activeAddress ? `${activeAddress.name}, ${activeAddress.city}` : 'Select Address'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg mx-6 hidden md:block" id="nav-search-bar">
          <form onSubmit={handleSearchSubmit} className="relative flex">
            <input
              type="text"
              placeholder="Search for fresh fruits, milk, aata, snacks, washing powder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white text-gray-800 pl-4 pr-12 py-2 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none text-sm transition-all"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4 bg-brand-green hover:bg-brand-green-hover text-white rounded-r-lg flex items-center justify-center transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Mobile Search Button (shows on small screens) */}
          <button 
            onClick={() => onNavigate('products')}
            className="p-2 text-gray-600 hover:text-brand-green md:hidden hover:bg-gray-100 rounded-full cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Offers Quick Link */}
          <button
            onClick={() => onNavigate('home', { scrollTo: 'offers' })}
            className="hidden lg:flex items-center space-x-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-hover bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-all cursor-pointer"
          >
            <Percent className="w-4 h-4 animate-bounce" />
            <span>Offers</span>
          </button>

          {/* Wishlist Link */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg relative transition-all cursor-pointer"
            title="Wishlist"
            id="nav-wishlist-btn"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Link */}
          <button
            onClick={() => onNavigate('cart')}
            className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-brand-green px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-sm relative transition-all cursor-pointer"
            id="nav-cart-btn"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-brand-orange text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {cartCount > 0 ? `₹${cartTotal}` : 'Cart'}
            </span>
          </button>

          {/* User Profile / Login */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-1 text-sm font-semibold text-gray-700 hover:text-brand-green bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-all cursor-pointer"
                  id="nav-profile-menu-btn"
                >
                  <UserIcon className="w-4 h-4 text-brand-green" />
                  <span className="max-w-[80px] truncate hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => { setShowProfileMenu(false); onNavigate('profile'); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green flex items-center space-x-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Profile & Settings</span>
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); onNavigate('orders'); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green flex items-center space-x-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>Order History</span>
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); onNavigate('profile', { tab: 'notifications' }); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green flex items-center space-x-2 cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Notification Center</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setShowProfileMenu(false); onNavigate('admin'); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100 flex items-center space-x-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-gray-50 my-1"></div>

                    <button
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onShowAuthModal}
                className="bg-brand-green hover:bg-brand-green-hover text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                id="nav-login-btn"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-brand-green hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
            id="mobile-menu-hamburger"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Categories & Navigation Link Ribbon */}
      <nav className="border-t border-gray-100 bg-gray-50 hidden lg:block" id="nav-ribbon">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 py-1 text-sm font-medium">
            {/* All Categories Dropdown Trigger */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCategoryDropdown(true)}
                onMouseLeave={() => setShowCategoryDropdown(false)}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-brand-green font-bold text-sm bg-white border-x border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <Menu className="w-4 h-4 text-brand-green" />
                <span>Shop By Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* Mega Dropdown */}
              {showCategoryDropdown && (
                <div 
                  onMouseEnter={() => setShowCategoryDropdown(true)}
                  onMouseLeave={() => setShowCategoryDropdown(false)}
                  className="absolute left-0 w-64 bg-white shadow-xl border border-gray-100 py-2 rounded-b-xl z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                >
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setShowCategoryDropdown(false);
                        onNavigate('category', { categorySlug: cat.slug });
                      }}
                      className="w-full text-left px-5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-green flex items-center space-x-3 cursor-pointer border-b border-gray-50 last:border-none"
                    >
                      <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                      <span className="font-semibold">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Category Ribbons */}
            {categoriesList.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', { categorySlug: cat.slug })}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-brand-green transition-colors cursor-pointer"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 py-1 text-xs">
            <button
              onClick={() => onNavigate('about')}
              className="text-gray-500 hover:text-brand-green font-semibold cursor-pointer"
            >
              Why Arajuma Store?
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onNavigate('contact')}
              className="text-gray-500 hover:text-brand-green font-semibold cursor-pointer"
            >
              Customer Care
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Responsive Navigation Drawers */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-3 px-4 shadow-inner space-y-4 animate-in fade-in duration-150" id="mobile-menu-drawer">
          {/* Location for mobile */}
          <div 
            onClick={() => { setMobileMenuOpen(false); onSelectAddressClick(); }}
            className="flex items-center space-x-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200 cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-brand-green" />
            <div className="text-left text-xs">
              <span className="text-gray-400 block text-[8px] uppercase font-bold tracking-wider">Deliver to</span>
              <span className="font-bold text-gray-800">
                {activeAddress ? `${activeAddress.name}, ${activeAddress.city}` : 'Select Address'}
              </span>
            </div>
          </div>

          {/* Delivery Toggle for mobile */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => { onTogglePickup(false); }}
              className={`flex items-center justify-center space-x-1 py-2 rounded-md text-xs font-semibold ${
                !isPickup ? 'bg-brand-green text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => { onTogglePickup(true); }}
              className={`flex items-center justify-center space-x-1 py-2 rounded-md text-xs font-semibold ${
                isPickup ? 'bg-brand-orange text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store Pickup</span>
            </button>
          </div>

          {/* Categories list in Mobile */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Shop By Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('category', { categorySlug: cat.slug });
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-left cursor-pointer border border-gray-100"
                >
                  <img src={cat.image} alt={cat.name} className="w-7 h-7 rounded object-cover" referrerPolicy="no-referrer" />
                  <span className="text-xs font-bold text-gray-700 line-clamp-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="border-t border-gray-100 pt-3 flex flex-col space-y-2 text-sm font-semibold text-gray-700">
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
              className="flex items-center space-x-2 py-1.5 hover:text-brand-green cursor-pointer"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>My Wishlist ({wishlist.length})</span>
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('orders'); }}
              className="flex items-center space-x-2 py-1.5 hover:text-brand-green cursor-pointer"
            >
              <Package className="w-4 h-4 text-blue-500" />
              <span>My Orders</span>
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('about'); }}
              className="flex items-center space-x-2 py-1.5 hover:text-brand-green cursor-pointer"
            >
              <Store className="w-4 h-4 text-brand-orange" />
              <span>Why Arajuma Store</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
