import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { driverId, requestId, action, newStatus, price } = body;

    if (!driverId || !requestId || !action) {
      return NextResponse.json({ success: false, error: 'معلومات غير مكتملة' }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) return NextResponse.json({ success: false, error: 'السائق غير موجود' }, { status: 404 });

    if (action === 'ACCEPT') {
      const isBlocked = (Number(driver.currentDebt) || 0) >= (Number(driver.maxCreditLimit) || 50000);
      if (isBlocked) {
        return NextResponse.json({ success: false, error: 'الرصيد متجاوز الحد المسموح به!' }, { status: 403 });
      }

      const reqDb = await prisma.transportRequest.findUnique({ where: { id: requestId } });
      if (!reqDb) return NextResponse.json({ success: false, error: 'الطلب غير متوفر' }, { status: 404 });

      if (reqDb.status !== 'PENDING') {
        return NextResponse.json({ success: false, error: 'هذا الطلب لم يعد متاحاً.' }, { status: 400 });
      }

      const targetPrice = price !== undefined ? Number(price) : reqDb.price;

      if (targetPrice !== reqDb.price) {
        // Negotiation flow
        await prisma.transportRequest.update({
          where: { id: requestId },
          data: {
            driverId,
            status: 'NEGOTIATING',
            proposedPrice: targetPrice,
          },
        });
        return NextResponse.json({ success: true, message: 'تم إرسال السعر المعدل للزبون للموافقة.' });
      } else {
        // Direct accept flow
        await prisma.transportRequest.update({
          where: { id: requestId },
          data: {
            driverId,
            status: 'ACCEPTED',
          },
        });
        return NextResponse.json({ success: true, message: 'تم قبول الطلب بنجاح.' });
      }
    }

    if (action === 'UPDATE_STATUS') {
      await prisma.transportRequest.update({
        where: { id: requestId },
        data: { status: newStatus }, // 'COMPLETED'
      });

      // Fixed Transport completion processing (500 IQD per ride for platform)
      if (newStatus === 'COMPLETED') {
        await prisma.driver.update({
          where: { id: driverId },
          data: {
            currentDebt: {
              increment: 500
            }
          }
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'إجراء غير مدعوم' }, { status: 400 });

  } catch (err) {
    console.error('Error updating transport request:', err);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
