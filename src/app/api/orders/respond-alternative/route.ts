import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId, itemId, action } = await request.json();
    if (!orderId || !action) {
      return NextResponse.json({ success: false, error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });

    if (action === 'CANCEL_ORDER') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
      return NextResponse.json({ success: true, message: 'تم إلغاء الطلب بالكامل' });
    }

    // if not CANCEL_ORDER, itemId must be provided
    if (!itemId) return NextResponse.json({ success: false, error: 'بيانات غير مكتملة' }, { status: 400 });

    const item = order.items.find(i => i.id === itemId);
    if (!item) return NextResponse.json({ success: false, error: 'العنصر غير موجود' }, { status: 404 });

    if (action === 'APPROVE') {
      const originalItemTotal = item.unitPrice * item.quantity;
      const newItemTotal = (item.altUnitPrice || 0) * item.quantity;
      const diff = newItemTotal - originalItemTotal;

      await prisma.$transaction([
        prisma.orderItem.update({
          where: { id: itemId },
          data: { 
            status: 'ALTERNATIVE_ACCEPTED',
            unitPrice: item.altUnitPrice !== null ? item.altUnitPrice : item.unitPrice
          }
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            totalPrice: order.totalPrice + diff,
            grandTotal: order.grandTotal + diff,
            status: 'PENDING'
          }
        })
      ]);
      console.log(`✅ [DB SYNC SUCCESS] Order ${orderId.slice(-6)} item ${itemId} successfully swapped to substitute: ${item.altProductName}`);
      return NextResponse.json({ success: true, message: 'تم قبول البديل وإكمال الطلب' });
    }

    if (action === 'CANCEL_ITEM') {
      const originalItemTotal = item.unitPrice * item.quantity;
      
      const remainingActiveItems = order.items.filter(i => i.id !== itemId && i.status !== 'ALTERNATIVE_REJECTED');
      
      if (remainingActiveItems.length === 0) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' }
        });
        return NextResponse.json({ success: true, message: 'تم إلغاء الطلب لعدم وجود منتجات أخرى' });
      } else {
        await prisma.$transaction([
          prisma.orderItem.update({
            where: { id: itemId },
            data: { status: 'ALTERNATIVE_REJECTED' }
          }),
          prisma.order.update({
            where: { id: orderId },
            data: {
              totalPrice: Math.max(0, order.totalPrice - originalItemTotal),
              grandTotal: Math.max(0, order.grandTotal - originalItemTotal),
              status: 'PENDING'
            }
          })
        ]);
        return NextResponse.json({ success: true, message: 'تم حذف المنتج من الطلب' });
      }
    }

    return NextResponse.json({ success: false, error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error) {
    console.error('Error handling alternative response:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
