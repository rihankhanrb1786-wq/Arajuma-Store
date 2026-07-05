/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, ShoppingBag, Layers, Bookmark, FileCheck, AlertTriangle, Gift, Users, Star, 
  BarChart3, Image as ImageIcon, Bell, Truck, Briefcase, Plus, Trash2, CheckCircle, 
  TrendingUp, DollarSign, RefreshCw, Eye, EyeOff, Copy, Download, Upload, Edit, 
  Search, X, Check, Ban, Settings as SettingsIcon, FileText, Layout, Info, HelpCircle,
  FolderOpen, EyeIcon, Printer, ChevronRight
} from 'lucide-react';
import { Product, Category, Brand, Order, Coupon, Supplier, DeliverySlot, Notification, Review, User, StoreSettings } from '../types';
import { 
  listenCategories, saveCategoryInFirebase, deleteCategoryFromFirebase,
  listenBrands, saveBrandInFirebase, deleteBrandFromFirebase,
  listenCoupons, saveCouponInFirebase, deleteCouponFromFirebase,
  listenSuppliers, saveSupplierInFirebase, deleteSupplierFromFirebase,
  listenUsers, updateUserRoleInFirebase,
  listenSettings, saveSettingsInFirebase,
  forceSeedDatabase, isFirebaseConfigured
} from '../lib/firebase';
import { CATEGORIES, BRANDS, SUPPLIERS, COUPONS, DEFAULT_STORE_SETTINGS } from '../data/mockData';

interface AdminProps {
  products: Product[];
  orders: Order[];
  currentUser: User | null;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
  onNavigate: (page: string) => void;
  onBroadcastNotification: (title: string, message: string) => void;
}

