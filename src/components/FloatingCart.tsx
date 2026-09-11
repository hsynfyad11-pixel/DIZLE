'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export const FloatingCart: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { getTotalItems, getTotalPrice } = useCartStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0 || pathname === '/checkout' || pathname === '/order-success') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-slideUp">
      <div className="flex items-center justify-between p-3.5 bg-slate-900/95 backdrop-blur-md border border-purple-500/40 rounded-2xl shadow-sticky-bar text-slate-100">
        
        {/* Cart Icon & Details */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-600/30">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-purple-700 font-extrabold text-[11px] rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
              {totalItems}
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">مجموع السلة</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white">
                {totalPrice.toLocaleString('en-US')}
              </span>
              <span className="text-xs text-slate-300 font-semibold">د.ع</span>
            </div>
          </div>
        </div>

        {/* Checkout Link Button */}
        <Link
          href="/checkout"
          className="flex items-center gap-1.5 py-2.5 px-5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all"
        >
          <span>إتمام الطلب</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
