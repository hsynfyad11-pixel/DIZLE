import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { driverId, orderId, action, newStatus } = body;
    // action: 'ACCEPT' | 'UPDATE_STATUS'
    // newStatus: 'ON_THE_WAY' | 'DELIVERED'

    if (!driverId || !orderId) {
      return NextResponse.json(
        { success: false, error: 'معرّف السائق ومعرّف الطلب مطلوبان' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على حساب السائق' },
        { status: 404 }
      );
    }

    // CHECK CREDIT LIMIT BLOCKING
    const currentDebt = typeof driver.currentDebt === 'number' ? driver.currentDebt : Number(driver.currentDebt) || 0;
    const maxCreditLimit = typeof driver.maxCreditLimit === 'number' ? driver.maxCreditLimit : Number(driver.maxCreditLimit) || 50000;
    if (currentDebt >= maxCreditLimit && action === 'ACCEPT') {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز رنج الدين المسموح به (${maxCreditLimit.toLocaleString('en-US')} د.ع). يرجى تصفية الحساب لدى الأدمن لاستلام طلبات جديدة.`,
        },
        { status: 403 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    if (action === 'ACCEPT') {
      const updateResult = await prisma.order.updateMany({
        where: { 
          id: orderId,
          driverId: null, 
          status: 'AWAITING_COURIER'
        },
        data: {
          driverId: driver.id,
          status: 'COURIER_ASSIGNED',
        },
      });

      if (updateResult.count === 0) {
        return NextResponse.json(
          { success: false, error: 'عذراً، لقد تم استلام هذا الطلب من قبل مندوب آخر أو لم يعد متاحاً' },
          { status: 409 }
        );
      }

      const updatedOrder = await prisma.order.findUnique({ where: { id: orderId } });

      // TELEGRAM NOTIFICATION: Update the original message in the couriers channel
      if (updatedOrder && (updatedOrder as any).telegramMessageId) {
        try {
          const { editTelegramMessage } = await import('@/lib/telegram');
          const targetChannel = process.env.TELEGRAM_COURIERS_CHAT_ID || '@dizly7';
          const newText = `
✅ <b>تم قبول الطلب والتوجه للمتجر!</b>
📦 رقم الطلب: <code>${updatedOrder.id}</code>
🛵 <b>المندوب المُكلف:</b> ${driver.name}
          `.trim();
          
          await editTelegramMessage(
            targetChannel, 
            (updatedOrder as any).telegramMessageId, 
            newText, 
            { inline_keyboard: [] }
          );
        } catch (err) {
          console.error('Failed to update telegram message on order accept:', err);
        }
      }

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: 'تم قبول الطلب بنجاح، أنت الآن مكلف بتوصيله 🛵',
      });
    }

    if (action === 'UPDATE_STATUS') {
      if (!newStatus || !['ON_THE_WAY', 'DELIVERED'].includes(newStatus)) {
        return NextResponse.json(
          { success: false, error: 'حالة الطلب غير صالحة' },
          { status: 400 }
        );
      }

      // If marking as DELIVERED, accumulate cash/debt to driver
      if (newStatus === 'DELIVERED' && order.status !== 'DELIVERED') {
        const uniqueShops = new Set(order.items.map((item: any) => item.product?.shopId || order.shopId));
        const numShops = uniqueShops.size || 1;
        const courierShare = 1000 + (250 * (numShops - 1));
        
        // ONLY capture the platform's cut of the delivery fee (deliveryFee - courierShare).
        // Driver settles items cost directly with shop in cash.
        const debtIncrement = order.deliveryFee - courierShare;
        const finalDebtIncrement = debtIncrement > 0 ? debtIncrement : 0;

        const [updatedOrder, updatedDriver] = await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'DELIVERED' },
          }),
          prisma.driver.update({
            where: { id: driverId },
            data: {
              currentDebt: {
                increment: finalDebtIncrement,
              },
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          order: updatedOrder,
          driver: updatedDriver,
          message: `تم تسليم الطلب بنجاح وقيد عمولة المنصة (${finalDebtIncrement.toLocaleString('en-US')} د.ع) في ذمتك`,
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: 'تم تحديث حالة الطلب بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating driver order:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
