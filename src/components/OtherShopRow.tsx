'use client';

import React from 'react';
import Link from 'next/link';
import { Shop } from '@/types';
import { Store, Star, Truck, ChevronLeft, Tag } from 'lucide-react';

interface OtherShopRowProps {
  shop: Shop;
}

export const OtherShopRow: React.FC<OtherShopRowProps> = ({ shop }) => {
  const isSupermarket = shop.category === 'SUPERMARKET';

  const categoryLabel =
    shop.category === 'SUPERMARKET'
      ? 'سوبرماركت شامل 🛒'
      : shop.category;

  return (
    <Link href={`/shop/${shop.id}`}>
      <div className="flex items-center justify-between p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-2xl transition-all duration-200 group cursor-pointer shadow-sm">
        
        {/* Left Side (Shop Logo Avatar & Details) */}
        <div className="flex items-center gap-3.5">
          {/* Shop Logo Avatar */}
          <div className={`w-12 h-12 rounded-xl bg-slate-950 border overflow-hidden shrink-0 shadow flex items-center justify-center group-hover:scale-105 transition-transform ${
            isSupermarket ? 'border-emerald-500/40' : 'border-purple-500/30'
          }`}>
            {shop.imageUrl ? (
              <img src={shop.imageUrl} alt={shop.nameAr} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-6 h-6 text-purple-400" />
            )}
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-100 text-sm sm:text-base group-hover:text-purple-300 transition-colors">
                {shop.nameAr}
              </h4>
              {shop.category && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSupermarket
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  <Tag className="w-3 h-3 text-purple-400" />
                  <span>{categoryLabel}</span>
                </span>
              )}
            </div>

            {shop.description && (
              <p className="text-xs text-slate-400 line-clamp-1 max-w-xs sm:max-w-md">
                {shop.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {(shop.rating ?? 5.0).toFixed(1)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-purple-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {shop.deliveryFee === 0 ? 'توصيل مجاني' : `توصيل ${(shop.deliveryFee ?? 1500).toLocaleString('en-US')} د.ع`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Action Button */}
        <div className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-800 group-hover:bg-purple-600 text-xs font-extrabold text-slate-200 group-hover:text-white transition-all shadow shrink-0">
          <span>تصفح</span>
          <ChevronLeft className="w-4 h-4" />
        </div>

      </div>
    </Link>
  );
};
