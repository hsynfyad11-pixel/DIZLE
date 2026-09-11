'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  XCircle,
  Check,
  ShoppingBag,
  Loader2,
  Edit2,
  LogOut,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  status: string;
  altProductName?: string | null;
  altUnitPrice?: number | null;

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
    id: string;
    nameAr: string;
  };
  items: OrderItem[];
}

interface CustomerSession {
  name: string;
  phone: string;
  area: string;
}

export default function MyOrdersPage() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [processingAlt, setProcessingAlt] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Login / Edit Profile Modal State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginArea, setLoginArea] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    // Read session from localStorage on mount
    const savedSession = localStorage.getItem('dazly_customer_session');
    if (savedSession) {
      try {
        const parsed: CustomerSession = JSON.parse(savedSession);
        if (parsed.phone) {
          setSession(parsed);
          setLoginPhone(parsed.phone);
          setLoginName(parsed.name || '');
          setLoginArea(parsed.area || '');
          fetchOrders(parsed.phone);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Poll orders every 4 seconds for active customer sessions
  useEffect(() => {
    if (session?.phone) {
      const interval = setInterval(() => {
        fetchOrders(session.phone, true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [session?.phone]);

  const fetchOrders = async (phone: string, silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;

    const newSession: CustomerSession = {
      name: loginName.trim() || 'زبون دزلي DIZLY',
      phone: loginPhone.trim(),
      area: loginArea.trim() || 'بغداد - الكرادة',
    };

    localStorage.setItem('dazly_customer_session', JSON.stringify(newSession));
    setSession(newSession);
    setEditingProfile(false);
    setLoading(true);
    fetchOrders(newSession.phone);
  };

  const handleClearSession = () => {
    if (confirm('هل أنت تأكد من الخروج وتبديل حساب الزبون؟')) {
      localStorage.removeItem('dazly_customer_session');
      setSession(null);
      setOrders([]);
      setLoginPhone('');
      setLoginName('');
      setLoginArea('');
    }
  };

  const handleAlternativeResponse = async (orderId: string, itemId: string, action: 'APPROVE' | 'CANCEL_ITEM' | 'CANCEL_ORDER') => {
    if (action === 'CANCEL_ORDER' && !confirm('هل أنت متأكد من إلغاء الطلب بالكامل؟')) return;
    try {
      setProcessingAlt(true);
      const res = await fetch('/api/orders/respond-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, itemId, action })
      });
      const data = await res.json();
      if (!data.success) {
        setActionError(data.error || 'حدث خطأ');
      } else {
        if (session?.phone) fetchOrders(session.phone);
      }
    } catch (e) {
      setActionError('فشل التواصل مع الخادم');
    } finally {
      setProcessingAlt(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm font-bold">جاري جلب سجل طلباتك وحسابك...</p>
      </div>
    );
  }

  // If no saved customer session exists in localStorage
  if (!session) {
    return (
      <div className="max-w-md mx-auto py-8 space-y-6 text-right">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-100">سجل طلباتي وحسابي</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            أدخل رقم هاتفك لعرض طلباتك الحالية ومتابعة حالة التوصيل الخاصة بك.
          </p>
        </div>

        <form onSubmit={handleSaveSession} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">رقم الهاتف للتواصل *</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="0770XXXXXXX"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full py-2.5 px-4 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">الاسم الكامل (اختياري)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل اسمك الكريم"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full py-2.5 px-4 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <User className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-glow-primary flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>عرض ومتابعة طلباتي</span>
          </button>
        </form>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-right pb-10">
      
      {/* Header & Back link */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تطبيق دزلي DIZLY</span>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-slate-100">حسابي وسجل الطلبات</h1>
          <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DEDICATED ACTION REQUIRED TOP SECTION */}
      {orders.filter(o => o.status === 'PENDING_CUSTOMER_APPROVAL' && o.items.some(i => i.status === 'OUT_OF_STOCK_HAS_ALTERNATIVE')).map(order => (
        <div key={`approval-${order.id}`} className="bg-amber-950/80 border-2 border-amber-500 p-4 rounded-3xl shadow-xl shadow-amber-900/30 mb-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-black border-b border-amber-900/60 pb-3">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <p>إجراء مطلوب: المتجر اقترح بدائل للطلب #{order.id.slice(-6)}!</p>
          </div>
          
          {order.items.filter(i => i.status === 'OUT_OF_STOCK_HAS_ALTERNATIVE').map(item => (
            <div key={item.id} className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-amber-900/50 text-right shadow-sm">
              <div>
                <p className="text-xs text-slate-400 font-bold mb-1">المنتج الأصلي ❌</p>
                <p className="text-sm line-through text-red-400 font-bold">{item.product.nameAr}</p>
              </div>
              
              <div className="bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/30">
                <p className="text-xs text-slate-400 font-bold mb-1">البديل المقترح ✅</p>
                <p className="text-sm font-black text-emerald-400">{item.altProductName} <span className="text-xs font-normal text-emerald-500 ml-1">(بسعر {item.altUnitPrice?.toLocaleString('en-US') || 0} د.ع)</span></p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleAlternativeResponse(order.id, item.id, 'APPROVE')}
                  disabled={processingAlt}
                  className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-emerald-900/50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  موافقة على هذا البديل الآن
                </button>
                <button
                  onClick={() => handleAlternativeResponse(order.id, item.id, 'CANCEL_ITEM')}
                  disabled={processingAlt}
                  className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  رفض البديل (حذف المنتج فقط)
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <button
              onClick={() => handleAlternativeResponse(order.id, 'all', 'CANCEL_ORDER')}
              disabled={processingAlt}
              className="w-full py-2.5 px-3 bg-red-950/60 hover:bg-red-900 border border-red-900/80 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              إلغاء الطلب بالكامل
            </button>
          </div>
        </div>
      ))}

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="p-1 hover:text-white">✕</button>
        </div>
      )}

      {/* CUSTOMER PERSISTENT PROFILE CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1 text-right flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-slate-100 truncate">{session.name}</h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              جلسة محفوظة تلقائياً
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-purple-400" />
              <span>{session.phone}</span>
            </span>
            {session.area && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>{session.area}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="تعديل الحساب"
          >
            <Edit2 className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={handleClearSession}
            className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EDIT PROFILE FORM OVERLAY */}
      {editingProfile && (
        <form onSubmit={handleSaveSession} className="bg-slate-900 border border-purple-800/50 rounded-3xl p-4 space-y-3 animate-fadeIn text-xs">
          <h3 className="font-bold text-slate-200 text-sm">تعديل بيانات الحساب المحلي:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="الاسم"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
            <input
              type="tel"
              required
              placeholder="رقم الهاتف"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="py-2 px-4 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={() => setEditingProfile(false)}
              className="py-2 px-4 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* SECTION 1: LIVE ACTIVE ORDERS & ALTERNATIVE PROPOSALS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h2 className="font-extrabold text-sm text-slate-100">
              الطلبات الجارية والمباشرة ({activeOrders.length})
            </h2>
          </div>
          <button
            onClick={() => fetchOrders(session.phone)}
            className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>تحديث مباشر</span>
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">لا توجد طلبات جارية حالياً</p>
            <Link href="/" className="inline-block py-2 px-4 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md">
              التسوق والطلب الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => {

              return (
                <div
                  key={order.id}
                  className={`p-4 bg-slate-900 rounded-3xl space-y-3 border transition-all border-slate-800`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-400">#{order.id.slice(-6)}</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(order.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Order Live Status Badge */}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      order.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : order.status === 'PENDING_CUSTOMER_APPROVAL'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse'
                        : order.status === 'AWAITING_COURIER'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : order.status === 'COURIER_ASSIGNED'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
                        : order.status === 'ON_THE_WAY'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {order.status === 'PENDING' && 'قيد الانتظار والتأكيد ⏳'}
                      {order.status === 'PENDING_CUSTOMER_APPROVAL' && 'بانتظار موافقتك على البديل ⚠️'}
                      {order.status === 'AWAITING_COURIER' && 'جاري تجهيز الطلب 🍳 (بانتظار مندوب)'}
                      {order.status === 'COURIER_ASSIGNED' && 'تم تخصيص مندوب لتوصيل طلبك 🛵'}
                      {order.status === 'ON_THE_WAY' && 'انطلق مع المندوب بالطريق 🛵'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-400 mb-2">
                    المتجر: <span className="text-slate-200">{order.shop.nameAr}</span>
                  </p>

                  {/* Products Summary */}
                  <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        {item.status === 'ALTERNATIVE_REJECTED' ? (
                          <span className="line-through text-red-400">
                            • {item.product.nameAr} x{item.quantity} (محذوف)
                          </span>
                        ) : item.status === 'ALTERNATIVE_ACCEPTED' ? (
                          <span className="text-emerald-400 font-bold">
                            • {item.altProductName || item.product.nameAr} x{item.quantity} (بديل)
                          </span>
                        ) : (
                          <span>
                            • {item.product.nameAr} x{item.quantity}
                          </span>
                        )}
                        <span className="font-mono font-bold text-slate-400">
                          {((item.status === 'ALTERNATIVE_ACCEPTED' && item.altUnitPrice != null ? item.altUnitPrice : item.unitPrice) * item.quantity).toLocaleString('en-US')} د.ع
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-slate-100 text-sm">
                      <span>الإجمالي (شامل التوصيل):</span>
                      <span className="text-purple-400">{order.grandTotal.toLocaleString('en-US')} د.ع</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: PAST ORDERS HISTORY */}
      {pastOrders.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h2 className="font-extrabold text-sm text-slate-300">سجل الطلبات المكتملة والسابقة ({pastOrders.length})</h2>
          <div className="space-y-2.5">
            {pastOrders.map((order) => (
              <div key={order.id} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-400">#{order.id.slice(-6)}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {order.status === 'DELIVERED' ? 'تم التسليم بنجاح ✅' : 'ملغي ❌'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>المتجر: <strong>{order.shop.nameAr}</strong></span>
                  <span className="font-mono font-bold text-purple-400">{order.grandTotal.toLocaleString('en-US')} د.ع</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP NOTIFICATIONS FOR SUBSTITUTIONS */}
      <div className="fixed top-20 left-4 right-4 z-50 space-y-3 max-w-sm w-full mx-auto sm:left-auto sm:right-4">
        {activeOrders
          .filter((o) => o.status === 'PENDING_CUSTOMER_APPROVAL' && !dismissedNotifications.includes(o.id))
          .map((order) => (
            <div
              key={`toast-${order.id}`}
              className="bg-slate-900 border-r-4 border-r-orange-500 border border-slate-800 rounded-xl p-4 shadow-2xl flex items-start gap-3 transition-all"
            >
              <span className="p-2 bg-orange-500/20 text-orange-400 rounded-full shrink-0">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div className="flex-1 text-right">
                <p className="text-orange-400 text-sm font-bold mb-1">اقترح المتجر بديلاً!</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم اقتراح بديل لمنتج نافذ في طلبك <span className="font-mono text-purple-400">#{order.id.slice(-6)}</span>. يرجى مراجعته.
                </p>
                <button
                  onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                  className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  الذهاب للمراجعة
                </button>
              </div>
              <button
                onClick={() => setDismissedNotifications((prev) => [...prev, order.id])}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="إخفاء التنبيه"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
       </div>

    </div>
  );
}
