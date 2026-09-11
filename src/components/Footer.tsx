import React from 'react';
import { prisma } from '@/lib/prisma';
import { Phone, MessageCircle } from 'lucide-react';

export async function Footer() {
  const supportWhatsappSetting = await prisma.systemSetting.findUnique({
    where: { key: 'SUPPORT_WHATSAPP_NUMBER' },
  });

  const phoneSetting = await prisma.systemSetting.findUnique({
    where: { key: 'CONTACT_PHONE_NUMBER' },
  });

  const whatsappSupport = (supportWhatsappSetting?.value || '').trim();
  const phone = (phoneSetting?.value || '').trim();

  // Clean the number for href links
  const getCleanNumber = (numStr: string) => {
    let cleaned = numStr.replace(/[^\d]/g, '');
    if (cleaned.startsWith('07') && cleaned.length === 11) {
      cleaned = '964' + cleaned.slice(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '964' + cleaned.slice(1);
    }
    return cleaned;
  };

  const cleanWhatsappSupport = whatsappSupport ? getCleanNumber(whatsappSupport) : '';
  const cleanPhone = phone ? phone.replace(/[^\d]/g, '') : '';

  const hasValidSupport = cleanWhatsappSupport.length >= 10;
  const hasValidPhone = cleanPhone.length > 5;

  if (!hasValidSupport && !hasValidPhone) return null;

  return (
    <footer id="contact" className="w-full max-w-4xl mx-auto px-4 py-8 mt-4 mb-20 border-t border-slate-800/60">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm">
        <h3 className="font-extrabold text-slate-100 text-lg">تواصل معنا</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          نحن هنا لمساعدتك والإجابة على كل استفساراتك! يمكنك التواصل مع إدارة منصة دزلي DIZLY للحصول على الدعم بأي وقت.
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-3">
          {hasValidSupport && (
            <a
              href={`https://wa.me/${cleanWhatsappSupport}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-2.5 px-5 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/50 rounded-2xl text-teal-400 transition-all active:scale-95 w-full sm:w-auto justify-center"
            >
              <MessageCircle className="w-5 h-5 fill-teal-500/20" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold text-xs text-teal-300">للدعم الفني</span>
                <span className="font-bold text-xs font-mono dir-ltr opacity-90">{whatsappSupport}</span>
              </div>
            </a>
          )}

          {hasValidPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-2.5 py-2.5 px-5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 rounded-2xl text-blue-400 transition-all active:scale-95 w-full sm:w-auto justify-center"
            >
              <Phone className="w-5 h-5 fill-blue-500/20" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold text-xs text-blue-300">للاتصال المباشر</span>
                <span className="font-bold text-xs font-mono dir-ltr opacity-90">{phone}</span>
              </div>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
