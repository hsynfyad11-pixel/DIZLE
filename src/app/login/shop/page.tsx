'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Store, Lock, Phone, CheckCircle, ShieldCheck, KeyRound, Copy } from 'lucide-react';

export default function ShopOwnerLoginPage() {
  const [storeIdOrPhone, setStoreIdOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default Test Credentials
  const DEFAULT_ID = '07837555605';
  const DEFAULT_PASS = 'password123';

  const fillTestCredentials = () => {
    setStoreIdOrPhone(DEFAULT_ID);
    setPassword(DEFAULT_PASS);
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeIdOrPhone.trim() || !password.trim()) {
      setErrorMsg('يرجى كتابة رقم الهاتف/المعرف وكلمة المرور');
      return;
    }

    try {
      setErrorMsg('');
      const res = await fetch('/api/shop/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: storeIdOrPhone.trim(), password: password.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('dazly_shop_session', data.shopId);
        setSubmitted(true);
        setTimeout(() => {
          window.location.href = '/shop/dashboard';
        }, 800);
      } else {
        setErrorMsg(data.error || 'خطأ في التحقق من البيانات');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ بالاتصال');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للتطبيق</span>
      </Link>

      {/* Test Credentials Banner */}
      <div className="bg-purple-950/60 border border-purple-500/40 rounded-2xl p-4 space-y-2 text-right text-xs">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-purple-300 flex items-center gap-1">
            <KeyRound className="w-4 h-4 text-purple-400" />
            بيانات الدخول التجريبية (افتراضية):
          </span>
          <button
            onClick={fillTestCredentials}
            className="py-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>تعبئة تلقائية</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-purple-900/50 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">الهاتف / المعرف:</span>
            <span className="text-purple-300 font-bold">{DEFAULT_ID}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">كلمة المرور:</span>
            <span className="text-purple-300 font-bold">{DEFAULT_PASS}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-purple-800/40 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-100">تسجيل دخول صاحب المتجر</h1>
          <p className="text-xs text-slate-400">لوحة تحكم وتجهيز طلبات المتاجر في DIZLY</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="p-5 bg-purple-950/50 border border-purple-500/40 rounded-2xl text-center space-y-3 animate-fadeIn">
            <CheckCircle className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="font-extrabold text-purple-200 text-base">تم تسجيل دخول المتجر بنجاح!</h3>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              مرحباً بك في لوحة تحكم المتجر. يمكنك الآن استلام طلبات التجهيز وتحديد حالة توفر المنتجات.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Store ID / Phone */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-300">رقم الهاتف أو المعرّف الخاص بالمتجر *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="07701234567"
                  value={storeIdOrPhone}
                  onChange={(e) => setStoreIdOrPhone(e.target.value)}
                  className="w-full py-2.5 px-4 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-300">كلمة المرور *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 px-4 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>نظام مؤمن لإدارة طلبات المتجر وعزل بيانات الزبائن.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-glow-primary transition-all"
            >
              تسجيل الدخول للمتجر
            </button>
          </form>
        )}

        {/* Alternative Role Switcher at Bottom */}
        <div className="pt-4 border-t border-slate-800 space-y-3 text-right">
          <span className="block text-[11px] font-extrabold text-slate-400">
            أدوار تسجيل الدخول الأخرى:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/login"
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-purple-400 transition-all flex items-center justify-center gap-1.5"
            >
              <span>تسجيل دخول الزبون</span>
            </Link>

            <Link
              href="/login/driver"
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-400 transition-all flex items-center justify-center gap-1.5"
            >
              <span>دخول كابتن توصيل</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
