'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  ShieldCheck,
  Truck,
  Home,
  Loader2,
  AlertCircle,
  XCircle,
  Check,
  ArrowLeft,
  Store,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  status: string;

  product: {
    nameAr: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  totalPrice: number;
  deliveryFee: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  shop: {
    nameAr: string;
  };
  items: OrderItem[];
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      // Poll order status every 4 seconds to catch shop updates live
      const interval = setInterval(fetchOrderDetails, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-xs font-bold">جاري تحميل وتحديث تفاصيل الطلب...</p>
      </div>
    );
  }



  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-5 max-w-md mx-auto py-4 px-2">
      
      {/* Dynamic Order Status Header / Icon */}
      {order?.status === 'CANCELLED' ? (
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-fadeIn">
          <XCircle className="w-12 h-12" />
        </div>
      ) : (
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-fadeIn">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-2 bg-purple-600 rounded-full text-white shadow-md">
            <Truck className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Main Title & Description */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-black text-slate-100">
          {order?.status === 'CANCELLED'
            ? 'تم إلغاء الطلب ❌'
            : 'تم تسجيل طلبك بنجاح! 🎉'}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          {order?.status === 'CANCELLED'
            ? 'تم إلغاء الطلب بناءً على رغبتك لعدم توفر المنتج المطلوبة.'
            : `شكراً لتسوقك مع DIZLY من ${order?.shop.nameAr || 'المتجر'}. جاري تجهيز الطلب وتوصيله.`}
        </p>
      </div>





      {/* Order Details Summary Card */}
      {order && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 text-right space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <span className="text-slate-400">رقم الطلب المرجعي:</span>
            <span className="font-mono font-extrabold text-purple-400">#{order.id.slice(-6)}</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 border-b border-slate-800 pb-3">
            <p className="font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span>المنتجات بالطلب:</span>
              <span className="text-purple-300 font-mono">{order.shop.nameAr}</span>
            </p>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 text-slate-200">
                <span>
                  • {item.product.nameAr} x{item.quantity}
                </span>
                <span className="font-mono font-bold text-slate-400">
                  {(item.unitPrice * item.quantity).toLocaleString('en-US')} د.ع
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-slate-400">
              <span>أجرة التوصيل:</span>
              <span className="font-mono font-bold text-slate-300">{order.deliveryFee.toLocaleString('en-US')} د.ع</span>
            </div>
            <div className="flex justify-between text-slate-100 font-black text-sm pt-1 border-t border-slate-800">
              <span>الإجمالي الكلي:</span>
              <span className="font-mono text-purple-400">{order.grandTotal.toLocaleString('en-US')} د.ع</span>
            </div>
          </div>
        </div>
      )}

      {/* Return to Home Button */}
      <Link
        href="/"
        className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-glow-primary flex items-center justify-center gap-2 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>العودة للرئيسية والتسوق</span>
      </Link>

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs">جاري تحميل تفاصيل الطلب...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
