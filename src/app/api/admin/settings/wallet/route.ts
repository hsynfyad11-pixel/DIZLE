import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const numberSetting = await prisma.systemSetting.findUnique({
      where: { key: 'OFFICIAL_WALLET_NUMBER' },
    });
    
    const providerSetting = await prisma.systemSetting.findUnique({
      where: { key: 'OFFICIAL_WALLET_PROVIDER_NAME' },
    });
    
    return NextResponse.json({ 
      success: true, 
      walletNumber: numberSetting?.value || '',
      walletProviderName: providerSetting?.value || 'زين كاش'
    });
  } catch (error) {
    console.error('Error fetching wallet settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب إعدادات المحفظة' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { walletNumber, walletProviderName } = await request.json();

    if (!walletNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم المحفظة مطلوب' },
        { status: 400 }
      );
    }

    const providerName = walletProviderName || 'زين كاش';

    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: 'OFFICIAL_WALLET_NUMBER' },
        update: { value: walletNumber },
        create: { key: 'OFFICIAL_WALLET_NUMBER', value: walletNumber },
      }),
      prisma.systemSetting.upsert({
        where: { key: 'OFFICIAL_WALLET_PROVIDER_NAME' },
        update: { value: providerName },
        create: { key: 'OFFICIAL_WALLET_PROVIDER_NAME', value: providerName },
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث أرقام ومعلومات المحفظة الرسمية بنجاح',
    });
  } catch (error) {
    console.error('Error updating wallet settings:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث إعدادات المحفظة' },
      { status: 500 }
    );
  }
}
