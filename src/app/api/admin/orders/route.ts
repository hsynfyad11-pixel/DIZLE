import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        shop: {
          select: { id: true, nameAr: true, phone: true, imageUrl: true, category: true },
        },
        driver: {
          select: { id: true, name: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, nameAr: true, price: true, imageUrl: true },
            },
          },
        },
      },
    });

    const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

    return NextResponse.json({
      success: true,
      orders,
      pendingCount,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب طلبات الزبائن' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, driverId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'رقم الطلب مطلوب' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (driverId !== undefined) updateData.driverId = driverId || null;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        shop: true,
        driver: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `تم تحديث حالة الطلب (#${orderId.slice(-6)}) بنجاح`,
    });
  } catch (error) {
    console.error('Error updating admin order:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تعديل حالة الطلب' },
      { status: 500 }
    );
  }
}
