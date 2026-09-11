'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Sparkles, Truck, Star, ArrowRight, Tag, ShoppingBag, Search, X, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  shopId: string;
  nameAr: string;
  name?: string | null;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isLiveAvailable?: boolean;
}

interface Shop {
  id: string;
  nameAr: string;
  description?: string | null;
  category: string;
  areaName?: string | null;
  deliveryFee: number;
  minOrderAmount?: number;
  rating: number;
  products: Product[];
}

interface ShopCatalogViewProps {
  shop: Shop;
}

export const ShopCatalogView: React.FC<ShopCatalogViewProps> = ({ shop }) => {
  const isSupermarket = shop.category === 'SUPERMARKET';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Filter available products (including live stock check for Dazly Mart)
  const activeProducts = shop.products.filter((p) => {
    if (!p.isAvailable) return false;
    // @ts-ignore
    if (p.isLiveAvailable === false) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.nameAr?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    }
    return true;
  });

  // Extract unique categories in order of products
  const categories = Array.from(new Set(activeProducts.map((p) => p.category || 'المستلزمات العامة')));

  // Group products by category
  const productsByCategory: { [key: string]: Product[] } = {};
  categories.forEach((cat) => {
    productsByCategory[cat] = activeProducts.filter((p) => (p.category || 'المستلزمات العامة') === cat);
  });

  // IntersectionObserver to track active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const cat of categories) {
        const el = categoryRefs.current[cat];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategory(cat);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    if (el) {
      const yOffset = -150; // Sticky header offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back Navigation Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة لجميع المتاجر</span>
      </Link>

      {/* Shop Header Banner */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden space-y-3 ${
        isSupermarket
          ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-glow-mart'
          : 'bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-purple-500/40 shadow-glow-primary'
      }`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100">{shop.nameAr}</h1>
              {isSupermarket ? (
                <span className="py-0.5 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1 shadow border border-emerald-400/40">
                  <ShoppingCart className="w-3 h-3" />
                  سوبرماركت وهايبرماركت شامل 🛒
                </span>
              ) : (
                <span className="py-0.5 px-2.5 bg-purple-950 text-purple-300 font-bold text-[10px] rounded-md border border-purple-800/40">
                  متجر مميز
                </span>
              )}
            </div>
            {(shop.description || shop.areaName) && (
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                {shop.areaName && (
                  <span className="text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40 ml-2">
                    📍 منطقة: {shop.areaName}
                  </span>
                )}
                {shop.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 py-1 px-3 bg-slate-950/80 text-amber-400 font-extrabold text-xs rounded-xl border border-slate-800 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{shop.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className={`flex items-center gap-1 font-bold ${
            shop.deliveryFee === 0 ? 'text-emerald-400' : 'text-purple-400'
          }`}>
            <Truck className="w-4 h-4" />
            <span>
              أجرة التوصيل: {shop.deliveryFee === 0 ? 'مجاناً (0 د.ع)' : `${shop.deliveryFee.toLocaleString('en-US')} د.ع`}
            </span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="text-slate-400 font-medium">
            توصيل دزلي المباشر
          </div>
        </div>
      </div>

      {/* FAST INSTANT SEARCH BAR IN SHOP */}
      <div className="relative text-right">
        <input
          type="text"
          placeholder="ابحث عن منتج أو قسم معين في هذا المتجر (مثال: ألبان، رز، دجاج، كرتون مياه...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-3 px-4 pr-10 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 shadow-inner transition-colors text-right"
        />
        <Search className="w-4.5 h-4.5 text-purple-400 absolute top-3.5 right-3.5" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute top-3.5 left-3.5 p-0.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* STICKY FLEX-WRAP CATEGORIES HEADER BAR */}
      {categories.length > 0 && (
        <div className="sticky top-[61px] z-20 bg-slate-950/95 backdrop-blur-md border-y border-slate-800/80 -mx-4 shadow-md">
          <div
            dir="rtl"
            className="flex flex-wrap items-center gap-2 justify-start w-full py-2.5 px-4"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Tag className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                    isActive ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {productsByCategory[cat]?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VERTICAL PRODUCT FEED BY CATEGORIES / DEPARTMENTS */}
      {activeProducts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm font-bold">
            {searchQuery ? `لا توجد نتائج بحث مطابقة لـ "${searchQuery}"` : 'لا توجد منتجات متوفرة حالياً في هذا المتجر'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="py-1.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              عرض كافة الأقسام
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8 pt-2">
          {categories.map((cat) => {
            const productsList = productsByCategory[cat] || [];
            if (productsList.length === 0) return null;

            return (
              <section
                key={cat}
                ref={(el) => {
                  categoryRefs.current[cat] = el;
                }}
                className="space-y-3 scroll-mt-36"
              >
                {/* Department Header Title */}
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>{cat}</span>
                  </h2>
                  <span className="text-xs text-purple-300 font-bold bg-purple-950/60 border border-purple-800/40 px-2.5 py-0.5 rounded-full">
                    {productsList.length} أصناف
                  </span>
                </div>

                {/* Products Grid Feed for this Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productsList.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        shopId: product.shopId,
                        nameAr: product.nameAr,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        description: product.description,
                        category: product.category,
                      }}
                      shopName={shop.nameAr}
                      deliveryFee={shop.deliveryFee}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

    </div>
  );
};
