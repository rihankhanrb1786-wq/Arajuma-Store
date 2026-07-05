/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';
import StaticPages from './pages/StaticPages';
import Admin from './pages/Admin';
import AuthModal from './components/AuthModal';

import { Product, CartItem, Order, Address, Notification, User } from './types';
import { 
  auth, 
  db, 
  seedDatabaseIfEmpty, 
  syncUserDoc, 
  logoutUser, 
  listenProducts, 
  listenCart, 
  updateCartItemInFirebase, 
  clearCartInFirebase, 
  listenWishlist, 
  toggleWishlistInFirebase, 
  listenAddresses, 
  saveAddressInFirebase, 
  deleteAddressFromFirebase, 
  listenNotifications, 
  markNotificationReadInFirebase, 
  broadcastNotificationInFirebase, 
  listenOrders, 
  placeOrderInFirebase, 
  updateOrderStatusInFirebase, 
  addProductInFirebase, 
  updateProductInFirebase, 
  deleteProductFromFirebase,
  isFirebaseConfigured
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Navigation & Page routing parameters state
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>(null);

  // Core Dynamic Database states synchronized with Firebase
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeAddress, setActiveAddress] = useState<Address | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPickup, setIsPickup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication UI State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Logged-in user state (defaults to anonymous / guest representation first)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Database Seeding Error State
  const [seedingError, setSeedingError] = useState<string | null>(null);

  // 1. Initial Seeding and Global Content Subscribers
  useEffect(() => {
    // Seed database collections once on mount
    seedDatabaseIfEmpty().catch((err: any) => {
      console.error('Database seeding check error:', err);
      setSeedingError(err.message || String(err));
    });

    // Listen to Products in real-time
    const unsubProducts = listenProducts((products) => {
      setProductsList(products);
    });

    return () => {
      unsubProducts();
    };
  }, []);

  // 2. Authentication Listener & User Subscriptions Session Manager
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync user document details
        const syncedUser = await syncUserDoc(firebaseUser.uid, {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Authorized User'
        });
        setCurrentUser(syncedUser);
      } else {
        // Clear session state
        setCurrentUser(null);
        setCart([]);
        setWishlist([]);
        setAddresses([]);
        setNotifications([]);
        setActiveAddress(null);
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // 3. User Specific Real-Time Data Listeners
  useEffect(() => {
    if (!currentUser) return;

    // Real-time Cart Listener
    const unsubCart = listenCart(currentUser.id, (cartItems) => {
      setCart(cartItems);
    });

    // Real-time Wishlist Listener
    const unsubWishlist = listenWishlist(currentUser.id, (wishlistIds) => {
      setWishlist(wishlistIds);
    });

    // Real-time Addresses Listener
    const unsubAddresses = listenAddresses(currentUser.id, (userAddresses) => {
      setAddresses(userAddresses);
      if (userAddresses.length > 0) {
        // Keep active address selected if possible
        setActiveAddress((prev) => {
          if (prev && userAddresses.some((a) => a.id === prev.id)) {
            return userAddresses.find((a) => a.id === prev.id) || userAddresses[0];
          }
          return userAddresses[0];
        });
      } else {
        setActiveAddress(null);
      }
    });

    // Real-time Notifications Listener
    const unsubNotifications = listenNotifications(currentUser.id, (userNotifications) => {
      setNotifications(userNotifications);
    });

    // Real-time Orders Listener (customers see their own, admins see all)
    const unsubOrders = listenOrders(currentUser.role === 'admin' ? null : currentUser.id, (userOrders) => {
      setOrders(userOrders);
    });

    return () => {
      unsubCart();
      unsubWishlist();
      unsubAddresses();
      unsubNotifications();
      unsubOrders();
    };
  }, [currentUser]);

  // Automatically scroll to top on routing changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, pageParams]);

  // Navigate utility function
  const handleNavigate = (page: string, params: any = null) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  // Helper to ensure authenticated action
  const ensureAuthenticated = (action: () => void) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  // Add to cart logic in Firebase
  const handleAddToCart = (product: Product) => {
    ensureAuthenticated(() => {
      if (!currentUser) return;
      const existing = cart.find((item) => item.product.id === product.id);
      const newQty = existing ? existing.quantity + 1 : 1;
      updateCartItemInFirebase(currentUser.id, product, newQty);
    });
  };

  // Remove quantity from cart logic in Firebase
  const handleRemoveFromCart = (product: Product) => {
    ensureAuthenticated(() => {
      if (!currentUser) return;
      const existing = cart.find((item) => item.product.id === product.id);
      if (!existing) return;
      const newQty = existing.quantity - 1;
      updateCartItemInFirebase(currentUser.id, product, newQty);
    });
  };

  // Delete product completely from cart in Firebase
  const handleDeleteFromCart = (product: Product) => {
    ensureAuthenticated(() => {
      if (!currentUser) return;
      updateCartItemInFirebase(currentUser.id, product, 0);
    });
  };

  // Toggle wishlist state in Firebase
  const handleToggleWishlist = (product: Product) => {
    ensureAuthenticated(() => {
      if (!currentUser) return;
      toggleWishlistInFirebase(currentUser.id, product.id, wishlist);
    });
  };

  // Address add & delete actions in Firebase
  const handleAddAddress = async (newAddr: Omit<Address, 'id'>) => {
    ensureAuthenticated(async () => {
      if (!currentUser) return;
      await saveAddressInFirebase(currentUser.id, newAddr);
    });
  };

  const handleDeleteAddress = async (id: string) => {
    ensureAuthenticated(async () => {
      if (!currentUser) return;
      await deleteAddressFromFirebase(currentUser.id, id);
    });
  };

  // Update profiles state in Firebase
  const handleUpdateProfile = async (name: string, phone: string) => {
    ensureAuthenticated(async () => {
      if (!currentUser) return;
      const updated = await syncUserDoc(currentUser.id, { name, phone });
      setCurrentUser(updated);
    });
  };

  // Mark notification as read in Firebase
  const handleMarkNotificationRead = (id: string) => {
    ensureAuthenticated(() => {
      if (!currentUser) return;
      markNotificationReadInFirebase(currentUser.id, id);
    });
  };

  // Catalog update functions for Admin cockpit in Firebase
  const handleAddProduct = async (newProd: Product) => {
    await addProductInFirebase(newProd);
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    await updateProductInFirebase(updatedProd);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromFirebase(id);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Build updated tracking steps based on status index
    const updatedSteps = [...targetOrder.trackingSteps];
    if (status === 'Processing') {
      updatedSteps[0] = { ...updatedSteps[0], status: 'completed' };
      updatedSteps[1] = { ...updatedSteps[1], status: 'current' };
    } else if (status === 'Out for Delivery') {
      updatedSteps[0] = { ...updatedSteps[0], status: 'completed' };
      updatedSteps[1] = { ...updatedSteps[1], status: 'completed' };
      updatedSteps[2] = { ...updatedSteps[2], status: 'current' };
    } else if (status === 'Delivered') {
      updatedSteps[0] = { ...updatedSteps[0], status: 'completed' };
      updatedSteps[1] = { ...updatedSteps[1], status: 'completed' };
      updatedSteps[2] = { ...updatedSteps[2], status: 'completed' };
      updatedSteps[3] = { ...updatedSteps[3], status: 'completed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }

    await updateOrderStatusInFirebase(orderId, status, updatedSteps);
  };

  // Broadcast push notifications
  const handleBroadcastNotification = async (title: string, message: string) => {
    await broadcastNotificationInFirebase(title, message);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans selection:bg-brand-green selection:text-white antialiased">
      {/* Top Banner, Navigation Drawer, Category Dropdowns */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleNavigate}
        cart={cart}
        wishlist={wishlist}
        activeAddress={activeAddress}
        isPickup={isPickup}
        onTogglePickup={setIsPickup}
        onSearch={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            handleNavigate('products');
          }
        }}
        onLogout={async () => {
          await logoutUser();
        }}
        onShowAuthModal={() => {
          setIsAuthModalOpen(true);
        }}
        onSelectAddressClick={() => {
          handleNavigate('profile', { initialTab: 'addresses' });
        }}
      />

      {/* Seeding Error Banner */}
      {seedingError && (
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-3.5 px-4 text-center text-xs font-semibold shadow-md relative z-40 flex flex-col sm:flex-row items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <span className="flex items-center gap-1.5 justify-center text-left">
            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span><strong>Database Seeding Failure:</strong> {seedingError}</span>
          </span>
          <button 
            onClick={() => setSeedingError(null)}
            className="bg-white text-red-900 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-red-50 transition-all duration-200 cursor-pointer shadow-sm shadow-red-950/20"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Firebase Config warning banner */}
      {!isFirebaseConfigured && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white py-3.5 px-4 text-center text-xs font-semibold shadow-md relative z-40 flex flex-col sm:flex-row items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <span className="flex items-center gap-1.5 justify-center">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>Database Connection Required: Pointing to custom project <strong>"Arajuma Store"</strong>.</span>
          </span>
          <button 
            onClick={() => handleNavigate('admin', { initialTab: 'firebase' })}
            className="bg-white text-amber-900 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all duration-200 cursor-pointer shadow-sm shadow-amber-950/20"
          >
            Setup Connection Now
          </button>
        </div>
      )}

      {/* Primary view routers viewport */}
      <main className="flex-1 pb-16">
        {currentPage === 'home' && (
          <Home
            onNavigate={handleNavigate}
            cart={cart}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(p) => handleNavigate('product-details', { product: p })}
            isPickup={isPickup}
            onTogglePickup={setIsPickup}
            products={productsList}
          />
        )}

        {currentPage === 'products' && (
          <Products
            onNavigate={handleNavigate}
            cart={cart}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(p) => handleNavigate('product-details', { product: p })}
            searchQuery={searchQuery}
            products={productsList}
          />
        )}

        {currentPage === 'category' && (
          <Category
            categorySlug={pageParams?.categorySlug || 'fruits'}
            onNavigate={handleNavigate}
            cart={cart}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(p) => handleNavigate('product-details', { product: p })}
            products={productsList}
          />
        )}

        {currentPage === 'product-details' && (
          <ProductDetails
            product={pageParams?.product || productsList[0]}
            onNavigate={handleNavigate}
            cart={cart}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(p) => handleNavigate('product-details', { product: p })}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onDeleteFromCart={handleDeleteFromCart}
            onNavigate={handleNavigate}
            isPickup={isPickup}
            onTogglePickup={setIsPickup}
          />
        )}

        {currentPage === 'wishlist' && (
          <Wishlist
            wishlist={wishlist}
            onNavigate={handleNavigate}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(p) => handleNavigate('product-details', { product: p })}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            cart={cart}
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onNavigate={handleNavigate}
            isPickup={isPickup}
            onTogglePickup={setIsPickup}
            activeAddress={activeAddress}
            onSelectAddress={setActiveAddress}
            onClearCart={async () => {
              if (currentUser) {
                await clearCartInFirebase(currentUser.id);
              }
            }}
            onAddOrder={async (ord) => {
              await placeOrderInFirebase(ord);
            }}
            checkoutMeta={pageParams}
          />
        )}

        {currentPage === 'orders' && (
          <Orders
            orders={orders}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'track-order' && (
          <TrackOrder
            order={pageParams?.order || orders[0]}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'profile' && (
          <Profile
            currentUser={currentUser || {
              id: 'guest',
              name: 'Guest User',
              email: 'guest@arajumastore.com',
              role: 'customer',
              createdAt: ''
            }}
            addresses={addresses}
            notifications={notifications}
            onAddAddress={handleAddAddress}
            onDeleteAddress={handleDeleteAddress}
            onUpdateProfile={handleUpdateProfile}
            onMarkNotificationRead={handleMarkNotificationRead}
            onNavigate={handleNavigate}
            initialTab={pageParams?.initialTab}
          />
        )}

        {['about', 'contact', 'privacy-policy', 'terms'].includes(currentPage) && (
          <StaticPages
            pageType={currentPage as any}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admin' && (
          <Admin
            products={productsList}
            orders={orders}
            currentUser={currentUser}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onNavigate={handleNavigate}
            onBroadcastNotification={handleBroadcastNotification}
          />
        )}
      </main>

      {/* Footer layout */}
      <Footer onNavigate={handleNavigate} />

      {/* Secured Unified Authentication Gateway Portal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
