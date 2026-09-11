'use client';

import React from 'react';
import { ShopCategory } from '@/types';
import { Sparkles, Store, Layers, ShoppingCart } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: 'ALL' | ShopCategory;
  onSelectCategory: (category: 'ALL' | ShopCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-start w-full py-1 text-right">
      
      {/* All Shops */}
      <button
        onClick={() => onSelectCategory('ALL')}
        className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs transition-all ${
          selectedCategory === 'ALL'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-102'
            : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>جميع المتاجر</span>
      </button>

      {/* Supermarkets */}
      <button
        onClick={() => onSelectCategory('SUPERMARKET')}
        className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs transition-all ${
          selectedCategory === 'SUPERMARKET'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-400/40'
            : 'bg-slate-800/80 text-slate-400 hover:text-emerald-400 border border-slate-700/60'
        }`}
      >
        <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
        <span>سوبرماركت شامل 🛒</span>
      </button>

      {/* Standard Shops */}
      <button
        onClick={() => onSelectCategory('STANDARD')}
        className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs transition-all ${
          selectedCategory === 'STANDARD'
            ? 'bg-slate-100 text-slate-950 shadow-md'
            : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
        }`}
      >
        <Store className="w-3.5 h-3.5" />
        <span>متاجر اعتيادية (1,500 د.ع)</span>
      </button>

    </div>
  );
};
