'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { Menu, X, ShoppingBag, User, Home, UserCheck, Store, Truck, LogIn, Phone } from 'lucide-react';
import { AuthModal, CustomerSession } from './AuthModal';

export const Header: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { getTotalItems } = useCartStore();
  const totalItems = mounted ? getTotalItems() : 0;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'shop' | 'driver'>('customer');
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
  const [hasPendingApproval, setHasPendingApproval] = useState(false);

  const checkCustomerSession = () => {
    const saved = localStorage.getItem('dazly_customer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setCustomerSession(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
    setCustomerSession(null);
  };

  useEffect(() => {
    setMounted(true);
    checkCustomerSession();
    const handleStorageUpdate = () => checkCustomerSession();
    window.addEventListener('dazly_session_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('dazly_session_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkApproval = async (phone: string) => {
      try {
        const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (data.success && data.orders) {
          const pending = data.orders.some((o: any) => o.status === 'PENDING_CUSTOMER_APPROVAL');
          setHasPendingApproval(pending);
        }
      } catch { }
    };

    if (customerSession?.phone) {
      checkApproval(customerSession.phone);
      interval = setInterval(() => checkApproval(customerSession.phone), 4000);
    } else {
      setHasPendingApproval(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [customerSession]);

  const openAuthModal = (role: 'customer' | 'shop' | 'driver' = 'customer') => {
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  return (
    <>
      {/* Top Navigation Header Menu */}
      <header className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-slate-100 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Always Visible Menu / Hamburger Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/70 rounded-xl text-slate-200 transition-all flex items-center justify-center shadow-sm"
              aria-label="قائمة الملاحة"
              title="فتح القائمة"
            >
              <Menu className="w-5 h-5 text-purple-400" />
              {hasPendingApproval && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full animate-pulse border-2 border-slate-900 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                د
              </div>
              <div className="text-right">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-purple-400 transition-colors">
                  دزلي DIZLY <span className="text-purple-400 text-xs font-bold">EXPRESS</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">توصيل سريع ومباشر</span>
              </div>
            </Link>
          </div>

          {/* Right Header Actions: Auth Button, Contact & Shopping Cart */}
          <div className="flex items-center gap-2.5">
            {/* Contact Us Link (Visible mainly on larger screens, optional on small) */}
            <Link
              href="/#contact"
              className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-sm transition-all border border-slate-700/60"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>تواصل معنا</span>
            </Link>

            {/* Single Clean Auth Button */}
            <button
              onClick={() => openAuthModal('customer')}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all active:scale-95 border border-purple-400/30"
            >
              <User className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">{customerSession ? customerSession.name || 'حسابي' : 'تسجيل الدخول / إنشاء حساب'}</span>
              <span className="sm:hidden">{customerSession ? customerSession.name || 'حسابي' : 'دخول'}</span>
            </button>

            {/* Shopping Cart Icon */}
            <Link
              href="/checkout"
              className="relative p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-slate-200 transition-all active:scale-95"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5 text-slate-200" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white font-black text-[11px] rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>
      </header>

      {/* Clean Auth Modal/Popup */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalRole}
      />

      {/* Navigation Slide-Over Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-4/5 max-w-xs h-full bg-slate-900 border-l border-slate-800 p-5 space-y-6 flex flex-col justify-between text-slate-100 shadow-2xl animate-slideRight">
            
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    د
                  </div>
                  <span className="font-extrabold text-base text-slate-100">قائمة دزلي DIZLY</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Auth Button inside Drawer */}
              <div className="p-3 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-700/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-200">الحساب والدخول</span>
                  <span className="text-[10px] text-purple-400 font-bold bg-purple-900/60 py-0.5 px-2 rounded-full">
                    {customerSession ? 'زبون مسجل' : 'دخول موحد'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    openAuthModal('customer');
                  }}
                  className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{customerSession ? `حسابي (${customerSession.name})` : 'تسجيل الدخول / إنشاء حساب'}</span>
                </button>
              </div>

              {/* Clean Navigation Links */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 px-2 py-1">التصفح الرئيسي</p>
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-sm font-bold text-slate-200 transition-colors"
                >
                  <Home className="w-4 h-4 text-purple-400" />
                  <span>الرئيسية والمتاجر</span>
                </Link>
                <Link
                  href="/my-orders"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    hasPendingApproval ? 'bg-orange-950/40 border border-orange-500/40' : 'bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm font-extrabold text-purple-300">
                    <UserCheck className={`w-4 h-4 ${hasPendingApproval ? 'text-orange-400 animate-pulse' : 'text-purple-400'}`} />
                    <span className={hasPendingApproval ? 'text-orange-400' : ''}>طلباتي ومتابعة الشحن</span>
                  </div>
                  {hasPendingApproval && (
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  )}
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-sm font-bold text-slate-200 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <span>سلة التسوق</span>
                </Link>
                <Link
                  href="/#contact"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-sm font-bold text-slate-200 transition-colors mt-2 border-t border-slate-800 pt-3"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>تواصل معنا للدعم</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <p className="text-xs font-bold text-slate-300">منصة دزلي DIZLY</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
