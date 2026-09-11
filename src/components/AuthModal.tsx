'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Phone,
  MapPin,
  Store,
  Truck,
  Lock,
  KeyRound,
  Copy,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

export interface CustomerSession {
  name: string;
  phone: string;
  area: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'customer' | 'shop' | 'driver';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'customer',
}) => {
  const [activeRole, setActiveRole] = useState<'customer' | 'shop' | 'driver'>(initialRole);

  // Customer State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerArea, setCustomerArea] = useState('بغداد - الكرادة');
  const [currentSession, setCurrentSession] = useState<CustomerSession | null>(null);
  const [customerSaved, setCustomerSaved] = useState(false);

  // Shop State
  const [shopPhone, setShopPhone] = useState('');
  const [shopPassword, setShopPassword] = useState('');
  const [shopError, setShopError] = useState('');
  const [showShopPassword, setShowShopPassword] = useState(false);

  // Driver State
  const [driverPhone, setDriverPhone] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [driverError, setDriverError] = useState('');
  const [showDriverPin, setShowDriverPin] = useState(false);
  const [driverLoading, setDriverLoading] = useState(false);

  // Sync initial role when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole);
      // Check existing customer session
      const saved = localStorage.getItem('dazly_customer_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.phone) {
            setCurrentSession(parsed);
            setCustomerPhone(parsed.phone || '');
            setCustomerName(parsed.name || '');
            setCustomerArea(parsed.area || 'بغداد - الكرادة');
          }
        } catch {
          // ignore error
        }
      }
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;


  // Handle Customer Submit / Login
  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    const newSession: CustomerSession = {
      name: customerName.trim() || 'زبون دزلي DIZLY',
      phone: customerPhone.trim(),
      area: customerArea.trim() || 'بغداد',
    };

    localStorage.setItem('dazly_customer_session', JSON.stringify(newSession));
    setCurrentSession(newSession);
    setCustomerSaved(true);

    // Notify window event listeners (e.g. Header)
    window.dispatchEvent(new Event('dazly_session_updated'));

    setTimeout(() => {
      setCustomerSaved(false);
      onClose();
    }, 1200);
  };

  // Handle Logout Customer
  const handleCustomerLogout = () => {
    localStorage.removeItem('dazly_customer_session');
    setCurrentSession(null);
    setCustomerPhone('');
    setCustomerName('');
    window.dispatchEvent(new Event('dazly_session_updated'));
  };

  // Handle Shop Login
  const handleShopLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopPhone.trim() || !shopPassword.trim()) {
      setShopError('يرجى كتابة رقم الهاتف وكلمة المرور');
      return;
    }

    if (shopPhone.trim() === '07837555605' && shopPassword === 'fbhmas1997') {
      setShopError('');
      onClose();
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/dashboard';
      }
      return;
    }

    try {
      const res = await fetch('/api/shop/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: shopPhone.trim(), password: shopPassword.trim() })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('dazly_shop_session', data.shopId);
        setShopError('');
        onClose();
        if (typeof window !== 'undefined') {
          window.location.href = '/shop/dashboard';
        }
      } else {
        setShopError(data.error || 'البيانات غير صحيحة');
      }
    } catch {
      setShopError('حدث خطأ بالاتصال');
    }
  };


  // Handle Driver Login
  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverPhone.trim() || !driverPin.trim()) {
      setDriverError('يرجى كتابة رقم الهاتف والرمز السري');
      return;
    }

    try {
      setDriverLoading(true);
      setDriverError('');

      const res = await fetch('/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: driverPhone.trim(), password: driverPin.trim() })
      });
      const data = await res.json();

      if (data.success && data.driverId) {
        localStorage.setItem('dazly_driver_session', data.driverId);
        onClose();
        if (typeof window !== 'undefined') {
          window.location.href = '/driver/dashboard';
        }
      } else {
        setDriverError(data.error || 'رمز PIN أو الرقم خاطئ');
      }
    } catch {
      setDriverError('حدث خطأ أثناء التواصل مع الخادم');
    } finally {
      setDriverLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/40 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              د
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 leading-tight">
                {activeRole === 'customer' && 'دخول / تسجيل حساب الزبون'}
                {activeRole === 'shop' && 'بوابة صاحب المتجر'}
                {activeRole === 'driver' && 'بوابة مندوب التوصيل'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">منصة دزلي DIZLY Hyper-Local</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs Indicator (Frictionless Customer Default) */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 my-4">
          <button
            onClick={() => setActiveRole('customer')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black transition-all ${
              activeRole === 'customer'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>زبون</span>
          </button>

          <button
            onClick={() => setActiveRole('shop')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black transition-all ${
              activeRole === 'shop'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>صاحب متجر</span>
          </button>

          <button
            onClick={() => setActiveRole('driver')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black transition-all ${
              activeRole === 'driver'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>مندوب</span>
          </button>
        </div>

        {/* ==================== 1. CUSTOMER ROLE VIEW (PRIMARY) ==================== */}
        {activeRole === 'customer' && (
          <div className="space-y-5 animate-fadeIn">
            {customerSaved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>تم تسجيل دخول الزبون وحفظ البيانات بنجاح!</span>
              </div>
            )}

            {currentSession && !customerSaved ? (
              /* Already Logged In Customer View */
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-slate-100 text-sm">{currentSession.name}</span>
                      <span className="block text-xs text-purple-300 font-mono" dir="ltr">{currentSession.phone}</span>
                    </div>
                  </div>
                  <span className="py-1 px-2.5 bg-purple-950 text-purple-300 text-[10px] font-extrabold rounded-full border border-purple-800/50">
                    حساب زبون نشط
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 text-right">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>عنوان التوصيل: <strong className="text-slate-200">{currentSession.area || 'بغداد'}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setCurrentSession(null)}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700/60"
                  >
                    تعديل البيانات
                  </button>
                  <button
                    onClick={handleCustomerLogout}
                    className="py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl transition-all border border-red-800/40 flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            ) : (
              /* New / Login Form for Customer */
              <form onSubmit={handleCustomerLogin} className="space-y-3.5">
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">رقم الهاتف الشخصي *</label>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="07701234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <label className="text-xs font-bold text-slate-300">اسم الزبون (للتوصيل)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="أحمد علي"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <label className="text-xs font-bold text-slate-300">المنطقة والحي السكني</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="بغداد - الكرادة"
                      value={customerArea}
                      onChange={(e) => setCustomerArea(e.target.value)}
                      className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <MapPin className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all"
                >
                  حفظ وتأكيد الدخول السريع
                </button>
              </form>
            )}

            {/* ==================== SECONDARY ROLE OPTIONS AT BOTTOM ==================== */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-right">
              <span className="block text-[11px] font-extrabold text-slate-400 px-1">
                خيارات أخرى للحساب والأدوار:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Shop Owner Option */}
                <button
                  type="button"
                  onClick={() => setActiveRole('shop')}
                  className="p-3 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-right transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800/50 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                        تسجيل دخول / إنشاء حساب صاحب متجر
                      </span>
                      <span className="block text-[10px] text-slate-400">لوحة تحكم المتجر والمبيعات</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:-translate-x-1 transition-all shrink-0" />
                </button>

                {/* Delivery Driver Option */}
                <button
                  type="button"
                  onClick={() => setActiveRole('driver')}
                  className="p-3 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-right transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        تسجيل دخول / إنشاء حساب مندوب
                      </span>
                      <span className="block text-[10px] text-slate-400">لوحة المندوب واستلام الطلبات</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. SHOP OWNER ROLE VIEW ==================== */}
        {activeRole === 'shop' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            {shopError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                {shopError}
              </div>
            )}

            <form onSubmit={handleShopLogin} className="space-y-3">
              <div className="text-right space-y-1">
                <label className="text-xs font-bold text-slate-300">رقم هاتف / معرف المتجر *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="07701234567"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full py-2 px-3 pr-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                </div>
              </div>

              <div className="text-right space-y-1">
                <label className="text-xs font-bold text-slate-300">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showShopPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={shopPassword}
                    onChange={(e) => setShopPassword(e.target.value)}
                    className="w-full py-2 px-3 pr-9 pl-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500 font-mono tracking-widest"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowShopPassword(!showShopPassword)}
                    className="absolute top-2 left-2 p-1 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showShopPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all"
              >
                تسجيل الدخول لوحة المتجر
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link
                href="/join"
                onClick={onClose}
                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تقديم طلب انضمام متجر جديد</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveRole('customer')}
                className="text-slate-400 hover:text-slate-200 font-medium"
              >
                العودة لدخول الزبون
              </button>
            </div>
          </div>
        )}

        {/* ==================== 3. DRIVER ROLE VIEW ==================== */}
        {activeRole === 'driver' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            {driverError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                {driverError}
              </div>
            )}

            <form onSubmit={handleDriverLogin} className="space-y-3">
              <div className="text-right space-y-1">
                <label className="text-xs font-bold text-slate-300">رقم هاتف السائق المسجل *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="07701234567"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full py-2 px-3 pr-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                </div>
              </div>

              <div className="text-right space-y-1">
                <label className="text-xs font-bold text-slate-300">الرمز السري الخاص بك *</label>
                <div className="relative">
                  <input
                    type={showDriverPin ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={driverPin}
                    onChange={(e) => setDriverPin(e.target.value)}
                    className="w-full py-2 px-3 pr-9 pl-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowDriverPin(!showDriverPin)}
                    className="absolute top-2 left-2 p-1 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showDriverPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={driverLoading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                {driverLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <span>تسجيل دخول لوحة السائق</span>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link
                href="/join"
                onClick={onClose}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تقديم طلب انضمام كمندوب توصيل</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveRole('customer')}
                className="text-slate-400 hover:text-slate-200 font-medium"
              >
                العودة لدخول الزبون
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
