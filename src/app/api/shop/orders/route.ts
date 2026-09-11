import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'رقم الطلب مطلوب' }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id: orderId }
    });

    return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء إزالة الطلب' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'رقم الطلب حقل مطلوب' },
        { status: 400 }
      );
    }


    // Case 2: Standard Order status update (e.g. PREPARING, ON_THE_WAY, DELIVERED, CANCELLED)
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'حالة الطلب مطلوبة' },
        { status: 400 }
      );
    }

    const { transportMode } = body;

    // STRICT BACKEND CHECK: Prevent starting preparation if awaiting customer approval
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (existingOrder.status === 'PENDING_CUSTOMER_APPROVAL' && status === 'PREPARING') {
      return NextResponse.json(
        { success: false, error: 'لا يمكن بدء التجهيز، الطلب بانتظار موافقة الزبون' },
        { status: 403 }
      );
    }

    const dataPayload: any = { status };
    if (transportMode) {
      dataPayload.transportMode = transportMode;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: dataPayload,
      include: {
        shop: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // TELEGRAM INTEGRATION: Broadcast to couriers
    if (status === 'AWAITING_COURIER') {
      try {
        const { broadcastToCouriers } = await import('@/lib/telegram');
        const host = request.headers.get('host') || null;
        await broadcastToCouriers(updatedOrder, host ?? undefined);
      } catch (err) {
        console.error('Failed to broadcast to couriers via Telegram:', err);
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `تم تحديث حالة الطلب إلى ${status}`,
    });
  } catch (error) {
    console.error('Error updating order status or alternative:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث حالة الطلب' },
      { status: 500 }
    );
  }
}
