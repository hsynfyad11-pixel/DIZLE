import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const requests = await prisma.repaymentRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          select: { name: true, phone: true, currentDebt: true },
        },
      },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching admin repayments:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب طلبات التسديد' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'APPROVE' or 'REJECT'

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'معرّف الطلب والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    const repaymentRequest = await prisma.repaymentRequest.findUnique({
      where: { id },
      include: { driver: true },
    });

    if (!repaymentRequest) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    if (repaymentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'تمت معالجة هذا الطلب مسبقاً' },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      // Update request status to APPROVED and deduct debt from driver
      await prisma.$transaction([
        prisma.repaymentRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
        }),
        prisma.driver.update({
          where: { id: repaymentRequest.driverId },
          data: { currentDebt: { decrement: repaymentRequest.amount } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'تمت الموافقة على طلب التسديد وخصم المبلغ من السائق',
      });
    }

    if (action === 'REJECT') {
      await prisma.repaymentRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({
        success: true,
        message: 'تم رفض طلب التسديد',
      });
    }

    return NextResponse.json(
      { success: false, error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating repayment request:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة طلب التسديد' },
      { status: 500 }
    );
  }
}
