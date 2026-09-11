'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation, Users, Package, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransportSelectionPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-8 animate-fadeIn max-w-lg mx-auto pt-4">
      {/* Structural Header (Not a Card) */}
      <div className="flex items-start gap-4 px-2">
        <button onClick={() => router.back()} className="p-2.5 bg-slate-800/60 hover:bg-slate-700 rounded-xl transition-colors shrink-0 mt-1">
          <ArrowRight className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/10 rounded-xl">
              <Navigation className="w-6 h-6 text-emerald-400" />
            </span>
            خدمة أوصلني
          </h1>
          <p className="text-sm text-slate-400 mt-2.5 font-medium leading-relaxed">
            الرجاء تحديد نوع الخدمة المطلوبة اليوم لاستكمال الطلب وتوجيهه للسائقين:
          </p>
        </div>
      </div>

      {/* Options Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 md:p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-500 mb-4 px-1">الخيارات المتاحة:</h2>
        <div className="space-y-4">
          {/* Option 1: People */}
          <Link href="/transport/request?type=PEOPLE" className="block bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 transition-all active:scale-[0.98] group relative overflow-hidden shadow-sm hover:shadow-emerald-500/5">
            <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-inner">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-lg font-black text-white mb-1">توصيل أشخاص (مشوار)</h3>
                <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed font-medium">
                  احجز تكتك أو سيارة ليوصلك لأي مكان داخل المنطقة بسرعة وأمان.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Option 2: Parcel */}
          <Link href="/transport/request?type=PARCEL" className="block bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 transition-all active:scale-[0.98] group relative overflow-hidden shadow-sm hover:shadow-amber-500/5">
            <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
                <Package className="w-7 h-7 text-amber-400" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-lg font-black text-white mb-1">توصيل أمانة (أغراض)</h3>
                <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed font-medium">
                  أرسل غرض، مستندات أو هدايا من مكانك لأي شخص آخر بأمان.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors shrink-0">
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
