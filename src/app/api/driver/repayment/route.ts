import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json({ success: false, error: 'معرّف السائق مطلوب' }, { status: 400 });
    }

    const requests = await prisma.repaymentRequest.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching driver repayments:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب طلبات التسديد' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, amount, receiptImage } = body;

    if (!driverId || !amount || !receiptImage) {
      return NextResponse.json(
        { success: false, error: 'كافة الحقول مطلوبة' },
        { status: 400 }
      );
    }

    const repaymentRequest = await prisma.repaymentRequest.create({
      data: {
        driverId,
        amount: Number(amount),
        receiptImage,
        status: 'PENDING',
      },
    });

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (driver) {
      const host = request.headers.get('host') || undefined;
      import('@/lib/telegram').then(tel => {
        tel.notifyAdminOfRepayment(driver, Number(amount), receiptImage, host).catch(e => console.error(e));
      });
    }

    return NextResponse.json({
      success: true,
      request: repaymentRequest,
      message: 'تم إرسال طلب التسديد بنجاح وبانتظار موافقة الإدارة',
    });
  } catch (error) {
    console.error('Error creating repayment request:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إرسال طلب التسديد' },
      { status: 500 }
    );
  }
}
