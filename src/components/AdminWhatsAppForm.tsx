'use client';

import React, { useState } from 'react';
import { MessageCircle, Check, Loader2 } from 'lucide-react';

interface Props {
  initialValue: string;
}

export const AdminWhatsAppForm: React.FC<Props> = ({ initialValue }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialValue || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWhatsAppNumber: phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ تم حفظ رقم واتساب استقبال الطلبات بنجاح');
      } else {
        alert(data.error || 'حدث خطأ أثناء حفظ الرقم');
      }
    } catch (err) {
      console.error(err);
      alert('فشل في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 text-right space-y-3 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <MessageCircle className="w-6 h-6 fill-emerald-500/20" />
          <div>
            <h3 className="font-black text-slate-100 text-base">رقم واتساب استقبال الطلبات المباشر</h3>
            <p className="text-[11px] text-slate-400 font-medium">يُقرأ هذا الرقم ديناميكياً لإرسال الطلبات من الزبائن إلى الأدمن مباشرة</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="أدخل رقم الواتساب (مثال: 07701234567)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="flex-1 py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>حفظ الرقم ✅</span>
        </button>
      </form>

      {message && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold text-center">
          {message}
        </div>
      )}
    </div>
  );
};