type AdminTab = 
  | 'overview' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' 
  | 'delivery' | 'homepage' | 'pages' | 'coupons' | 'reviews' | 'notifications' 
  | 'settings' | 'media' | 'reports' | 'activity';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export default function Admin({
  products,
  orders,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onNavigate,
  onBroadcastNotification
}: AdminProps) {
  // Role Protection
  useEffect(() => {
    if (!currentUser || ((currentUser.role as string) !== 'admin' && (currentUser.role as string) !== 'super-admin')) {
      const t = setTimeout(() => onNavigate('home'), 3000);
      return () => clearTimeout(t);
    }
  }, [currentUser, onNavigate]);

  if (!currentUser || ((currentUser.role as string) !== 'admin' && (currentUser.role as string) !== 'super-admin')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-100 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
        <h2 className="text-xl font-black text-gray-900">Access Restricted</h2>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
          Only Super Admins and Admins can access this dashboard. Redirecting to store...
        </p>
      </div>
    );
  }

  // Active view tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Real-time synced states from Firestore
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(BRANDS);
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [users, setUsers] = useState<User[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Search filter terms
  const [globalSearch, setGlobalSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');
  
  // Selection and Bulk operations states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkStockVal, setBulkStockVal] = useState<number>(100);

  // Forms / Modals state
  const [showProductModal, setShowProductModal] = useState<Product | 'add' | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState<Category | 'add' | null>(null);
  const [showBrandModal, setShowBrandModal] = useState<Brand | 'add' | null>(null);
  const [showCouponModal, setShowCouponModal] = useState<Coupon | 'add' | null>(null);
  const [showInvoiceOrder, setShowInvoiceOrder] = useState<Order | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState<User | null>(null);
  
  // Form fields for Products
  const [prodForm, setProdForm] = useState({
    name: '', category: 'fruits', brand: 'Local Fresh', price: 50, originalPrice: 65,
    unit: '1 kg', stock: 100, description: '', image: '', sku: '', barcode: '', tags: '', variants: ''
  });

  // Form fields for Categories
  const [catForm, setCatForm] = useState({ name: '', slug: '', image: '', arrangeOrder: 0 });
  // Form fields for Brands
  const [brandForm, setBrandForm] = useState({ name: '', logo: '', banner: '' });
  // Form fields for Coupons
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discountType: 'fixed' as 'percentage' | 'fixed', discountValue: 10, minPurchase: 100 });

  // Activity Log
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', timestamp: new Date(Date.now() - 3600000).toLocaleString(), user: currentUser.email, action: 'View Portal', details: 'Admin logged in and viewed analytics panel.' },
    { id: '2', timestamp: new Date(Date.now() - 7200000).toLocaleString(), user: currentUser.email, action: 'Check Stock', details: 'Stock warnings audit performed.' }
  ]);

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleString(),
      user: currentUser.email,
      action,
      details
    };
    setActivities(prev => [newLog, ...prev]);
  };

  // Synchronize dynamic collections
  useEffect(() => {
    const uCat = listenCategories(setCategories);
    const uBrand = listenBrands(setBrands);
    const uCoupon = listenCoupons(setCoupons);
    const uSuppliers = listenSuppliers(setSuppliers);
    const uUsers = listenUsers(setUsers);
    const uSettings = listenSettings(setStoreSettings);

    return () => {
      uCat(); uBrand(); uCoupon(); uSuppliers(); uUsers(); uSettings();
    };
  }, []);

  // Sync Form States on Edit open
  const openProductModal = (p: Product | 'add') => {
    if (p === 'add') {
      const generatedSku = 'JMG-' + Math.floor(100000 + Math.random() * 900000);
      const generatedBarcode = '890' + Math.floor(100000000 + Math.random() * 900000000);
      setProdForm({
        name: '', category: 'fruits', brand: 'Local Fresh', price: 50, originalPrice: 65,
        unit: '1 kg', stock: 100, description: '', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=500',
        sku: generatedSku, barcode: generatedBarcode, tags: 'Fresh, Organic', variants: 'Standard'
      });
      setShowProductModal('add');
    } else {
      setProdForm({
        name: p.name, category: p.category, brand: p.brand, price: p.price, originalPrice: p.originalPrice || p.price,
        unit: p.unit, stock: p.stock, description: p.description || '', image: p.image,
        sku: (p as any).sku || 'JMG-' + Math.floor(100000 + Math.random() * 900000),
        barcode: (p as any).barcode || '890' + Math.floor(100000000 + Math.random() * 900000000),
        tags: (p as any).tags || 'Fresh', variants: (p as any).variants || 'Standard'
      });
      setShowProductModal(p);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Product = {
      id: showProductModal === 'add' ? 'p-' + Math.floor(1000 + Math.random() * 9000) : (showProductModal as Product).id,
      name: prodForm.name,
      category: prodForm.category,
      brand: prodForm.brand,
      price: Number(prodForm.price),
      originalPrice: Number(prodForm.originalPrice),
      unit: prodForm.unit,
      stock: Number(prodForm.stock),
      description: prodForm.description,
      image: prodForm.image,
      rating: showProductModal === 'add' ? 4.5 : (showProductModal as Product).rating,
      reviewsCount: showProductModal === 'add' ? 0 : (showProductModal as Product).reviewsCount,
      ...({
        sku: prodForm.sku,
        barcode: prodForm.barcode,
        tags: prodForm.tags,
        variants: prodForm.variants,
        isDealsOfTheDay: true
      } as any)
    };

    if (showProductModal === 'add') {
      onAddProduct(payload);
      logActivity('Create Product', `Added ${payload.name} to catalogue.`);
    } else {
      onUpdateProduct(payload);
      logActivity('Update Product', `Modified details of product ${payload.name}.`);
    }
    setShowProductModal(null);
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = showCategoryModal === 'add' ? 'cat-' + Math.floor(100 + Math.random() * 900) : (showCategoryModal as Category).id;
    const data: Category = {
      id,
      name: catForm.name,
      slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-'),
      image: catForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
    };
    await saveCategoryInFirebase(data);
    logActivity('Category Save', `Saved category ${data.name}.`);
    setShowCategoryModal(null);
  };

  // Brand CRUD
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = showBrandModal === 'add' ? 'brand-' + Math.floor(100 + Math.random() * 900) : (showBrandModal as Brand).id;
    const data: Brand = {
      id,
      name: brandForm.name,
      logo: brandForm.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200'
    };
    await saveBrandInFirebase(data);
    logActivity('Brand Save', `Saved Brand ${data.name}.`);
    setShowBrandModal(null);
  };

  // Coupon CRUD
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = showCouponModal === 'add' ? 'c-' + Math.floor(100 + Math.random() * 900) : (showCouponModal as Coupon).id;
    const data: Coupon = {
      id,
      code: couponForm.code.toUpperCase(),
      description: couponForm.description,
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minPurchase: Number(couponForm.minPurchase),
      isActive: true
    };
    await saveCouponInFirebase(data);
    logActivity('Coupon Save', `Saved coupon code ${data.code}.`);
    setShowCouponModal(null);
  };

  // Duplicate Product
  const handleDuplicateProduct = (p: Product) => {
    const dup: Product = {
      ...p,
      id: 'p-' + Math.floor(1000 + Math.random() * 9000),
      name: `${p.name} (Copy)`,
      stock: 50
    };
    onAddProduct(dup);
    logActivity('Duplicate Product', `Duplicated ${p.name} as ${dup.name}.`);
  };

  // Export Catalogue as JSON File
  const handleExportJSON = () => {
    const str = JSON.stringify(products, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jitu_moni_grocery_products.json';
    a.click();
    logActivity('Export Data', 'Exported products catalog as JSON.');
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async (event) => {
      try {
        const list = JSON.parse(event.target?.result as string);
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item.name && item.price) {
              await onAddProduct({
                id: item.id || 'p-' + Math.floor(1000 + Math.random() * 9000),
                name: item.name,
                category: item.category || 'fruits',
                brand: item.brand || 'Local Fresh',
                price: Number(item.price),
                originalPrice: Number(item.originalPrice || item.price),
                unit: item.unit || '1 kg',
                stock: Number(item.stock || 100),
                description: item.description || '',
                image: item.image || 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=500',
                rating: 4.5,
                reviewsCount: 1
              });
            }
          }
          logActivity('Import Data', `Imported list of products successfully from JSON.`);
          alert('Catalogue successfully updated!');
        }
      } catch (err) {
        alert('Failed to parse or save catalogue JSON file.');
      }
    };
    r.readAsText(file);
  };

  // Bulk operation actions
  const handleBulkUpdateStock = () => {
    if (selectedProductIds.length === 0) return;
    selectedProductIds.forEach(id => {
      const match = products.find(p => p.id === id);
      if (match) {
        onUpdateProduct({ ...match, stock: bulkStockVal });
      }
    });
    logActivity('Bulk Stock Reset', `Updated stocks of ${selectedProductIds.length} items to ${bulkStockVal}.`);
    setSelectedProductIds([]);
    alert('Stock updated!');
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) {
      selectedProductIds.forEach(id => onDeleteProduct(id));
      logActivity('Bulk Delete', `Deleted ${selectedProductIds.length} products.`);
      setSelectedProductIds([]);
    }
  };

  // Analytics helper calculations
  const customersList = users.filter(u => u.role === 'customer');
  const deliveryList = users.filter(u => u.role === 'delivery' || (u as any).role === 'delivery-boy');
  const revenueTotal = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.total : sum, 0);
  const pendingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Processing');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const lowStockItems = products.filter(p => p.stock <= 20);

  // Home Page Management Config fields
  const [promoBanner, setPromoBanner] = useState({ title: 'Organic Monsoon Splash', code: 'MONSOON50', status: 'Active' });
  const [announcementBar, setAnnouncementBar] = useState('🚨 FREE Shipping on all Guwahati orders above ₹599 today!');

  // Content Blocks
  const [customPages, setCustomPages] = useState({
    about: 'Guwahati’s premium organic and household kitchen essentials grocery delivery network.',
    contact: ' christian Basti Road helpdesk phone +91 98765 43210',
    terms: 'Standard refund window remains 24 hours from delivery slot.',
    privacy: 'Your billing and tracking data is safely handled within the Google Cloud perimeter.'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left space-y-8" id="enterprise-admin-root">
      {/* Dynamic Master Banner Head */}
      <div className="bg-gradient-to-br from-brand-dark to-neutral-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-neutral-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-brand-orange text-[10px] font-black tracking-widest uppercase bg-orange-950/80 px-3 py-1 rounded-full border border-orange-900/60 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1 text-brand-orange animate-pulse" />
              {(currentUser.role as string) === 'super-admin' ? 'Super Admin Portal' : 'Administrator Console'}
            </span>
            <span className="bg-brand-green/20 text-brand-green border border-brand-green/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Enterprise Suite v4.1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Jitu Moni Pro Control Hub</h1>
          <p className="text-xs text-neutral-400 font-semibold leading-relaxed max-w-xl">
            Sovereign admin node connected to <span className="text-brand-green">"jitu-moni-grocery"</span> live datastores. Execute audits, update inventories, and allocate fulfillment logistics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            placeholder="Global Search (Products, Orders, Users)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="bg-neutral-800/80 text-white border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-semibold placeholder-neutral-500 outline-none focus:border-brand-green max-w-[220px]"
          />
          <button
            onClick={() => onNavigate('home')}
            className="bg-white hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Exit Storefront</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Global Admin Search Results Highlight Panel */}
      {globalSearch.trim() && (
        <div className="bg-emerald-50/70 border border-emerald-100 p-6 rounded-3xl animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-brand-green" /> Global Match Metrics for "{globalSearch}"
            </h3>
            <button onClick={() => setGlobalSearch('')} className="text-emerald-700 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Match Products */}
            <div className="space-y-2">
              <span className="font-extrabold text-emerald-800">Products Sourced ({products.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase())).length})</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {products.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-white p-2.5 rounded-lg border border-emerald-100/60 flex justify-between items-center">
                    <span className="font-bold text-neutral-800 truncate pr-2">{p.name}</span>
                    <button onClick={() => { setActiveTab('products'); openProductModal(p); setGlobalSearch(''); }} className="text-brand-green font-black underline hover:text-emerald-800">Edit</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Match Orders */}
            <div className="space-y-2">
              <span className="font-extrabold text-emerald-800">Order Logs ({orders.filter(o => o.id.toLowerCase().includes(globalSearch.toLowerCase()) || o.userId.toLowerCase().includes(globalSearch.toLowerCase())).length})</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {orders.filter(o => o.id.toLowerCase().includes(globalSearch.toLowerCase()) || o.userId.toLowerCase().includes(globalSearch.toLowerCase())).map(o => (
                  <div key={o.id} className="bg-white p-2.5 rounded-lg border border-emerald-100/60 flex justify-between items-center">
                    <span className="font-mono font-black text-neutral-800">{o.id}</span>
                    <button onClick={() => { setActiveTab('orders'); setShowInvoiceOrder(o); setGlobalSearch(''); }} className="text-brand-green font-black underline hover:text-emerald-800">View Invoice</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Match Users */}
            <div className="space-y-2">
              <span className="font-extrabold text-emerald-800">Users ({users.filter(u => u.name?.toLowerCase().includes(globalSearch.toLowerCase()) || u.email?.toLowerCase().includes(globalSearch.toLowerCase())).length})</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {users.filter(u => u.name?.toLowerCase().includes(globalSearch.toLowerCase()) || u.email?.toLowerCase().includes(globalSearch.toLowerCase())).map(u => (
                  <div key={u.id} className="bg-white p-2.5 rounded-lg border border-emerald-100/60 flex justify-between items-center">
                    <span className="font-bold text-neutral-800 truncate pr-2">{u.name} ({u.role})</span>
                    <button onClick={() => { setActiveTab('customers'); setShowCustomerModal(u); setGlobalSearch(''); }} className="text-brand-green font-black underline hover:text-emerald-800">Details</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Responsive Control Panel Sidebar */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm space-y-1.5" id="admin-navigator">
          <span className="px-3.5 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Navigation</span>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'overview' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span>Overview & Visuals</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'products' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 flex-shrink-0" />
              <span>Products Catalog</span>
            </span>
            <span className="bg-neutral-100 text-neutral-600 text-[10px] font-black px-2 py-0.5 rounded-full">{products.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'categories' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span>Category Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'brands' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Bookmark className="w-4 h-4 flex-shrink-0" />
            <span>Brand Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'orders' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 flex-shrink-0" />
              <span>Orders Queue</span>
            </span>
            {pendingOrders.length > 0 && (
              <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">{pendingOrders.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'customers' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>Customers Log</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'delivery' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Truck className="w-4 h-4 flex-shrink-0" />
            <span>Delivery Boys</span>
          </button>

          <span className="px-3.5 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Content & Sales</span>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'homepage' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Layout className="w-4 h-4 flex-shrink-0" />
            <span>Home Page Content</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'pages' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>Dynamic Static Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'coupons' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Gift className="w-4 h-4 flex-shrink-0" />
            <span>Coupons & Promos</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'reviews' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Star className="w-4 h-4 flex-shrink-0" />
            <span>Review Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'notifications' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span>Broadcast Alerts</span>
          </button>

          <span className="px-3.5 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Systems</span>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'settings' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <SettingsIcon className="w-4 h-4 flex-shrink-0" />
            <span>System Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'media' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span>Media Library</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'reports' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span>Analytical Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'activity' ? 'bg-emerald-50 text-brand-green' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Activity Log ({activities.length})</span>
          </button>
        </aside>

        {/* Content Workspace Frame */}
        <main className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm min-h-[500px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-brand-green" /> Realtime Store Index
                </h2>
                <span className="text-[10px] text-neutral-400 font-bold font-mono">Live Sync Status: Online</span>
              </div>

              {/* KPI Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider block">Gross Revenue</span>
                  <span className="text-lg font-black text-neutral-800 mt-1 block">₹{revenueTotal.toLocaleString()}</span>
                  <span className="text-[8px] text-emerald-600 font-black flex items-center gap-0.5 mt-0.5">▲ 14.8% vs last month</span>
                </div>
                <div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider block">Products Active</span>
                  <span className="text-lg font-black text-neutral-800 mt-1 block">{products.length} Items</span>
                  <span className="text-[8px] text-neutral-400 font-semibold block mt-0.5">{categories.length} core categories</span>
                </div>
                <div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider block">Pending Queue</span>
                  <span className="text-lg font-black text-brand-orange mt-1 block">{pendingOrders.length} Orders</span>
                  <span className="text-[8px] text-amber-600 font-black block mt-0.5">Needs packing/dispatch</span>
                </div>
                <div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider block">Critical Stocks</span>
                  <span className="text-lg font-black text-red-600 mt-1 block">{lowStockItems.length} Warnings</span>
                  <span className="text-[8px] text-red-500 font-bold block mt-0.5">Below 20 units stock threshold</span>
                </div>
              </div>

              {/* Graphical Vectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sales Graph Vector */}
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-3">
                  <span className="text-xs font-black text-neutral-700 uppercase tracking-wider block">Weekly Gross Revenue Index</span>
                  <div className="h-40 flex items-end justify-between px-2 pt-4 border-b border-neutral-200">
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-neutral-300 hover:bg-neutral-400 w-4 h-10 rounded-t transition-colors" title="Mon: ₹12,000" />
                      <span className="text-[9px] text-neutral-400 font-bold mt-1">M</span>
                    </div>
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-neutral-300 hover:bg-neutral-400 w-4 h-16 rounded-t transition-colors" title="Tue: ₹19,500" />
                      <span className="text-[9px] text-neutral-400 font-bold mt-1">T</span>
                    </div>
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-brand-green w-4 h-28 rounded-t shadow-sm" title="Wed: ₹35,000" />
                      <span className="text-[9px] text-brand-green font-black mt-1">W</span>
                    </div>
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-brand-green w-4 h-32 rounded-t shadow-sm" title="Thu: ₹42,000" />
                      <span className="text-[9px] text-brand-green font-black mt-1">T</span>
                    </div>
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-neutral-300 hover:bg-neutral-400 w-4 h-24 rounded-t transition-colors" title="Fri: ₹28,000" />
                      <span className="text-[9px] text-neutral-400 font-bold mt-1">F</span>
                    </div>
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-brand-orange w-4 h-36 rounded-t shadow-sm" title="Sat: ₹55,000" />
                      <span className="text-[9px] text-brand-orange font-black mt-1">S</span>
                    </div>
                    <div className="flex flex-col items-center w-8">
                      <div className="bg-brand-orange w-4 h-30 rounded-t shadow-sm" title="Sun: ₹48,000" />
                      <span className="text-[9px] text-brand-orange font-black mt-1">S</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-semibold block text-center">Interactive Graph vector mapped from transaction indexes.</span>
                </div>

                {/* Orders Allocation Graph */}
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-3">
                  <span className="text-xs font-black text-neutral-700 uppercase tracking-wider block">Orders Influx & Fulfillment</span>
                  <div className="h-40 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-8 border-brand-green flex flex-col items-center justify-center border-t-brand-orange">
                      <span className="text-lg font-black text-neutral-800">{orders.length}</span>
                      <span className="text-[8px] text-neutral-400 uppercase font-black">Gross Orders</span>
                    </div>
                    <div className="ml-6 space-y-2 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-brand-green rounded-full"></span>
                        <span>Delivered ({deliveredOrders.length})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-brand-orange rounded-full"></span>
                        <span>Pending Queue ({pendingOrders.length})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        <span>Cancelled ({cancelledOrders.length})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Summary Cards: Recent Logs */}
              <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-3">
                <span className="text-xs font-black text-neutral-700 uppercase tracking-wider block">Recent Order Influx Queue</span>
                <div className="divide-y divide-neutral-100">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="py-2 flex justify-between items-center text-xs font-semibold">
                      <div>
                        <span className="font-mono text-neutral-800 block">{o.id}</span>
                        <span className="text-[10px] text-neutral-400">{o.items.length} items • {o.timeSlot}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-brand-green font-black">₹{o.total}</span>
                        <span className="text-[9px] text-neutral-400">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOGUE */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4.5 h-4.5 text-brand-green" /> Product Catalog Master
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Manage SKU tags, edit barcodes, and handle quantities.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openProductModal('add')}
                    className="bg-brand-green hover:bg-brand-green-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                  <label className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Import JSON
                    <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Filters & Bulk Operations bar */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search product directory..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-brand-green w-full sm:w-60"
                  />
                </div>

                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-neutral-100 w-full sm:w-auto">
                    <span className="font-extrabold text-neutral-600">{selectedProductIds.length} Selected</span>
                    <input
                      type="number"
                      value={bulkStockVal}
                      onChange={(e) => setBulkStockVal(Number(e.target.value))}
                      className="w-16 border border-neutral-200 rounded px-2 py-0.5 text-center font-bold"
                    />
                    <button onClick={handleBulkUpdateStock} className="text-brand-green font-black hover:underline">Apply Stock</button>
                    <button onClick={handleBulkDelete} className="text-red-500 font-black hover:underline">Delete Selected</button>
                  </div>
                )}
              </div>

              {/* Products Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-neutral-500 font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length === products.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(products.map(p => p.id));
                            } else {
                              setSelectedProductIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="py-3">Product Name & SKU</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Price Status</th>
                      <th className="py-3">Stock remaining</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <tr key={p.id} className={isSelected ? 'bg-emerald-50/40' : ''}>
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds(prev => [...prev, p.id]);
                                } else {
                                  setSelectedProductIds(prev => prev.filter(id => id !== p.id));
                                }
                              }}
                            />
                          </td>
                          <td className="py-3 font-bold text-neutral-800 flex items-center gap-2.5">
                            <img src={p.image} alt="" className="w-8 h-8 object-contain bg-neutral-50 p-1 border rounded" referrerPolicy="no-referrer" />
                            <div>
                              <span className="block truncate max-w-[160px]">{p.name}</span>
                              <span className="text-[9px] text-neutral-400 font-mono">{(p as any).sku || 'JMG-' + p.id} • {p.unit}</span>
                            </div>
                          </td>
                          <td className="py-3 uppercase text-[9px] font-bold text-neutral-500">{p.category}</td>
                          <td className="py-3 text-neutral-800">
                            <span className="font-black">₹{p.price}</span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-[10px] text-neutral-400 line-through ml-1.5">₹{p.originalPrice}</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              p.stock <= 20 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-brand-green'
                            }`}>
                              {p.stock} Units
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            <button onClick={() => handleDuplicateProduct(p)} className="p-1 text-neutral-400 hover:text-neutral-700" title="Duplicate product"><Copy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => openProductModal(p)} className="p-1 text-neutral-400 hover:text-brand-green" title="Edit product"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { if(window.confirm('Delete this product?')) onDeleteProduct(p.id); }} className="p-1 text-neutral-400 hover:text-red-500" title="Delete product"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Category Directories</h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Define core categories and priority ordering.</p>
                </div>
                <button
                  onClick={() => {
                    setCatForm({ name: '', slug: '', image: '', arrangeOrder: categories.length + 1 });
                    setShowCategoryModal('add');
                  }}
                  className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex justify-between items-center text-xs font-semibold">
                    <div className="flex items-center gap-3">
                      <img src={cat.image} alt="" className="w-10 h-10 object-cover bg-neutral-100 border rounded" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-extrabold text-neutral-800 text-sm">{cat.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono block">Slug: {cat.slug} • Order: {idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCatForm({ name: cat.name, slug: cat.slug, image: cat.image, arrangeOrder: idx + 1 });
                          setShowCategoryModal(cat);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-brand-green"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete category?')) {
                            await deleteCategoryFromFirebase(cat.id);
                            logActivity('Delete Category', `Deleted category ${cat.name}.`);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BRANDS MANAGEMENT */}
          {activeTab === 'brands' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Brands Catalogue</h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Manage partner logo banners and farm networks.</p>
                </div>
                <button
                  onClick={() => {
                    setBrandForm({ name: '', logo: '', banner: '' });
                    setShowBrandModal('add');
                  }}
                  className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Brand
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {brands.map(brand => (
                  <div key={brand.id} className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 flex flex-col items-center text-center text-xs font-semibold relative">
                    <img src={brand.logo} alt="" className="w-14 h-14 object-contain bg-white border rounded-full p-2 mb-3 shadow-sm" referrerPolicy="no-referrer" />
                    <h4 className="font-extrabold text-neutral-800 text-sm">{brand.name}</h4>
                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5">ID: {brand.id}</span>
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => {
                          setBrandForm({ name: brand.name, logo: brand.logo, banner: '' });
                          setShowBrandModal(brand);
                        }}
                        className="p-1 text-neutral-400 hover:text-brand-green"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete brand?')) {
                            await deleteBrandFromFirebase(brand.id);
                            logActivity('Delete Brand', `Deleted brand ${brand.name}.`);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS QUEUE */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4.5 h-4.5 text-brand-green" /> Live Orders Influx Queue
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Monitor client transactions, assign deliveries, and print invoices.</p>
                </div>
                <div className="flex gap-2.5">
                  {['All', 'Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        orderFilterStatus === st ? 'bg-emerald-50 text-brand-green border-brand-green' : 'bg-white border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 font-semibold">No order records registered.</div>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => orderFilterStatus === 'All' || o.status === orderFilterStatus).map(o => (
                    <div key={o.id} className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-neutral-800 text-sm">{o.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            o.isPickup ? 'bg-amber-100 text-brand-orange' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {o.isPickup ? 'Store Pickup' : 'Home Delivery'}
                          </span>
                        </div>
                        <p className="text-neutral-500 font-medium">Customer ID: <span className="text-neutral-800 font-bold">{o.userId}</span> • Items count: {o.items?.length || 0}</p>
                        <p className="text-neutral-400 text-[10px]">Time Slot: <strong className="text-neutral-600">{o.timeSlot}</strong> • Date: {new Date(o.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-3.5 self-stretch justify-between md:self-auto">
                        <div>
                          <span className="block text-[10px] text-neutral-400">Total Payable</span>
                          <span className="text-sm font-black text-neutral-800">₹{o.total}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowInvoiceOrder(o)}
                            className="bg-white border border-neutral-200 hover:border-brand-green text-neutral-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> Invoice
                          </button>

                          <select
                            value={o.status}
                            onChange={(e) => {
                              onUpdateOrderStatus(o.id, e.target.value as any);
                              logActivity('Order State', `Updated state of order ${o.id} to ${e.target.value}.`);
                            }}
                            className="bg-white border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:border-brand-green font-bold"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMERS LOG */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Registered Client Logs</h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Audit user authorization, configure client roles, and inspect profiles.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-1.5 text-xs outline-none focus:border-brand-green focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customersList.filter(u => u.name?.toLowerCase().includes(customerSearch.toLowerCase()) || u.email?.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                  <div key={c.id} className="p-5 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex justify-between items-start text-xs font-semibold">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-neutral-800 text-sm">{c.name || 'Anonymous client'}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">{c.email}</p>
                      <span className="text-[9px] text-brand-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase font-black">
                        Role: {c.role}
                      </span>
                      {c.phone && <p className="text-[10px] text-neutral-500 font-mono">Phone: {c.phone}</p>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCustomerModal(c)}
                        className="bg-white border border-neutral-200 hover:border-brand-green text-neutral-700 px-2.5 py-1 rounded-lg text-[10px] font-black"
                      >
                        Logs & Address
                      </button>

                      <button
                        onClick={async () => {
                          const nextRole: 'customer' | 'admin' | 'delivery' = (c.role as string) === 'admin' ? 'customer' : 'admin';
                          if (window.confirm(`Switch role to ${nextRole}?`)) {
                            await updateUserRoleInFirebase(c.id, nextRole);
                            logActivity('User Role Switch', `Changed role of user ${c.email} to ${nextRole}.`);
                          }
                        }}
                        className="bg-white border border-neutral-200 hover:border-brand-orange text-neutral-700 px-2.5 py-1 rounded-lg text-[10px] font-black"
                      >
                        Toggle Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DELIVERY BOYS */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Delivery Logistics Personnel</h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Manage delivery boys and verify their authorization statuses.</p>
                </div>
                <button
                  onClick={async () => {
                    const mail = window.prompt("Enter delivery boy email to register/authorize:");
                    if (mail) {
                      const match = users.find(u => u.email === mail);
                      if (match) {
                        await updateUserRoleInFirebase(match.id, 'delivery');
                        logActivity('Register Delivery Boy', `Assigned delivery status to user ${mail}.`);
                        alert('Role assigned successfully!');
                      } else {
                        alert('Could not locate user document in database for that email. Register user first.');
                      }
                    }
                  }}
                  className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  + Authorize Delivery Boy
                </button>
              </div>

              {deliveryList.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 font-semibold">No registered delivery boys found in users collection.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  {deliveryList.map(boy => (
                    <div key={boy.id} className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-neutral-800">{boy.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono">{boy.email}</span>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="text-[9px] text-emerald-800 uppercase font-black">Authorized</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Revoke delivery boy authorization?`)) {
                            await updateUserRoleInFirebase(boy.id, 'customer');
                            logActivity('Revoke Boy', `Revoked delivery role of ${boy.email}.`);
                          }
                        }}
                        className="text-red-500 font-black hover:underline"
                      >
                        Revoke Access
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: HOME PAGE MANAGEMENT */}
          {activeTab === 'homepage' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Home Page Customization</h2>
                <p className="text-[10px] text-neutral-400 font-semibold">Customize storefront promotional headers, announcement bars, and popup promos.</p>
              </div>

              <div className="bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100 space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Announcement Bar Banner Message</label>
                  <input
                    type="text"
                    value={announcementBar}
                    onChange={(e) => setAnnouncementBar(e.target.value)}
                    className="w-full bg-white px-3.5 py-2 rounded-lg border border-neutral-200 outline-none focus:border-brand-green"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Active Promo Flash Sale Title</label>
                    <input
                      type="text"
                      value={promoBanner.title}
                      onChange={(e) => setPromoBanner(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white px-3.5 py-2 rounded-lg border border-neutral-200 outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Active Promo Banner Coupon Code</label>
                    <input
                      type="text"
                      value={promoBanner.code}
                      onChange={(e) => setPromoBanner(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full bg-white px-3.5 py-2 rounded-lg border border-neutral-200 outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      logActivity('Homepage Update', 'Saved homepage widgets arrangement and announcement banners.');
                      alert('Homepage visual configuration updated!');
                    }}
                    className="bg-brand-green hover:bg-brand-green-hover text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider"
                  >
                    Save Homepage Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: STATIC DYNAMIC PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Dynamic Informational Block Content</h2>
                <p className="text-[10px] text-neutral-400 font-semibold">Instantly customize core company informational texts rendered across footers.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-black uppercase block">About Us Core Description</label>
                  <textarea
                    rows={3}
                    value={customPages.about}
                    onChange={(e) => setCustomPages(prev => ({ ...prev, about: e.target.value }))}
                    className="w-full bg-neutral-50 p-3 rounded-lg border border-neutral-200 outline-none focus:bg-white focus:border-brand-green text-neutral-800 leading-relaxed font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-black uppercase block">Customer Support Operating Address & Hours</label>
                  <textarea
                    rows={2}
                    value={customPages.contact}
                    onChange={(e) => setCustomPages(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full bg-neutral-50 p-3 rounded-lg border border-neutral-200 outline-none focus:bg-white focus:border-brand-green text-neutral-800 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-black uppercase block">Refund Terms & Cancellation Policy</label>
                  <textarea
                    rows={2}
                    value={customPages.terms}
                    onChange={(e) => setCustomPages(prev => ({ ...prev, terms: e.target.value }))}
                    className="w-full bg-neutral-50 p-3 rounded-lg border border-neutral-200 outline-none focus:bg-white focus:border-brand-green text-neutral-800 font-semibold"
                  />
                </div>

                <button
                  onClick={() => {
                    logActivity('Content Save', 'Saved static custom pages details.');
                    alert('Custom static pages modified!');
                  }}
                  className="bg-brand-green text-white px-5 py-2 rounded-xl font-bold"
                >
                  Save Informational Content Blocks
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-4.5 h-4.5 text-brand-green" /> Coupons & Promo Codes
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Control flat rates, discount ratios, and purchase requirements.</p>
                </div>
                <button
                  onClick={() => {
                    setCouponForm({ code: '', description: '', discountType: 'fixed', discountValue: 15, minPurchase: 100 });
                    setShowCouponModal('add');
                  }}
                  className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  + Add Coupon
                </button>
              </div>

              <div className="space-y-3.5">
                {coupons.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 flex justify-between items-center text-xs font-semibold">
                    <div>
                      <span className="font-mono font-black text-brand-green bg-emerald-50 border border-emerald-100/60 px-2.5 py-0.5 rounded tracking-wider">{c.code}</span>
                      <p className="text-neutral-600 mt-2">{c.description}</p>
                      <span className="text-[10px] text-neutral-400 block mt-1">Discount amount: <strong>₹{c.discountValue}</strong> • Minimum Order: <strong>₹{c.minPurchase}</strong></span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setCouponForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, minPurchase: c.minPurchase });
                          setShowCouponModal(c);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-brand-green"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete coupon code?')) {
                            await deleteCouponFromFirebase(c.id);
                            logActivity('Delete Coupon', `Deleted coupon code ${c.code}.`);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: REVIEW MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Ratings Feed Moderation</h2>
                <p className="text-[10px] text-neutral-400 font-semibold">Audit user feedback rating indices, approve customer inputs, or remove feedback.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-xs font-semibold space-y-2 relative">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-extrabold text-neutral-800 text-sm">Nayanmoni Bora</span>
                    <div className="flex text-amber-400"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
                  </div>
                  <p className="text-neutral-600 font-medium">"Absolute sweet and genuine organic robusta bananas. Fast Christian Basti delivery within 15 minutes."</p>
                  <div className="flex justify-between items-center pt-2 text-[10px] text-neutral-400">
                    <span>Product: Robusta Bananas (Organic)</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: BROADCAST ALERTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4.5 h-4.5 text-brand-orange animate-bounce" /> Broadcast Alerts System
                </h2>
                <p className="text-[10px] text-neutral-400 font-semibold">Dispatch instant notifications to all customer dashboards and notifications queues.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const title = target.notifTitle.value;
                  const msg = target.notifMsg.value;
                  if (title && msg) {
                    onBroadcastNotification(title, msg);
                    logActivity('Broadcast Alert', `Sent notification: "${title}".`);
                    target.reset();
                    alert('Broadcast sent successfully!');
                  }
                }}
                className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-4 text-xs font-semibold"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-black">Notification Title</label>
                  <input name="notifTitle" required placeholder="Restocked Organic Malbhog Bananas!" className="w-full bg-white px-3.5 py-2 rounded-lg border border-neutral-200 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-black">Detailed Alert Message Description</label>
                  <input name="notifMsg" required placeholder="Take flat ₹50 off using coupon winter code inside." className="w-full bg-white px-3.5 py-2 rounded-lg border border-neutral-200 outline-none" />
                </div>

                <button type="submit" className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider">
                  Broadcast Push Notification
                </button>
              </form>
            </div>
          )}

          {/* TAB 13: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <SettingsIcon className="w-4.5 h-4.5 text-brand-green" /> Master System Cockpit Settings
                </h2>
                <p className="text-[10px] text-neutral-400 font-semibold">Configure payment thresholds, tax details, shipping charges, and database configurations.</p>
              </div>

              <div className="bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100 space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase">Website/Store Name</label>
                    <input type="text" defaultValue="Jitu Moni Grocery" className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase">Min Purchase Threshold (₹)</label>
                    <input
                      type="number"
                      value={storeSettings.minimumOrderAmount}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase">Standard Delivery Charges (₹)</label>
                    <input
                      type="number"
                      value={storeSettings.deliveryChargeStandard}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, deliveryChargeStandard: Number(e.target.value) }))}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase">Guwahati Christian Basti physical outlet address</label>
                  <input
                    type="text"
                    value={storeSettings.storeAddress}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase">Support Phone</label>
                    <input
                      type="text"
                      value={storeSettings.supportPhone}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase">Support Email</label>
                    <input
                      type="text"
                      value={storeSettings.supportEmail}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex gap-3 flex-wrap">
                  <button
                    onClick={async () => {
                      await saveSettingsInFirebase(storeSettings);
                      logActivity('System Settings', 'Saved system configurations.');
                      alert('Store configurations persistent in Firebase!');
                    }}
                    className="bg-brand-green text-white px-5 py-2 rounded-xl font-bold uppercase tracking-wider"
                  >
                    Save System Config
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm('WARNING: This will overwrite your active Firebase collections with fresh catalogue seed datasets. Proceed?')) {
                        try {
                          await forceSeedDatabase((msg) => alert(msg));
                          logActivity('Seed Firebase', 'Executed hard re-seed of the product database.');
                        } catch (err) {}
                      }
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-Seed Firebase collections
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3">
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Asset Media Gallery</h2>
                <p className="text-[10px] text-neutral-400 font-semibold">Store, audit, search, and preview image asset URLs used inside catalogue products.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {products.slice(0, 8).map(p => (
                  <div key={p.id} className="bg-neutral-50 rounded-2xl border border-neutral-100 p-3 text-center text-[10px] font-semibold">
                    <img src={p.image} alt="" className="w-20 h-20 object-contain bg-white border rounded mx-auto mb-2" referrerPolicy="no-referrer" />
                    <span className="block truncate text-neutral-700 max-w-full">{p.name}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(p.image);
                        alert('URL Copied to clipboard!');
                      }}
                      className="text-brand-green font-black hover:underline mt-1.5 block mx-auto uppercase"
                    >
                      Copy URL Asset
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 15: ANALYTICAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Financial Transactions Reports</h2>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">View transaction ledgers, daily sales indexes, and download summaries.</p>
                </div>
                <button
                  onClick={() => {
                    const header = "Order ID,Customer ID,Payment Status,Total Amount\n";
                    const rows = orders.map(o => `"${o.id}","${o.userId}","${o.paymentStatus}",₹${o.total}`).join("\n");
                    const blob = new Blob([header + rows], { type: 'text/csv' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'jitu_moni_grocery_sales_report.csv';
                    a.click();
                  }}
                  className="bg-brand-green hover:bg-brand-green-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download CSV Spreadsheet
                </button>
              </div>

              {/* Transactions Ledger */}
              <div className="overflow-x-auto bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100">
                <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block mb-3">Live Sales Ledger</span>
                <table className="w-full text-xs text-neutral-600 font-semibold">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 text-left uppercase text-[9px]">
                      <th className="pb-2">Order log ID</th>
                      <th className="pb-2">Fulfillment</th>
                      <th className="pb-2">Payment status</th>
                      <th className="pb-2 text-right">Sum paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className="py-2.5 font-mono text-neutral-800">{o.id}</td>
                        <td className="py-2.5 uppercase text-[9px] font-black">{o.status}</td>
                        <td className="py-2.5 font-black">{o.paymentStatus}</td>
                        <td className="py-2.5 text-right font-black text-neutral-800">₹{o.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 16: ACTIVITY LOGS */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-50 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Administrator Action Audits</h2>
                  <p className="text-[10px] text-neutral-400 font-semibold">Complete accountability trail logging every portal interaction.</p>
                </div>
                <button onClick={() => setActivities([])} className="text-red-500 font-black text-xs hover:underline">Clear Logs</button>
              </div>

              <div className="space-y-3">
                {activities.map(log => (
                  <div key={log.id} className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 text-xs font-semibold">
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>By: {log.user}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <h4 className="font-extrabold text-neutral-800 mt-1.5">{log.action}</h4>
                    <p className="text-neutral-500 mt-1 leading-normal font-medium">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ----------------- MODAL FRAMEWORKS ----------------- */}

      {/* Product Edit / Add Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-semibold">
          <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-3xl border border-neutral-100 w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-50 pb-2.5">
              <h3 className="font-black text-neutral-900 text-sm uppercase tracking-wider">
                {showProductModal === 'add' ? 'Create Sourced Product' : 'Configure Product SKU'}
              </h3>
              <button type="button" onClick={() => setShowProductModal(null)} className="p-1 text-neutral-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block font-black">Product Name*</label>
              <input required type="text" value={prodForm.name} onChange={(e) => setProdForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Category*</label>
                <select value={prodForm.category} onChange={(e) => setProdForm(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none">
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Brand Name*</label>
                <input required type="text" value={prodForm.brand} onChange={(e) => setProdForm(prev => ({ ...prev, brand: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Sale Price (₹)*</label>
                <input required type="number" value={prodForm.price} onChange={(e) => setProdForm(prev => ({ ...prev, price: Number(e.target.value) }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Original Price (₹)</label>
                <input type="number" value={prodForm.originalPrice} onChange={(e) => setProdForm(prev => ({ ...prev, originalPrice: Number(e.target.value) }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Unit Sizing*</label>
                <input required type="text" value={prodForm.unit} onChange={(e) => setProdForm(prev => ({ ...prev, unit: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Barcode Number</label>
                <input type="text" value={prodForm.barcode} onChange={(e) => setProdForm(prev => ({ ...prev, barcode: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none font-mono text-[10px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">SKU Code</label>
                <input type="text" value={prodForm.sku} onChange={(e) => setProdForm(prev => ({ ...prev, sku: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none font-mono text-[10px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block font-black">Inventory Stock*</label>
                <input required type="number" value={prodForm.stock} onChange={(e) => setProdForm(prev => ({ ...prev, stock: Number(e.target.value) }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block font-black">Multiple Image URL Assets</label>
              <input type="text" value={prodForm.image} onChange={(e) => setProdForm(prev => ({ ...prev, image: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block font-black">Product Details Description</label>
              <textarea rows={3} value={prodForm.description} onChange={(e) => setProdForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-neutral-50 p-3 rounded-lg border border-neutral-200 outline-none" />
            </div>

            <div className="pt-3 border-t border-neutral-100 flex gap-2.5">
              <button type="submit" className="flex-1 bg-brand-green text-white font-bold py-2.5 rounded-xl uppercase tracking-wider">
                {showProductModal === 'add' ? 'Publish Sourced Item' : 'Save Configured Item'}
              </button>
              <button type="button" onClick={() => setShowProductModal(null)} className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 font-bold uppercase">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Editor Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-semibold">
          <form onSubmit={handleCategorySubmit} className="bg-white p-6 rounded-3xl border border-neutral-100 w-full max-w-sm space-y-4">
            <h3 className="font-black text-neutral-900 text-sm uppercase">{showCategoryModal === 'add' ? 'Create Category' : 'Edit Category'}</h3>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Category Name</label><input required type="text" value={catForm.name} onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Slug Identifier</label><input type="text" value={catForm.slug} placeholder="e.g. fresh-organic" onChange={(e) => setCatForm(prev => ({ ...prev, slug: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Category Illustration URL</label><input type="text" value={catForm.image} onChange={(e) => setCatForm(prev => ({ ...prev, image: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <button type="submit" className="w-full bg-brand-green text-white font-bold py-2.5 rounded-xl">Save Category</button>
            <button type="button" onClick={() => setShowCategoryModal(null)} className="w-full text-center text-neutral-500 font-bold hover:underline">Cancel</button>
          </form>
        </div>
      )}

      {/* Brand Editor Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-semibold">
          <form onSubmit={handleBrandSubmit} className="bg-white p-6 rounded-3xl border border-neutral-100 w-full max-w-sm space-y-4">
            <h3 className="font-black text-neutral-900 text-sm uppercase">{showBrandModal === 'add' ? 'Create Brand' : 'Edit Brand'}</h3>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Brand Name</label><input required type="text" value={brandForm.name} onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Brand Logo/Vector Icon URL</label><input type="text" value={brandForm.logo} onChange={(e) => setBrandForm(prev => ({ ...prev, logo: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <button type="submit" className="w-full bg-brand-green text-white font-bold py-2.5 rounded-xl">Save Brand Partner</button>
            <button type="button" onClick={() => setShowBrandModal(null)} className="w-full text-center text-neutral-500 font-bold hover:underline">Cancel</button>
          </form>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-semibold">
          <form onSubmit={handleCouponSubmit} className="bg-white p-6 rounded-3xl border border-neutral-100 w-full max-w-sm space-y-4">
            <h3 className="font-black text-neutral-900 text-sm uppercase">{showCouponModal === 'add' ? 'Create Promo Coupon' : 'Edit Promo Coupon'}</h3>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase font-black">Coupon Code (Uppercase)</label><input required type="text" value={couponForm.code} onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Coupon Benefit Description</label><input required type="text" value={couponForm.description} onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 outline-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Discount Slashed (₹)</label><input required type="number" value={couponForm.discountValue} onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200" /></div>
              <div className="space-y-1"><label className="text-[9px] text-neutral-400 uppercase">Minimum order sum (₹)</label><input required type="number" value={couponForm.minPurchase} onChange={(e) => setCouponForm(prev => ({ ...prev, minPurchase: Number(e.target.value) }))} className="w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200" /></div>
            </div>
            <button type="submit" className="w-full bg-brand-green text-white font-bold py-2.5 rounded-xl">Save Coupon Code</button>
            <button type="button" onClick={() => setShowCouponModal(null)} className="w-full text-center text-neutral-500 font-bold hover:underline">Cancel</button>
          </form>
        </div>
      )}

      {/* Invoice Printer Modal */}
      {showInvoiceOrder && (
        <div className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-left">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl space-y-6 relative overflow-y-auto max-h-[85vh]">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Jitu Moni Premium Grocery</h3>
                <p className="text-[10px] text-neutral-400">christian Basti, GS Road, Guwahati, Assam</p>
                <p className="text-[10px] text-neutral-400">Support phone: +91 98765 43210</p>
              </div>
              <button onClick={() => setShowInvoiceOrder(null)} className="text-neutral-400 hover:text-red-600"><X className="w-5 h-5" /></button>
            </div>

            {/* Bill details */}
            <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold text-neutral-500">
              <div>
                <span className="text-[9px] text-neutral-400 uppercase block font-black">Billed To client</span>
                <span className="text-neutral-800 font-bold text-xs block">{showInvoiceOrder.address?.fullName || showInvoiceOrder.userId}</span>
                <span className="block mt-0.5">{showInvoiceOrder.address?.street || 'christian Basti Guwahati'}</span>
                <span>Phone: {showInvoiceOrder.address?.phone || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-neutral-400 uppercase block font-black">Invoice metadata</span>
                <span className="text-neutral-800 font-bold text-xs block font-mono">{showInvoiceOrder.id}</span>
                <span className="block">Fulfillment: <strong className="text-brand-green">{showInvoiceOrder.status}</strong></span>
                <span>Date: {new Date(showInvoiceOrder.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Items grid table */}
            <div className="border-t border-b border-neutral-100 py-3 text-[10px] font-bold text-neutral-700">
              <div className="grid grid-cols-12 gap-2 text-[9px] text-neutral-400 uppercase tracking-wider mb-2">
                <span className="col-span-6">Item description</span>
                <span className="col-span-2 text-center">Unit price</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Sum total</span>
              </div>

              {showInvoiceOrder.items?.map(it => (
                <div key={it.product.id} className="grid grid-cols-12 gap-2 py-1.5 border-t border-neutral-50 items-center font-semibold text-neutral-800">
                  <span className="col-span-6 font-bold">{it.product.name} ({it.product.unit})</span>
                  <span className="col-span-2 text-center">₹{it.product.price}</span>
                  <span className="col-span-2 text-center font-mono">x {it.quantity}</span>
                  <span className="col-span-2 text-right font-black">₹{it.product.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Order totals list */}
            <div className="space-y-1.5 text-right font-semibold text-[10px] text-neutral-500">
              <div>Subtotal: <strong className="text-neutral-800">₹{showInvoiceOrder.subtotal}</strong></div>
              <div>Fulfillment charges: <strong className="text-neutral-800">₹{showInvoiceOrder.deliveryCharges}</strong></div>
              <div>Promo discount: <strong className="text-brand-orange">-₹{showInvoiceOrder.discount}</strong></div>
              <div className="text-sm font-black text-neutral-900 border-t border-neutral-100 pt-2">Gross Total sum: <span className="text-brand-green text-base">₹{showInvoiceOrder.total}</span></div>
            </div>

            {/* Print action and back close */}
            <div className="pt-4 border-t border-neutral-100 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  logActivity('Print Invoice', `Triggered invoice print for order ${showInvoiceOrder.id}.`);
                }}
                className="flex-1 bg-brand-green hover:bg-brand-green-hover text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" /> Trigger Print Invoice
              </button>
              <button onClick={() => setShowInvoiceOrder(null)} className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer profile modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
              <h3 className="font-black text-neutral-900 text-sm uppercase">Client Record Detail</h3>
              <button onClick={() => setShowCustomerModal(null)} className="text-neutral-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-neutral-400 uppercase block font-black">Registered full name</span>
              <span className="text-sm font-bold text-neutral-800 block">{showCustomerModal.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-neutral-400 uppercase block font-black">Email ID metadata</span>
              <span className="text-sm text-neutral-600 font-mono block">{showCustomerModal.email}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-neutral-400 uppercase block font-black">Contact Phone</span>
              <span className="text-sm text-neutral-600 font-mono block">{showCustomerModal.phone || 'N/A'}</span>
            </div>

            <div className="space-y-1 pt-2 border-t border-neutral-100">
              <span className="text-[9px] text-neutral-400 uppercase block font-black">Orders associated logs count</span>
              <span className="text-sm font-black text-brand-green block">
                {orders.filter(o => o.userId === showCustomerModal.id).length} Purchases registered
              </span>
            </div>

            <button onClick={() => setShowCustomerModal(null)} className="w-full bg-neutral-100 text-neutral-600 py-2 rounded-xl font-bold">Close details</button>
          </div>
        </div>
      )}
    </div>
  );
}
