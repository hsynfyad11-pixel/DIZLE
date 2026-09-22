'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navigation, Users, Package, ArrowRight, Loader2, CheckCircle2, ShieldAlert, Phone, Car } from 'lucide-react';

export default function TransportTrackPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [reqData, setReqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      router.replace('/transport');
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/transport/track?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setReqData(data.transportRequest);
        } else {
          setError(data.error || 'طلب التوصيل غير موجود');
        }
      } catch (err) {
        setError('حدث خطأ في جلب بيانات التتبع');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id, router]);

  const handleNegotiationAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!id) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/transport/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        // optimistically reload immediately
        const statusRes = await fetch(`/api/transport/track?id=${id}`);
        const statusData = await statusRes.json();
        if (statusData.success) {
          setReqData(statusData.transportRequest);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('حدث خطأ أثناء تنفيذ الإجراء');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm('هل أنت متأكد أنك تريد إلغاء هذا الطلب؟')) return;
    try {
      setCancelLoading(true);
      const res = await fetch('/api/transport/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setReqData(data.transportRequest);
      } else {
        alert(data.error || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الإلغاء');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">جاري تحميل التتبع...</p>
      </div>
    );
  }

  if (error || !reqData) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-200">{error}</h2>
        <button onClick={() => router.replace('/transport')} className="text-blue-400 hover:text-blue-300 underline font-bold mt-4">عودة للخدمات</button>
      </div>
    );
  }

  const isPeople = reqData.type === 'PEOPLE';
  const statusLabels: Record<string, string> = {
    PENDING: 'جاري البحث عن كابتن...',
    NEGOTIATING: 'أرسل كابتن عرضاً بسعر معدل',
    ACCEPTED: 'تم الاتفاق وفي الطريق إليك!',
    COMPLETED: 'تمت الرحلة بنجاح',
    CANCELLED: 'الملغية',
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${isPeople ? 'bg-emerald-600/10' : 'bg-amber-600/10'} rounded-full blur-3xl`} />
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={() => router.push('/')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl transition-colors shrink-0">
            <ArrowRight className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isPeople ? 'bg-emerald-500/10' : 'bg-amber-500/10'} rounded-xl flex items-center justify-center`}>
              {isPeople ? <Users className="w-5 h-5 text-emerald-400" /> : <Package className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">تتبع المشوار</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">TR-{reqData.id.slice(-6)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Status Target */}
      <div className={`border-2 rounded-3xl p-6 text-center shadow-lg transition-colors ${
        reqData.status === 'ACCEPTED' ? 'bg-emerald-600/10 border-emerald-500/50' : 
        reqData.status === 'NEGOTIATING' ? 'bg-amber-600/10 border-amber-500/50' :
        reqData.status === 'COMPLETED' ? 'bg-blue-600/10 border-blue-500/50' :
        'bg-slate-900 border-slate-700'
      }`}>
        {reqData.status === 'PENDING' && (
          <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
        )}
        {reqData.status === 'NEGOTIATING' && (
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-bounce" />
        )}
        {reqData.status === 'ACCEPTED' && (
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        )}
        
        <h2 className={`text-2xl font-black mb-2 ${
          reqData.status === 'ACCEPTED' ? 'text-emerald-300' :
          reqData.status === 'NEGOTIATING' ? 'text-amber-300' :
          'text-slate-200'
        }`}>
          {statusLabels[reqData.status] || 'غير معروف'}
        </h2>

        {reqData.status === 'PENDING' && (
          <p className="text-sm text-slate-400 font-medium">سيتم وتزويدك ببيانات الكابتن قريباً، يرجى البقاء هنا.</p>
        )}
      </div>

      {/* Negotiation Card */}
      {reqData.status === 'NEGOTIATING' && (
        <div className="bg-amber-950 border border-amber-500/40 p-5 rounded-3xl space-y-4 shadow-xl">
          <p className="text-amber-200 text-sm font-bold text-center">
            قام الكابتن بتقديم عرض سعر جديد لهذا المشوار:
          </p>
          <div className="text-center font-mono font-black text-3xl text-amber-400">
            {Number(reqData.proposedPrice || 0).toLocaleString()} <span className="text-lg">د.ع</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleNegotiationAction('REJECT')}
              disabled={actionLoading}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
            >
              رفض والانتظار
            </button>
            <button
              onClick={() => handleNegotiationAction('ACCEPT')}
              disabled={actionLoading}
              className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl transition-all shadow-glow-mart flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>قبول هذا العرض الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* Driver Assigned Info */}
      {(reqData.status === 'ACCEPTED' || reqData.status === 'COMPLETED') && reqData.driver && (
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-4 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-bold text-emerald-400 text-sm border-b border-slate-800 pb-2">تفاصيل الكابتن</h3>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 border border-slate-700">
               <Car className="w-6 h-6 text-slate-300" />
             </div>
             <div className="flex-1 space-y-1">
               <p className="font-extrabold text-slate-100">{reqData.driver.name}</p>
               <p className="font-mono text-slate-400 text-[11px]">{reqData.driver.vehicle || 'تكتك'}</p>
             </div>
          </div>
          <div className="pt-2 border-t border-slate-800 space-y-3">
             <a href={`tel:${reqData.driver.phone}`} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all dir-ltr">
                <Phone className="w-4 h-4" />
                <span>{reqData.driver.phone}</span>
             </a>
          </div>
        </div>
      )}

      {/* Order Base summary */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
         <h3 className="font-bold text-slate-300 text-xs border-b border-slate-800 pb-2">تفاصيل الموقع</h3>
         <div className="flex justify-between items-center text-xs">
           <span className="text-slate-500">من:</span>
           <span className="font-bold text-slate-200">{reqData.pickupLocation}</span>
         </div>
         <div className="flex justify-between items-center text-xs">
           <span className="text-slate-500">إلى:</span>
           <span className="font-bold text-slate-200">{reqData.dropoffLocation}</span>
         </div>
         {reqData.status !== 'NEGOTIATING' && reqData.status !== 'PENDING' && (
           <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800 mt-2">
             <span className="text-emerald-400 font-bold">الأجرة النهائية:</span>
             <span className="font-bold font-mono text-emerald-300 text-sm">{Number(reqData.price || 0).toLocaleString()} د.ع</span>
           </div>
         )}
      </div>

      {reqData.status !== 'COMPLETED' && reqData.status !== 'CANCELLED' && (
        <div className="pt-2">
          <button
            onClick={handleCancel}
            disabled={cancelLoading || actionLoading}
            className="w-full py-3.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-red-500/20"
          >
            {cancelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
            <span>إلغاء الطلب</span>
          </button>
        </div>
      )}

    </div>
  );
}
