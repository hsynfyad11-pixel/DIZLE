'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Package, ArrowRight, MapPin, Navigation, Phone, AlignLeft, CheckCircle2, Bookmark, Map } from 'lucide-react';
import { MapLocationPicker } from '@/components/MapLocationPicker';

interface SavedPlace {
  label: string;
  address: string;
}

function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') === 'PARCEL' ? 'PARCEL' : 'PEOPLE';

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [pickupCoords, setPickupCoords] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState('');
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropoffMap, setShowDropoffMap] = useState(false);

  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPlaceLabel, setNewPlaceLabel] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dazly_customer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phone) setCustomerPhone(parsed.phone);
      } catch {}
    }
    const savedPlacesData = localStorage.getItem('dazly_saved_places');
    if (savedPlacesData) {
      try {
        setSavedPlaces(JSON.parse(savedPlacesData));
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation || !customerPhone || (type === 'PARCEL' && !recipientPhone)) {
      setError('يرجى تعبئة كافة الحقول الأساسية المطلوبة للطلب.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, notes, customerPhone, recipientPhone }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/transport/track?id=${data.transportRequest.id}`);
      } else {
        setError(data.error || 'حدث خطأ أثناء الإرسال');
      }
    } catch (err: any) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const isPeople = type === 'PEOPLE';

  return (
    <div className="space-y-6 pb-8 animate-fadeIn max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${isPeople ? 'bg-emerald-600/10' : 'bg-amber-600/10'} rounded-full blur-3xl`} />
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={() => router.back()} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl transition-colors shrink-0">
            <ArrowRight className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isPeople ? 'bg-emerald-500/10' : 'bg-amber-500/10'} rounded-xl flex items-center justify-center`}>
              {isPeople ? <Users className="w-5 h-5 text-emerald-400" /> : <Package className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                {isPeople ? 'طلب توصيل مشوار' : 'طلب توصيل أمانة'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isPeople ? 'املأ تفاصيل المشوار للسائق.' : 'املأ تفاصيل الأمانة التي تود إرسالها.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                موقع الاستلام (من أين؟)
              </label>
              <button type="button" onClick={() => { setNewPlaceAddress(pickupLocation); setShowSaveModal(true); }} disabled={!pickupLocation} className="text-[10px] text-emerald-400 font-bold hover:underline disabled:opacity-50 flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                حفظ الموقع
              </button>
            </div>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="مثال: منزلي في حي السلام..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
            />
            {savedPlaces.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {savedPlaces.map((place, idx) => (
                  <button type="button" key={idx} onClick={() => setPickupLocation(place.address)} className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3 text-emerald-500/70" />
                    {place.label}
                  </button>
                ))}
              </div>
            )}
            
            {!showPickupMap ? (
              <button type="button" onClick={() => setShowPickupMap(true)} className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold">
                <Map className="w-4 h-4" /> تحديد موقع الاستلام بدقة على الخريطة (اختياري)
              </button>
            ) : (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300">موقع الاستلام على الخريطة</span>
                  <button type="button" onClick={() => setShowPickupMap(false)} className="text-[10px] text-slate-500 hover:text-slate-400">إخفاء</button>
                </div>
                <MapLocationPicker value={pickupCoords} onChange={(coords) => setPickupCoords(coords)} required={false} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <Navigation className="w-4 h-4 text-slate-400" />
                موقع التسليم (إلى أين؟)
              </label>
              <button type="button" onClick={() => { setNewPlaceAddress(dropoffLocation); setShowSaveModal(true); }} disabled={!dropoffLocation} className="text-[10px] text-emerald-400 font-bold hover:underline disabled:opacity-50 flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                حفظ الموقع
              </button>
            </div>
            <input
              type="text"
              required
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="مثال: مستشفى الصدر..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
            />
            {savedPlaces.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {savedPlaces.map((place, idx) => (
                  <button type="button" key={idx} onClick={() => setDropoffLocation(place.address)} className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3 text-emerald-500/70" />
                    {place.label}
                  </button>
                ))}
              </div>
            )}
            
            {!showDropoffMap ? (
              <button type="button" onClick={() => setShowDropoffMap(true)} className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold">
                <Map className="w-4 h-4" /> تحديد موقع التسليم بدقة على الخريطة (اختياري)
              </button>
            ) : (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300">موقع التسليم على الخريطة</span>
                  <button type="button" onClick={() => setShowDropoffMap(false)} className="text-[10px] text-slate-500 hover:text-slate-400">إخفاء</button>
                </div>
                <MapLocationPicker value={dropoffCoords} onChange={(coords) => setDropoffCoords(coords)} required={false} />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <Phone className="w-4 h-4 text-slate-400" />
              رقم الهاتف للتواصل
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="07..."
                dir="ltr"
                className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3 pl-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-right"
              />
              <span className="absolute left-4 top-3 text-slate-500 text-sm">964+</span>
            </div>
          </div>

          {!isPeople && (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <Phone className="w-4 h-4 text-slate-400" />
                رقم هاتف المستلم (للتواصل عند الوصول)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="07..."
                  dir="ltr"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 pl-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-right"
                />
                <span className="absolute left-4 top-3 text-slate-500 text-sm">964+</span>
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isPeople ? "كم عدد الركاب؟ أي تعليمات للسائق؟" : "ما هي الأمانة؟ هل هي قابلة للكسر؟"}
              className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all h-24 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white rounded-2xl font-bold flex justify-center items-center gap-2 transition-all ${
            loading ? 'opacity-70 cursor-not-allowed bg-slate-700' : isPeople ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20' : 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20'
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              إرسال الطلب للسائقين
              <Navigation className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Save Place Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 relative">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400" /> حفظ كموقع مفضل
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">تسمية الموقع (مثال: المنزل، العمل)</label>
                <input type="text" value={newPlaceLabel} onChange={(e) => setNewPlaceLabel(e.target.value)} placeholder="مثال: المنزل" className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">العنوان</label>
                <input type="text" value={newPlaceAddress} onChange={(e) => setNewPlaceAddress(e.target.value)} className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowSaveModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors">
                إلغاء
              </button>
              <button type="button" onClick={() => {
                if (!newPlaceLabel || !newPlaceAddress) return;
                const newPlaces = [...savedPlaces, { label: newPlaceLabel, address: newPlaceAddress }];
                setSavedPlaces(newPlaces);
                localStorage.setItem('dazly_saved_places', JSON.stringify(newPlaces));
                setShowSaveModal(false);
                setNewPlaceLabel('');
                setNewPlaceAddress('');
              }} disabled={!newPlaceLabel || !newPlaceAddress} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                حفظ الموقع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TransportRequestPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-slate-400">جاري التحميل...</div>}>
      <RequestForm />
    </Suspense>
  );
}
