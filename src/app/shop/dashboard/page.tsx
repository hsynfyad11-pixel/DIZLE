'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Tag,
  Search,
  ImageIcon,
  MessageCircle,
  Settings,
  MapPin,
  Phone,
  ArrowRight,
  FolderPlus,
  Store as StoreIcon
} from 'lucide-react';

interface Product {
  id: string;
  shopId: string;
  nameAr: string;
  name?: string;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  status: string;
  altProductName?: string | null;
  altUnitPrice?: number | null;
  product: Product;
}

interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  totalPrice: number;
  deliveryFee: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  substitutionPreference?: string;
  houseImage?: string | null;
  items: OrderItem[];
}

interface Shop {
  id: string;
  nameAr: string;
  description?: string | null;
  category: string;
  deliveryFee: number;
  minOrderAmount: number;
  imageUrl?: string | null;
  phone?: string | null;
  areaName?: string | null;
  isAvailable: boolean;
  products: Product[];
  orders: Order[];
}

// Preset Categories suitable for Local Markets, Supermarkets & Restaurants
const DEFAULT_PRESET_CATEGORIES = [
  'العروض والتخفيضات 🏷️',
  'الأجبان والألبان 🧀',
  'الخضروات والفواكه 🍎',
  'المشروبات والمياه 🥤',
  'المأكولات والمشويات 🍖',
  'الغذائيات والبقوليات 🌾',
  'المنظفات والعناية 🧼',
  'المستلزمات العامة 📦',
];

