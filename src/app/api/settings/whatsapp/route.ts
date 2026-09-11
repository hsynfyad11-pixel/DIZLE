import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'ADMIN_WHATSAPP_NUMBER' },
    });

    return NextResponse.json({
      success: true,
      adminWhatsAppNumber: setting ? setting.value : '',
    });
  } catch (error) {
    console.error('Error fetching public admin WhatsApp setting:', error);
    return NextResponse.json(
      { success: false, adminWhatsAppNumber: '' },
      { status: 500 }
    );
  }
}
