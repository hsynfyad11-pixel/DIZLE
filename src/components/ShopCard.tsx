'use client';

import React from 'react';
import Link from 'next/link';
import { Shop } from '@/types';
import { Star, Truck, Sparkles, Store, Tag, ShoppingCart } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const isFeatured = shop.isFeatured ?? true;
  const isSupermarket = shop.category === 'SUPERMARKET';

  const categoryLabel =
    shop.category === 'SUPERMARKET'
      ? 'سوبرماركت وهايبرماركت شامل 🛒'
      : 'متجر مميز';

  return (
    <Link href={`/shop/${shop.id}`}>
      <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 group cursor-pointer ${
        isSupermarket
          ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400 shadow-glow-mart'
          : isFeatured
          ? 'bg-slate-900/90 border-purple-500/50 hover:border-purple-400 shadow-glow-primary'
          : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-500'
      }`}>
        
        {/* Top Shop Banner / Cover */}
        <div className="relative h-40 sm:h-48 w-full bg-slate-950 overflow-hidden">
          {shop.imageUrl ? (
            <img
              src={shop.imageUrl}
              alt={shop.nameAr}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950">
              <Store className="w-14 h-14 text-purple-400/60" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Featured / Supermarket Badge */}
          {isSupermarket ? (
            <div className="absolute top-3 right-3 flex items-center gap-1 py-1 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs rounded-full shadow-lg border border-emerald-400/40 backdrop-blur-md">
              <ShoppingCart className="w-3.5 h-3.5 fill-white text-emerald-200" />
              <span>سوبرماركت شامل 🛒</span>
            </div>
          ) : isFeatured ? (
            <div className="absolute top-3 right-3 flex items-center gap-1 py-1 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs rounded-full shadow-lg border border-purple-400/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 fill-white text-purple-200" />
              <span>متجر مميز</span>
            </div>
          ) : null}

          {/* Rating Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1 py-1 px-2.5 bg-slate-950/85 backdrop-blur-md text-amber-400 font-extrabold text-xs rounded-xl border border-slate-800 shadow">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{(shop.rating ?? 5.0).toFixed(1)}</span>
          </div>

          {/* Overlapping Brand Logo & Title overlay */}
          <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Brand Logo Avatar */}
              <div className={`w-12 h-12 rounded-2xl bg-slate-900 border-2 overflow-hidden shrink-0 shadow-lg flex items-center justify-center bg-slate-900/90 backdrop-blur-md ${
                isSupermarket ? 'border-emerald-500/60' : 'border-purple-500/60'
              }`}>
                {shop.imageUrl ? (
                  <img src={shop.imageUrl} alt={shop.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-purple-400" />
                )}
              </div>

              <div className="text-right space-y-0.5">
                <h3 className="font-black text-white text-base sm:text-lg group-hover:text-purple-300 transition-colors drop-shadow-md">
                  {shop.nameAr}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isSupermarket
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/40'
                    : 'text-purple-300 bg-purple-950/80 border-purple-800/40'
                }`}>
                  <Tag className="w-3 h-3" />
                  <span>{categoryLabel}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info Footer */}
        <div className="p-4 text-right space-y-2.5 bg-slate-900/90">
          {shop.areaName && (
            <div className="text-[11px] font-bold text-purple-300 bg-purple-950/40 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-purple-800/40 mb-1">
              <span>📍</span>
              <span>المنطقة: {shop.areaName}</span>
            </div>
          )}
          {shop.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {shop.description}
            </p>
          )}

          <div className="pt-2 text-xs font-semibold border-t border-slate-800/80 flex items-center justify-between">
            <div className={`flex items-center gap-1 font-bold ${
              shop.deliveryFee === 0 ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {shop.deliveryFee === 0 ? 'توصيل مجاني' : `توصيل ${(shop.deliveryFee ?? 1500).toLocaleString('en-US')} د.ع`}
              </span>
            </div>

            {shop.products && (
              <span className={`font-bold group-hover:underline text-[11px] flex items-center gap-1 ${
                isSupermarket ? 'text-emerald-400' : 'text-purple-400'
              }`}>
                <span>{shop.products.length} منتجات</span>
                <span>←</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
};
