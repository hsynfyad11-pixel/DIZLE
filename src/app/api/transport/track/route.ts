import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'رقم التتبع غير متوفر' }, { status: 400 });
    }

    const transportReq = await prisma.transportRequest.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            name: true,
            phone: true,
            vehicle: true,
          }
        }
      }
    });

    if (!transportReq) {
      return NextResponse.json({ success: false, error: 'الطلب غير متوفر' }, { status: 404 });
    }

    // Mask driver details if status is not ACCEPTED or COMPLETED (e.g. if NEGOTIATING or PENDING)
    if (transportReq.status !== 'ACCEPTED' && transportReq.status !== 'COMPLETED' && transportReq.driver) {
      transportReq.driver.phone = 'يظهر بعد القبول';
    }

    return NextResponse.json({ success: true, transportRequest: transportReq });
  } catch (error) {
    console.error('Error fetching transport req:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب بيانات التتبع' }, { status: 500 });
  }
}
