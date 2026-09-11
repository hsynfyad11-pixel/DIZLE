import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

    let whatsappSetting = await prisma.systemSetting.findUnique({
      where: { key: 'ADMIN_WHATSAPP_NUMBER' },
    });

    let contactPhoneSetting = await prisma.systemSetting.findUnique({
      where: { key: 'CONTACT_PHONE_NUMBER' },
    });

    let supportWhatsappSetting = await prisma.systemSetting.findUnique({
      where: { key: 'SUPPORT_WHATSAPP_NUMBER' },
    });


    return NextResponse.json({
      success: true,
      adminWhatsAppNumber: whatsappSetting ? whatsappSetting.value : '',
      contactPhoneNumber: contactPhoneSetting ? contactPhoneSetting.value : '',
      supportWhatsAppNumber: supportWhatsappSetting ? supportWhatsappSetting.value : '',
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب إعدادات النظام' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminWhatsAppNumber, contactPhoneNumber, supportWhatsAppNumber } = body;

    let responseData: Record<string, any> = { success: true };
    const messages: string[] = [];

    if (adminWhatsAppNumber !== undefined) {
      const cleanPhone = String(adminWhatsAppNumber).trim();
      const updatedWhatsapp = await prisma.systemSetting.upsert({
        where: { key: 'ADMIN_WHATSAPP_NUMBER' },
        update: { value: cleanPhone },
        create: { id: 'ADMIN_WHATSAPP_NUMBER', key: 'ADMIN_WHATSAPP_NUMBER', value: cleanPhone },
      });

      responseData.adminWhatsAppNumber = updatedWhatsapp.value;
      messages.push('تم حفظ رقم واتساب للطلبات بنجاح ✅');
    }

    if (contactPhoneNumber !== undefined) {
      const cleanContactPhone = String(contactPhoneNumber).trim();
      const updatedContactPhone = await prisma.systemSetting.upsert({
        where: { key: 'CONTACT_PHONE_NUMBER' },
        update: { value: cleanContactPhone },
        create: { id: 'CONTACT_PHONE_NUMBER', key: 'CONTACT_PHONE_NUMBER', value: cleanContactPhone },
      });
      responseData.contactPhoneNumber = updatedContactPhone.value;
      messages.push('تم حفظ رقم هاتف الاتصال المباشر بنجاح ✅');
    }

    if (supportWhatsAppNumber !== undefined) {
      const cleanSupportPhone = String(supportWhatsAppNumber).trim();
      const updatedSupportWhatsapp = await prisma.systemSetting.upsert({
        where: { key: 'SUPPORT_WHATSAPP_NUMBER' },
        update: { value: cleanSupportPhone },
        create: { id: 'SUPPORT_WHATSAPP_NUMBER', key: 'SUPPORT_WHATSAPP_NUMBER', value: cleanSupportPhone },
      });

      responseData.supportWhatsAppNumber = updatedSupportWhatsapp.value;
      messages.push('تم حفظ رقم واتساب الدعم الفني بنجاح ✅');
    }

    responseData.message = messages.join(' | ') || 'تم حفظ التغيرات بنجاح ✅';
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'حدث خطأ أثناء تعديل إعدادات النظام' },
      { status: 500 }
    );
  }
}
