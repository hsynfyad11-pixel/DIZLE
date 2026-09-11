'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error caught by Next.js error boundary:', error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-purple-800/40 rounded-3xl text-center space-y-4 shadow-2xl text-slate-100">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-black text-slate-100">حدث خطأ أثناء تحميل الصفحة</h2>
        <p className="text-xs text-slate-400">
          تم حماية التطبيق ومنع تجمده. يمكنك إلقاء نظرة أو إعادة محاولة التحميل.
        </p>
      </div>

      {error?.message && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-purple-300 text-right overflow-x-auto" dir="ltr">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={() => reset()}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>

        <Link
          href="/"
          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700/60"
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
