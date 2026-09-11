import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب لعرض الطلبات' },
        { status: 400 }
      );
    }

    // Clean phone number (strip whitespace and common formatting)
    const cleanPhone = phone.trim();

    // REMOVED 1 HOUR AUTO-CANCEL RULE FROM GET POLLING TO AVOID SQLITE DATABASE WRITER DEADLOCK
    const orders = await prisma.order.findMany({
      where: {
        customerPhone: {
          contains: cleanPhone,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        shop: {
          select: {
            id: true,
            nameAr: true,
            imageUrl: true,
            deliveryFee: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء استرجاع قائمة طلباتك' },
      { status: 500 }
    );
  }
}
