'use client';

import React from 'react';
import { useCartStore, CartProduct } from '@/store/useCartStore';
import { Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: CartProduct & { description?: string | null; category?: string };
  shopName: string;
  deliveryFee: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, shopName, deliveryFee }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id);

  const handleAdd = () => {
    addItem(product, shopName, deliveryFee);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-sm hover:border-slate-600 transition-all text-slate-100 gap-3">
      {/* Product Information */}
      <div className="flex-1 text-right space-y-1 min-w-0">
        <h4 className="font-bold text-slate-100 text-sm sm:text-base leading-tight truncate">
          {product.nameAr}
        </h4>

        {product.category && (
          <span className="inline-block py-0.5 px-2 bg-purple-950/60 text-purple-300 rounded text-[10px] font-bold border border-purple-800/30">
            {product.category}
          </span>
        )}

        {product.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="pt-1 flex items-baseline gap-1">
          <span className="text-purple-400 font-extrabold text-sm sm:text-base">
            {(product?.price ?? 0).toLocaleString('en-US')}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">د.ع</span>
        </div>
      </div>

      {/* Product Image & Instant Reactive Button Counter */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-950/40 to-slate-900 flex items-center justify-center text-slate-500">
              <ShoppingBag className="w-8 h-8 stroke-1 text-purple-400/60" />
            </div>
          )}
        </div>

        {/* Reactive Quantity Counter or Add Button */}
        {quantity === 0 ? (
          <button
            onClick={handleAdd}
            className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة</span>
          </button>
        ) : (
          <div className="flex items-center justify-between w-full bg-slate-900 border border-purple-500/60 rounded-xl p-0.5 shadow-md">
            <button
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center bg-purple-600 hover:bg-purple-700 active:scale-90 text-white rounded-lg transition-transform"
              aria-label="زيادة الكمية"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-purple-400 text-xs px-1 min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={handleDecrement}
              className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 rounded-lg transition-transform"
              aria-label="إنقاص الكمية"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
