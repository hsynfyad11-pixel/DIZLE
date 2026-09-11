'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Truck, Phone, KeyRound, Copy, Loader2 } from 'lucide-react';

export default function DriverLoginPage() {
  const router = useRouter();
  const [driverPhone, setDriverPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default Test Credentials
  const DEFAULT_PHONE = '07701234567';
  const DEFAULT_PIN = '123456';

  const fillTestCredentials = () => {
    setDriverPhone(DEFAULT_PHONE);
    setPinCode(DEFAULT_PIN);
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverPhone.trim() || !pinCode.trim()) {
      setErrorMsg('يرجى كتابة رقم الهاتف والرمز السري');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch('/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: driverPhone.trim(), password: pinCode.trim() })
      });
      const data = await res.json();

      if (data.success && data.driverId) {
        localStorage.setItem('dazly_driver_session', data.driverId);
        window.location.href = '/driver/dashboard';
      } else {
        setErrorMsg(data.error || 'البيانات غير صحيحة');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
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
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2 text-right text-xs">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-amber-300 flex items-center gap-1">
            <KeyRound className="w-4 h-4 text-amber-400" />
            بيانات دخول السائق التجريبية:
          </span>
          <button
            onClick={fillTestCredentials}
            className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>تعبئة تلقائية</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-amber-900/50 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">هاتف السائق:</span>
            <span className="text-amber-300 font-bold">{DEFAULT_PHONE}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">رمز الـ PIN:</span>
            <span className="text-amber-300 font-bold">{DEFAULT_PIN}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-100">تسجيل دخول المندوب / السائق</h1>
          <p className="text-xs text-slate-400">تطبيق كادر DIZLY للاستلام، الذمة المالية والتوصيل</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Phone Number */}
          <div className="space-y-1 text-right">
            <label className="text-xs font-bold text-slate-300">رقم هاتف الكابتن المسجل *</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="07701234567"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full py-2.5 px-4 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
            </div>
          </div>

          {/* PIN Code */}
          <div className="space-y-1 text-right">
            <label className="text-xs font-bold text-slate-300">رمز السائق السري (PIN) *</label>
            <div className="relative">
              <input
                type="password"
                required
                maxLength={6}
                placeholder="• • • • • •"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full py-2.5 px-4 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors tracking-widest font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحقق والدخول...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>دخول لوحة تحكم السائق ورنج الدين</span>
              </>
            )}
          </button>
        </form>

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
              href="/login/shop"
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-purple-400 transition-all flex items-center justify-center gap-1.5"
            >
              <span>دخول صاحب متجر</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
