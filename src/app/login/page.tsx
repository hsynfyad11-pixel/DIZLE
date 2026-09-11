'use client';

import React from 'react';
import Link from 'next/link';
import { AuthModal } from '@/components/AuthModal';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للتطبيق</span>
      </Link>

      <AuthModal
        isOpen={true}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }}
        initialRole="customer"
      />
    </div>
  );
}