export default function ShopDashboardPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS' | 'PROFILE'>('PRODUCTS');

  // Inventory Bulk Search & Category Filter State
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');

  // Shop Settings / Profile State
  const [shopNameInput, setShopNameInput] = useState('');
  const [shopDescriptionInput, setShopDescriptionInput] = useState('');
  const [shopPhoneInput, setShopPhoneInput] = useState('');
  const [shopAreaInput, setShopAreaInput] = useState('');
  const [shopIsAvailableInput, setShopIsAvailableInput] = useState(true);
  const [shopDeliveryFeeInput, setShopDeliveryFeeInput] = useState('');
  const [shopMinOrderAmountInput, setShopMinOrderAmountInput] = useState('');
  const [shopImageUrlInput, setShopImageUrlInput] = useState('');
  const [shopPasswordInput, setShopPasswordInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  // Modal State for Add / Edit Product
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productNameAr, setProductNameAr] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [actionError, setActionError] = useState('');

  // Substitute UI state per item (key is itemId)
  type SubState = { mode: 'INVENTORY' | 'CUSTOM', selectedProductId?: string, customName?: string, customPrice?: string };
  const [substituteUIs, setSubstituteUIs] = useState<Record<string, SubState>>({});

  const handleSuggestAlternative = async (itemId: string) => {
    const state = substituteUIs[itemId];
    if (!state) return;
    let altName = '';
    let altPrice = '';
    if (state.mode === 'INVENTORY' && state.selectedProductId) {
      const prod = shop?.products.find(p => p.id === state.selectedProductId);
      if (prod) {
        altName = prod.nameAr;
        altPrice = prod.price.toString();
      }
    } else if (state.mode === 'CUSTOM') {
      altName = state.customName || '';
      altPrice = state.customPrice || '';
    }
    
    if (!altName.trim()) {
      alert('يرجى تحديد تفاصيل البديل المقترح');
      return;
    }
    
    try {
      const res = await fetch('/api/shop/orders/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, altProductName: altName, altUnitPrice: altPrice })
      });
      const data = await res.json();
      if (data.success) {
        setSubstituteUIs(prev => { const n = {...prev}; delete n[itemId]; return n; });
        fetchDashboardData();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (e) { console.error('Error suggesting alternative:', e); }
  };

  // Transport Mode Selection per Order
  const [transportModes, setTransportModes] = useState<Record<string, string>>({});

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setActionError('حجم الصورة كبير جداً، يرجى اختيار صورة حجمها أقل من 5 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };


  // Dynamic Categories list collected from presets + existing products
  const [allCategories, setAllCategories] = useState<string[]>(DEFAULT_PRESET_CATEGORIES);

  useEffect(() => {
    fetchDashboardData(false);
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      const shopSession = typeof window !== 'undefined' ? localStorage.getItem('dazly_shop_session') : null;
      if (!shopSession) {
        window.location.href = '/login/shop';
        return;
      }

      if (!silent) setLoading(true);
      const res = await fetch(`/api/shop/dashboard?shopId=${shopSession}`);
      
      if (res.status === 401) {
        localStorage.removeItem('dazly_shop_session');
        window.location.href = '/login/shop';
        return;
      }

      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        
        // Extract unique categories from existing products and merge with defaults
        const existingCats = data.shop.products
          .map((p: Product) => p.category)
          .filter(Boolean);
        const merged = Array.from(new Set([...DEFAULT_PRESET_CATEGORIES, ...existingCats]));
        setAllCategories(merged);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (shop) {
      setShopNameInput(shop.nameAr || '');
      setShopDescriptionInput(shop.description || '');
      setShopPhoneInput(shop.phone || '');
      setShopAreaInput(shop.areaName || '');
      setShopIsAvailableInput(shop.isAvailable ?? true);
      setShopDeliveryFeeInput(shop.deliveryFee?.toString() || '');
      setShopMinOrderAmountInput(shop.minOrderAmount?.toString() || '');
      setShopImageUrlInput(shop.imageUrl || '');
      setShopPasswordInput('');
    }
  }, [shop]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductNameAr('');
    const defaultCat = allCategories[0] || DEFAULT_PRESET_CATEGORIES[0];
    setProductCategory(defaultCat);
    setCustomCategory('');
    setIsCustomCategoryMode(false);
    setProductPrice('');
    setProductDescription('');
    setProductImageUrl('');
    setProductIsAvailable(true);
    setActionError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductNameAr(product.nameAr);
    
    const cat = product.category || DEFAULT_PRESET_CATEGORIES[0];
    if (allCategories.includes(cat)) {
      setProductCategory(cat);
      setIsCustomCategoryMode(false);
      setCustomCategory('');
    } else {
      setProductCategory('__NEW__');
      setIsCustomCategoryMode(true);
      setCustomCategory(cat);
    }

    setProductPrice(product.price.toString());
    setProductDescription(product.description || '');
    setProductImageUrl(product.imageUrl || '');
    setProductIsAvailable(product.isAvailable);
    setActionError('');
    setModalOpen(true);
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__NEW__') {
      setIsCustomCategoryMode(true);
      setProductCategory('__NEW__');
      setCustomCategory('');
    } else {
      setIsCustomCategoryMode(false);
      setProductCategory(val);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory Category Validation
    const finalCategory = isCustomCategoryMode ? customCategory.trim() : productCategory.trim();

    if (!productNameAr.trim() || !finalCategory || !productPrice || Number(productPrice) <= 0) {
      setActionError('يرجى ملء اسم المنتج، اختيار/إدخال الفئة الإلزامية، والسعر بشكل صحيح');
      return;
    }

    try {
      setSavingProduct(true);
      setActionError('');

      const res = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct ? editingProduct.id : undefined,
          shopId: shop?.id || (typeof window !== 'undefined' ? localStorage.getItem('dazly_shop_session') : null),
          nameAr: productNameAr,
          category: finalCategory,
          price: Number(productPrice),
          description: productDescription,
          imageUrl: productImageUrl,
          isAvailable: productIsAvailable,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchDashboardData();
      } else {
        setActionError(data.error || 'فشل في حفظ المنتج');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setActionError('خطأ أثناء التواصل مع الخادم');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    try {
      setSavingSettings(true);
      setProfileSuccessMsg('');
      const res = await fetch('/api/shop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          nameAr: shopNameInput,
          description: shopDescriptionInput,
          phone: shopPhoneInput,
          areaName: shopAreaInput,
          isAvailable: shopIsAvailableInput,
          deliveryFee: Number(shopDeliveryFeeInput),
          minOrderAmount: Number(shopMinOrderAmountInput),
          imageUrl: shopImageUrlInput,
          password: shopPasswordInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSuccessMsg('تم حفظ بيانات المتجر بنجاح!');
        fetchDashboardData();
      } else {
        alert(data.error || 'حدث خطأ في حفظ الإعدادات');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const res = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          shopId: shop?.id || (typeof window !== 'undefined' ? localStorage.getItem('dazly_shop_session') : null),
          nameAr: product.nameAr,
          category: product.category,
          price: product.price,
          description: product.description,
          imageUrl: product.imageUrl,
          isAvailable: !product.isAvailable,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المنتج؟')) return;

    try {
      const res = await fetch(`/api/shop/products?id=${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, transportMode?: string) => {
    try {
      const order = shop?.orders.find(o => o.id === orderId);
      if (order?.status === 'PENDING_CUSTOMER_APPROVAL' && newStatus === 'PREPARING') {
        alert('تحذير: لا يمكنك معالجة هذا الطلب. بانتظار الزبون للموافقة على البديل المقترح أولاً.');
        return;
      }

      const payload: any = { orderId, status: newStatus };
      if (transportMode) payload.transportMode = transportMode;

      const res = await fetch('/api/shop/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData(true);
      } else {
        alert(data.error || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟ إجراء لا يمكن التراجع عنه.')) return;

    try {
      const res = await fetch(`/api/shop/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm font-bold">جاري تحميل لوحة تحكم المتجر والفئات...</p>
      </div>
    );
  }

  const productsCount = shop?.products.length || 0;
  const ordersCount = shop?.orders.length || 0;
  const pendingOrders = shop?.orders.filter((o) => o.status === 'PENDING' || o.status === 'PREPARING') || [];

  return (
    <div className="space-y-6">
      
      {/* Header & Back link */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تطبيق دزلي DIZLY</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-purple-500/40 overflow-hidden shrink-0 flex items-center justify-center">
              {shop?.imageUrl ? (
                <img src={shop.imageUrl} alt={shop.nameAr} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-100">{shop?.nameAr}</h1>
              <span className="text-[11px] text-purple-300 font-semibold">لوحة تحكم وإدارة المنتجات والشعار</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-900 border border-purple-900/40 rounded-2xl space-y-1 text-right">
          <p className="text-[11px] text-slate-400 font-medium">إجمالي المنتجات</p>
          <p className="text-xl font-black text-purple-400">{productsCount}</p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 text-right">
          <p className="text-[11px] text-slate-400 font-medium">الطلبات الكلية</p>
          <p className="text-xl font-black text-slate-100">{ordersCount}</p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-amber-900/40 rounded-2xl space-y-1 text-right">
          <p className="text-[11px] text-slate-400 font-medium">طلبات جارية</p>
          <p className="text-xl font-black text-amber-400">{pendingOrders.length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-2 pr-1 min-w-max">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>إدارة المنتجات ({productsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl font-extrabold text-xs transition-all relative ${
              activeTab === 'ORDERS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>الطلبات الواردة ({ordersCount})</span>
            {pendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ملف وإعدادات المتجر</span>
          </button>
        </div>

        {activeTab === 'PRODUCTS' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 py-2 px-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        )}
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          
          {/* Bulk Inventory Search & Department Filter Bar */}
          {shop?.products && shop.products.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="ابحث في مخزون المنتجات والأصناف..."
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                  className="w-full py-2 px-3 pr-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-purple-500 text-right"
                />
                <Search className="w-4 h-4 text-purple-400 absolute top-2.5 right-3" />
                {inventorySearchQuery && (
                  <button onClick={() => setInventorySearchQuery('')} className="absolute top-2.5 left-3 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Department Filter Dropdown */}
              <div className="w-full sm:w-auto shrink-0">
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500 text-right"
                >
                  <option value="ALL">كافة الأقسام والتصنيفات ({productsCount})</option>
                  {Array.from(new Set(shop.products.map((p) => p.category || 'المستلزمات العامة'))).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({shop.products.filter((p) => (p.category || 'المستلزمات العامة') === cat).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {shop?.products.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold">لا توجد منتجات مضافة لهذا المتجر حالياً</p>
              <button
                onClick={handleOpenAddModal}
                className="py-2.5 px-5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                إضافة أول منتج
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shop?.products
                .filter((product) => {
                  if (inventoryCategoryFilter !== 'ALL' && (product.category || 'المستلزمات العامة') !== inventoryCategoryFilter) {
                    return false;
                  }
                  if (inventorySearchQuery.trim()) {
                    const q = inventorySearchQuery.toLowerCase().trim();
                    const matchName = product.nameAr?.toLowerCase().includes(q);
                    const matchDesc = product.description?.toLowerCase().includes(q);
                    const matchCat = product.category?.toLowerCase().includes(q);
                    return matchName || matchDesc || matchCat;
                  }
                  return true;
                })
                .map((product) => (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-2xl border transition-all text-slate-100 flex items-center justify-between gap-3 ${
                    product.isAvailable
                      ? 'bg-slate-900 border-slate-800 hover:border-purple-800/60'
                      : 'bg-slate-950/60 border-red-900/30 opacity-75'
                  }`}
                >
                  <div className="space-y-1 text-right flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100 truncate">{product.nameAr}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {product.isAvailable ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-1 py-0.5 px-2 bg-purple-950/60 border border-purple-800/40 text-purple-300 rounded-md text-[11px] font-bold">
                      <Tag className="w-3 h-3 text-purple-400" />
                      <span>{product.category || 'المستلزمات العامة 📦'}</span>
                    </div>

                    {product.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                    )}

                    <p className="text-purple-400 font-extrabold text-sm pt-0.5">
                      {product.price.toLocaleString('en-US')} <span className="text-[11px] font-normal text-slate-400">د.ع</span>
                    </p>
                  </div>

                  {/* Actions (Toggle, Edit, Delete) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      title={product.isAvailable ? 'تعطيل التوفر' : 'تفعيل التوفر'}
                      className={`p-2 rounded-xl border transition-colors ${
                        product.isAvailable
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {product.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(product)}
                      title="تعديل المنتج"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-purple-400" />
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      title="حذف المنتج"
                      className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING ORDERS MANAGEMENT */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {shop?.orders.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold mt-2">لا توجد طلبات واردة لهذا المتجر حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shop?.orders.map((order) => (
                <div key={order.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-right">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-purple-400">#{order.id.slice(-6)}</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(order.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Order Status Badge & Delete Button */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        order.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : order.status === 'PENDING_CUSTOMER_APPROVAL'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse'
                          : order.status === 'AWAITING_COURIER'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : order.status === 'COURIER_ASSIGNED'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
                          : order.status === 'ON_THE_WAY'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {(order.status === 'PENDING' || order.status === 'PENDING_WHATSAPP_SENT') && 'قيد الانتظار'}
                        {order.status === 'PENDING_CUSTOMER_APPROVAL' && 'بانتظار رد الزبون ⚠️'}
                        {order.status === 'AWAITING_COURIER' && 'بانتظار مندوب 🔍'}
                        {order.status === 'COURIER_ASSIGNED' && 'المندوب في الطريق للمتجر 🛵'}
                        {order.status === 'ON_THE_WAY' && 'انطلق مع المندوب 🛵'}
                        {order.status === 'DELIVERED' && 'تم التسليم بنجاح'}
                        {order.status === 'CANCELLED' && 'تم إلغاء الطلب ❌'}
                      </span>
                      
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors border border-transparent hover:border-red-900/40"
                        title="حذف الطلب نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sanitized Products List with Out of Stock & Alternative Options */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <p className="font-bold text-slate-400 mb-1">المنتجات المطلوبة:</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">
                            {item.status === 'ALTERNATIVE_ACCEPTED' ? (
                               <span className="text-emerald-400">
                                 • {item.altProductName || item.product.nameAr} x{item.quantity} (بديل معتمد ✅)
                               </span>
                             ) : item.status === 'ALTERNATIVE_REJECTED' ? (
                               <span className="line-through text-red-500">
                                 • {item.product.nameAr} x{item.quantity} (محذوف ❌)
                               </span>
                             ) : (
                               <span>• {item.product.nameAr} x{item.quantity}</span>
                             )}
                          </span>
                          <span className="font-mono font-bold text-purple-400">{(item.unitPrice * item.quantity).toLocaleString('en-US')} د.ع</span>
                        </div>
                        
                        {/* Alternative Display */}
                        {item.status === 'OUT_OF_STOCK_HAS_ALTERNATIVE' && (
                          <div className="mt-2 p-2 bg-amber-950/40 border border-amber-900/40 rounded-lg text-[11px]">
                            <p className="text-amber-400 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> البديل المقترح:</p>
                            <p className="text-slate-300 mr-4 font-semibold">{item.altProductName}</p>
                            {Number(item.altUnitPrice) > 0 && <p className="text-slate-400 mr-4">بسعر: {Number(item.altUnitPrice).toLocaleString('en-US')} د.ع</p>}
                          </div>
                        )}

                        {/* Substitution UI Toggle & Controls */}
                        {item.status !== 'OUT_OF_STOCK_HAS_ALTERNATIVE' && (order.status === 'PENDING' || order.status === 'PENDING_WHATSAPP_SENT' || order.status === 'AWAITING_COURIER') && (
                          <div className="pt-1">
                            {!substituteUIs[item.id] ? (
                              <button
                                onClick={() => setSubstituteUIs(prev => ({...prev, [item.id]: { mode: 'INVENTORY' }}))}
                                className="text-[10px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>صنف مقطوع؟ اقتراح بديل للزبون</span>
                              </button>
                            ) : (
                              <div className="mt-2 space-y-2 p-2 bg-slate-900 rounded-lg border border-slate-700">
                                <div className="flex gap-2 mb-1">
                                  <button
                                    onClick={() => setSubstituteUIs(prev => ({...prev, [item.id]: { ...prev[item.id], mode: 'INVENTORY' }}))}
                                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${substituteUIs[item.id].mode === 'INVENTORY' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                                  >
                                    من المتجر
                                  </button>
                                  <button
                                    onClick={() => setSubstituteUIs(prev => ({...prev, [item.id]: { ...prev[item.id], mode: 'CUSTOM' }}))}
                                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${substituteUIs[item.id].mode === 'CUSTOM' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                                  >
                                    إدخال يدوي
                                  </button>
                                </div>
                                
                                {substituteUIs[item.id].mode === 'INVENTORY' ? (
                                  <select
                                    value={substituteUIs[item.id].selectedProductId || ''}
                                    onChange={e => setSubstituteUIs(prev => ({...prev, [item.id]: { ...prev[item.id], selectedProductId: e.target.value }}))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                  >
                                    <option value="">اختر البديل المتوفر...</option>
                                    {shop?.products.filter(p => p.id !== item.product.id && p.isAvailable).map(p => (
                                      <option key={p.id} value={p.id}>{p.nameAr} - {p.price.toLocaleString('en-US')} د.ع</option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="space-y-1.5">
                                    <input 
                                      type="text" placeholder="اسم المنتج البديل..."
                                      value={substituteUIs[item.id].customName || ''}
                                      onChange={e => setSubstituteUIs(prev => ({...prev, [item.id]: { ...prev[item.id], customName: e.target.value }}))}
                                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                                    />
                                    <input 
                                      type="number" placeholder="سعر البديل (اختياري)..."
                                      value={substituteUIs[item.id].customPrice || ''}
                                      onChange={e => setSubstituteUIs(prev => ({...prev, [item.id]: { ...prev[item.id], customPrice: e.target.value }}))}
                                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                                    />
                                  </div>
                                )}
                                
                                <div className="flex gap-2 mt-1">
                                  <button onClick={() => handleSuggestAlternative(item.id)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-1.5 rounded text-[10px]">
                                    تأكيد وحفظ البديل
                                  </button>
                                  <button onClick={() => setSubstituteUIs(prev => { const n = {...prev}; delete n[item.id]; return n; })} className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.houseImage && (
                    <div className="pt-2 border-t border-slate-800/80 mb-2">
                       <p className="font-bold text-slate-400 text-xs mb-1.5 flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-emerald-400" /> صورة واجهة/باب المنزل:</p>
                       <img src={order.houseImage} alt="باب المنزل" className="w-full h-40 object-cover rounded-xl border border-slate-700 shadow-sm" />
                    </div>
                  )}

                  {/* Status Change Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-200">
                        قيمة التجهيز: <span className="text-purple-400">{order.totalPrice.toLocaleString('en-US')} د.ع</span>
                      </span>
                      {order.substitutionPreference && (
                        <div className="flex items-center gap-1 mt-1 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700 w-max">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-slate-300">
                            تفضيل البديل: <span className="text-amber-400">{order.substitutionPreference}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(order.status === 'PENDING' || order.status === 'PENDING_WHATSAPP_SENT') && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'AWAITING_COURIER')}
                          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
                        >
                          بدء التجهيز وطلب مندوب 🛵
                        </button>
                      )}
                      
                      {order.status === 'PENDING_CUSTOMER_APPROVAL' && (
                        <div className="flex flex-col gap-2">
                          <button
                            disabled
                            className="w-full py-1.5 px-3 bg-slate-800 text-slate-500 font-bold rounded-xl border border-slate-700 cursor-not-allowed flex items-center justify-center gap-1.5"
                            title="بانتظار موافقة الزبون على اقتراحك"
                          >
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            بانتظار موافقة الزبون...
                          </button>
                          
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/\D/g, '').replace(/^0/, '964')}?text=${encodeURIComponent(`مرحباً بك، نعتذر منك لعدم توفر منتج (${order.items.filter(i => i.status === 'OUT_OF_STOCK_HAS_ALTERNATIVE').map(i => i.product.nameAr).join('، ')}) في طلبك رقم ${order.id.slice(-6)}.\nالاقترح البديل من المتجر: (${order.items.filter(i => i.status === 'OUT_OF_STOCK_HAS_ALTERNATIVE').map(i => i.altProductName).join('، ')}).\nيرجى مراجعة الطلب والموافقة عليه أو تعديله خلال ساعة عبر الرابط التالي لكي لا يتم إلغاء الطلب تلقائياً:\nhttps://${typeof window !== 'undefined' ? window.location.host : 'dizly.com'}/my-orders`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] font-bold text-[11px] rounded-xl border border-[#25D366]/40 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            إرسال عبر واتساب
                          </a>
                        </div>
                      )}
                      
                      {order.status === 'AWAITING_COURIER' && (
                        <div className="text-xs font-bold text-amber-400 animate-pulse bg-amber-950/40 p-2 rounded-xl border border-amber-900/40">
                          جاري البحث عن مندوب... 🛵
                        </div>
                      )}
                      
                      {order.status === 'COURIER_ASSIGNED' && (
                        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                          <select
                            value={transportModes[order.id] || 'تكتك'}
                            onChange={(e) => setTransportModes(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs py-1.5 px-2 focus:outline-none focus:border-blue-500 font-bold"
                          >
                            <option value="تكتك">تكتك 🛺</option>
                            <option value="دراجة">دراجة 🛵</option>
                            <option value="ستوتة">ستوتة 🛻</option>
                          </select>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'ON_THE_WAY', transportModes[order.id] || 'تكتك')}
                            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                          >
                            تسليم للمندوب
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORE PROFILE & SETTINGS */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>إدارة ملف المتجر والإعدادات الأساسية</span>
            </h2>

            {profileSuccessMsg && (
              <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5 text-right text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">اسم المتجر</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shopNameInput}
                    onChange={(e) => setShopNameInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <Store className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">رقم الهاتف (للتواصل)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={shopPhoneInput}
                    onChange={(e) => setShopPhoneInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-purple-500 transition-colors tracking-wider"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">المنطقة / العنوان الزمني</label>
                <div className="relative">
                  <input
                    type="text"
                    value={shopAreaInput}
                    onChange={(e) => setShopAreaInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-300 block">تغيير كلمة المرور (اختياري)</label>
                <input
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة في حال رغبت بتغييرها"
                  value={shopPasswordInput}
                  onChange={(e) => setShopPasswordInput(e.target.value)}
                  className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors text-right dir-ltr"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-300 block">صورة واجهة المتجر (رابط أو Base64)</label>
                <div className="relative mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setShopImageUrlInput(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-slate-300 text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-900 file:text-white hover:file:bg-purple-800 file:cursor-pointer bg-slate-950 border border-slate-800 rounded-xl"
                  />
                </div>
                {shopImageUrlInput && (
                  <div className="mt-3 w-28 h-28 rounded-2xl overflow-hidden border-2 border-purple-800/40 opacity-90 mx-auto">
                    <img src={shopImageUrlInput} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">وصف قصير المتجر (اختياري)</label>
                <textarea
                  rows={2}
                  value={shopDescriptionInput}
                  onChange={(e) => setShopDescriptionInput(e.target.value)}
                  className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block text-xs">الحد الأدنى للطلبات</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={shopMinOrderAmountInput}
                    onChange={(e) => setShopMinOrderAmountInput(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block text-xs">أجرة توصيل المتجر</label>
                  <input
                    type="number"
                    min="0"
                    step="250"
                    value={shopDeliveryFeeInput}
                    onChange={(e) => setShopDeliveryFeeInput(e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors text-center"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-colors">
                  <div className="text-right">
                    <span className="font-bold text-slate-100 block">حالة العمل الأساسية</span>
                    <span className="text-xs text-slate-400">تحكم بظهور متجرك للمستخدمين (مفتوح / مغلق)</span>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full transition-colors duration-300" style={{ backgroundColor: shopIsAvailableInput ? '#10b981' : '#334155' }}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${shopIsAvailableInput ? 'right-1' : 'right-7'}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={shopIsAvailableInput}
                    onChange={(e) => setShopIsAvailableInput(e.target.checked)}
                  />
                </label>
              </div>

              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-4 text-white bg-purple-600 hover:bg-purple-500 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  <span>حفظ وإعدادات المتجر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2 mb-6">
              {editingProduct ? <Edit className="w-5 h-5 text-purple-400" /> : <Plus className="w-5 h-5 text-purple-400" />}
              <span>{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</span>
            </h2>

            {actionError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-right text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">اسم المنتج (عربي) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بيبسي عائلي 2 لتر"
                  value={productNameAr}
                  onChange={(e) => setProductNameAr(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">قسم / صنف المنتج *</label>
                <select
                  value={productCategory}
                  onChange={handleCategorySelectChange}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NEW__" className="text-purple-400 font-black">+ قسم جديد (كتابة يدوية)</option>
                </select>

                {isCustomCategoryMode && (
                  <div className="pt-2 animate-fadeIn">
                    <input
                      type="text"
                      required
                      placeholder="اكتب اسم القسم الجديد هنا..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full py-2.5 px-3 bg-purple-950/20 border border-purple-800/40 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">السعر (دينار عراقي) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="250"
                  placeholder="مثال: 1500"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">الوصف (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل إضافية عن المنتج..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  صورة المنتج (اختياري)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="w-full text-slate-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-900 file:text-white hover:file:bg-purple-800 cursor-pointer"
                />
                {productImageUrl && (
                  <div className="mt-2 w-24 h-24 rounded-2xl overflow-hidden border border-slate-700 mx-auto">
                    <img src={productImageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900">
                  <span className="font-bold text-slate-100">متوفر للطلب الآن؟</span>
                  <input
                    type="checkbox"
                    checked={productIsAvailable}
                    onChange={(e) => setProductIsAvailable(e.target.checked)}
                    className="w-5 h-5 accent-purple-500"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {savingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={savingProduct}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
