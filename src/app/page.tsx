'use client';

import React, { useState, useEffect } from 'react';
import { Shop, ShopCategory } from '@/types';
import { ShopCard } from '@/components/ShopCard';
import { OtherShopRow } from '@/components/OtherShopRow';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Sparkles, Truck, Store, ChevronDown, ChevronUp, Search, ShoppingBag, ShieldCheck, AlertCircle, ArrowRight, Navigation } from 'lucide-react';

// Skeleton Card component for graceful loading state
function ShopCardSkeleton() {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-3 animate-pulse shadow-md">
      <div className="h-36 w-full bg-slate-800/60 rounded-2xl" />
      <div className="flex items-center gap-3 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-3/4 bg-slate-800/80 rounded-md" />
          <div className="h-3 w-1/2 bg-slate-800/50 rounded-md" />
        </div>
      </div>
      <div className="h-3 w-full bg-slate-800/40 rounded-md" />
      <div className="pt-2 flex justify-between border-t border-slate-800/60">
        <div className="h-3 w-24 bg-slate-800/60 rounded-md" />
        <div className="h-3 w-16 bg-slate-800/60 rounded-md" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ShopCategory>('ALL');
  const [otherShopsExpanded, setOtherShopsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPendingApproval, setHasPendingApproval] = useState(false);

  useEffect(() => {
    fetchShops(selectedCategory);
    
    const checkApproval = async () => {
      const saved = localStorage.getItem('dazly_customer_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.phone) {
            const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(parsed.phone)}`);
            const data = await res.json();
            if (data.success && data.orders) {
              const pending = data.orders.some((o: any) => o.status === 'PENDING_CUSTOMER_APPROVAL');
              setHasPendingApproval(pending);
            }
          }
        } catch { }
      }
    };
    checkApproval();
    const interval = setInterval(checkApproval, 20000);
    return () => clearInterval(interval);

  }, [selectedCategory]);

  const fetchShops = async (category: 'ALL' | ShopCategory) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shops${category !== 'ALL' ? `?category=${category}` : ''}`);
      const data = await res.json();
      if (data.success) {
        setShops(data.shops || []);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops by search query if typed
  const filteredShops = (shops || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return s.nameAr.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query));
  });

  // Separate shops into Featured Shops (المتاجر المميزة) and Other Shops (متاجر أخرى)
  const featuredShops = filteredShops.filter((s) => s.isFeatured ?? true);
  const otherShops = filteredShops.filter((s) => !(s.isFeatured ?? true));

  return (
    <div className="space-y-6 pb-8">
      
      {hasPendingApproval && (
        <a href="/my-orders" className="block w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-3xl p-4 shadow-2xl shadow-orange-500/20 border border-orange-400 overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-white/20 rounded-2xl shadow-sm"><AlertCircle className="w-6 h-6 text-white" /></span>
              <div className="text-right">
                <p className="font-black text-sm md:text-base">تنبيه: المتجر اقترح بديلاً لطلبك!</p>
                <p className="text-xs md:text-sm font-medium text-orange-50 mt-0.5">اضغط هنا للمراجعة والموافقة على التعديلات لاستكمال التجهيز.</p>
              </div>
            </div>
            <div className="hidden sm:flex p-2 bg-white/20 rounded-xl group-hover:-translate-x-2 transition-transform">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </a>
      )}

      {/* Visual Modern Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 p-6 text-white shadow-2xl shadow-purple-950/50 border border-purple-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-400/30 backdrop-blur-md rounded-full text-xs font-black text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>توصيل سريع ومباشر في بغداد</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              تسوق من <span className="text-purple-300 underline decoration-purple-400 decoration-wavy">المتاجر والمحلات</span> المحلية
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-purple-800/40 shrink-0">
            <div className="flex items-center gap-1.5 font-extrabold text-purple-200">
              <Store className="w-4 h-4 text-purple-400" />
              <span>{shops.length} متجر متوفر</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 font-extrabold text-amber-300">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>توصيل ثابت 1,500 د.ع</span>
            </div>
          </div>
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Transport / Delivery Services Banner - أوصلني */}
      <a href="/transport" className="block w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl p-5 shadow-2xl shadow-emerald-500/20 border border-emerald-400 overflow-hidden relative group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="p-3 bg-white/20 rounded-2xl shadow-sm">
              <Navigation className="w-7 h-7 text-white" />
            </span>
            <div className="text-right">
              <h2 className="font-black text-lg md:text-xl flex items-center gap-2">
                خدمة <span className="text-emerald-100">أوصلني</span> <span>🚀</span>
              </h2>
              <p className="text-xs md:text-sm font-medium text-emerald-50 mt-1">
                احجز تكتك مشوار أو أرسل أمانة لأي مكان!
              </p>
            </div>
          </div>
          <div className="hidden sm:flex p-2 bg-white/20 rounded-xl group-hover:-translate-x-2 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </a>

      {/* Search & Category Filter Bar */}
      <section className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم محل أو مطعم..."
            className="w-full py-3 px-4 pr-11 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* Main Content View */}
      {loading ? (
        /* Graceful Skeleton Loader Grid instead of raw text */
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
            <span className="text-xs font-black text-slate-400">جاري تجميع بطاقات المتاجر...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ShopCardSkeleton />
            <ShopCardSkeleton />
            <ShopCardSkeleton />
            <ShopCardSkeleton />
            <ShopCardSkeleton />
            <ShopCardSkeleton />
          </div>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-7 h-7 text-purple-400" />
          </div>
          <p className="text-slate-200 font-extrabold text-base">لا توجد متاجر متوفرة حالياً</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">جرب تغير قسم التصفح أو ابحث بكلمة أخرى</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          
          {/* SECTION 1: FEATURED SHOPS GRID (المتاجر المميزة) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                <h2 className="text-lg font-black text-slate-100">المتاجر المميزة</h2>
                <span className="py-0.5 px-2.5 bg-purple-950 text-purple-300 text-[10px] font-black rounded-full border border-purple-800/40">
                  مميزة
                </span>
              </div>
              <span className="text-xs text-slate-400 font-bold font-mono">
                {featuredShops.length} متاجر
              </span>
            </div>

            {featuredShops.length === 0 ? (
              <div className="p-5 bg-slate-900/40 rounded-2xl text-center text-xs text-slate-400 border border-slate-800/60">
                لا توجد متاجر مميزة في هذا القسم حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredShops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: OTHER SHOPS (متاجر أخرى) */}
          {otherShops.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4.5 h-4.5 text-purple-400" />
                  <h2 className="text-base font-extrabold text-slate-200">متاجر أخرى</h2>
                </div>
                <span className="text-xs text-slate-400 font-bold font-mono">
                  {otherShops.length} متاجر
                </span>
              </div>

              {/* Expand / Collapse Control */}
              <button
                onClick={() => setOtherShopsExpanded(!otherShopsExpanded)}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 rounded-2xl flex items-center justify-between text-slate-200 font-bold text-xs transition-all active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="py-0.5 px-2 bg-slate-800 text-purple-300 rounded-lg text-[11px] font-mono border border-slate-700/60">
                    {otherShops.length}
                  </span>
                  <span>{otherShopsExpanded ? 'إخفاء المتاجر الأخرى' : 'عرض المتاجر الأخرى'}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  {otherShopsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Other Shops List */}
              {otherShopsExpanded && (
                <div className="space-y-2.5 pt-1 animate-fadeIn">
                  {otherShops.map((shop) => (
                    <OtherShopRow key={shop.id} shop={shop} />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      )}

    </div>
  );
}
