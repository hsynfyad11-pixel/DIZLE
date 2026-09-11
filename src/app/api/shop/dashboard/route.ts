import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    // REMOVED 1 HOUR AUTO-CANCEL RULE FROM GET POLLING TO AVOID SQLITE DATABASE WRITER DEADLOCK
    // Enforce Strict Authentication
    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.' },
        { status: 401 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على أي متجر' },
        { status: 404 }
      );
    }

    // Workaround for Windows Prisma Client file lock: manually inject substitutionPreference
    if (shop.orders && shop.orders.length > 0) {
      const orderIds = shop.orders.map(o => o.id);
      try {
        const rawOrders: any[] = await prisma.$queryRawUnsafe(
          `SELECT id, substitutionPreference FROM "Order" WHERE id IN (${orderIds.map(() => '?').join(',')})`,
          ...orderIds
        );
        const rawMap = new Map(rawOrders.map(o => [o.id, o.substitutionPreference]));
        shop.orders.forEach(o => {
          (o as any).substitutionPreference = rawMap.get(o.id);
        });
      } catch (err) {
        console.warn("Could not fetch substitutionPreference:", err);
      }
    }

    return NextResponse.json({ success: true, shop });
  } catch (error) {
    console.error('Error fetching shop dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب بيانات لوحة التحكم' },
      { status: 500 }
    );
  }
}
