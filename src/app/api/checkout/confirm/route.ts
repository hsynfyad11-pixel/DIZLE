import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'رقم الطلب مطلوب' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING' },
    });

    console.log(`✅ [ORDER CONFIRMED] Customer confirmed WhatsApp dispatch for order #${orderId.slice(-6)}`);

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد إرسال الطلب عبر الواتساب بنجاح',
      order: updated,
    });
  } catch (error) {
    console.error('Error confirming WhatsApp order status:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تأكيد حالة الطلب' },
      { status: 500 }
    );
  }
}
