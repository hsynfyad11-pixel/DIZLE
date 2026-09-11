import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastTransportToCouriers } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'معلومات غير مكتملة' }, { status: 400 });
    }

    const transportReq = await prisma.transportRequest.findUnique({ where: { id } });
    if (!transportReq || transportReq.status !== 'NEGOTIATING') {
      return NextResponse.json({ success: false, error: 'الطلب غير متاح أو لم يعد في مرحلة التفاوض' }, { status: 400 });
    }

    if (action === 'ACCEPT') {
      // Customer accepted the driver's proposed price
      await prisma.transportRequest.update({
        where: { id },
        data: {
          price: transportReq.proposedPrice || transportReq.price,
          status: 'ACCEPTED',
          proposedPrice: null,
        },
      });

      return NextResponse.json({ success: true, message: 'تم الموافقة على السعر. الكابتن في طريقه إليك!' });
    } 
    
    if (action === 'REJECT') {
      // Customer rejected the custom price, send it back to PENDING for others, clearing driver
      await prisma.transportRequest.update({
        where: { id },
        data: {
          status: 'PENDING',
          driverId: null,
          proposedPrice: null,
        },
      });

      // optionally rebroadcast to telegram so other drivers see it again? Let's do it.
      // try {
      //   const host = req.headers.get('host') || null;
      //   await broadcastTransportToCouriers(transportReq, host ?? undefined);
      // } catch (err) {}

      return NextResponse.json({ success: true, message: 'تم رفض السعر. جاري البحث عن كابتن آخر بالسعر الأساسي.' });
    }

    return NextResponse.json({ success: false, error: 'إجراء غير معروف' }, { status: 400 });

  } catch (error) {
    console.error('Error negotiating transport:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
