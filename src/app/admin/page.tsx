'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Phone, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('يرجى كتابة رقم الهاتف وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('dazly_admin_session', 'super_admin_authenticated');
        // Authenticated successfully. Redirects to dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-purple-800/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-scaleUp">
        
        <div className="absolute top-0 right-0 p-4">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition-colors bg-slate-950/50 rounded-xl py-1 px-2 border border-slate-800">
            <ArrowRight className="w-3.5 h-3.5" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="flex flex-col items-center text-center mt-6 mb-8 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 mt-2">بوابة الإدارة المركزية</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">تسجيل الدخول للمشرفين والمسؤولين</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-right space-y-1.5">
            <label className="text-xs font-bold text-slate-300">رقم الهاتف (الآدمن)</label>
            <div className="relative">
              <input
                type="tel"
                required
                dir="rtl"
                placeholder="07XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-3 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute top-3.5 right-4" />
            </div>
          </div>

          <div className="text-right space-y-1.5">
            <label className="text-xs font-bold text-slate-300">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                dir="rtl"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 px-4 pr-11 pl-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute top-3.5 right-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 left-4 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>تسجيل الدخول للنظام</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
