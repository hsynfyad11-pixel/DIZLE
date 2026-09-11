import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { editTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const messageId = callbackQuery.message.message_id;
      const chatId = callbackQuery.message.chat.id;
      // You should verify the sender (callbackQuery.from.id) with your DB driver's telegramChatId
      const telegramUserId = callbackQuery.from.id.toString();

      if (data.startsWith('claim_order_')) {
        const orderId = data.replace('claim_order_', '');

        // 1. Check if the courier exists based on their telegram ID
        const driverSetting = await prisma.systemSetting.findFirst({
          where: { value: telegramUserId, key: { startsWith: 'telegram_driver_' } }
        });
        
        let driver = null;
        if (driverSetting) {
          const driverId = driverSetting.key.replace('telegram_driver_', '');
          driver = await prisma.driver.findUnique({ where: { id: driverId } });
        }

        if (!driver) {
          // You may reply an alert telling them to link their account
          return NextResponse.json({ success: true, message: 'Driver not found' });
        }

        // 2. Atomic check and claim
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

        let newText = callbackQuery.message.text + '\n\n';

        if (updateResult.count === 0) {
          // Already claimed
          newText += `❌ <b>عذراً، هذا الطلب تم استلامه مسبقاً.</b>`;
        } else {
          // Successfully claimed
          newText += `✅ <b>استلم الطلب: ${driver.name}</b> 🛵`;
        }

        // Edit the message to remove buttons and show who claimed it
        await editTelegramMessage(chatId, messageId, newText, { inline_keyboard: [] });
        return NextResponse.json({ success: true, handled: true });
      }
      
      if (data.startsWith('store_accept_')) {
        const orderId = data.replace('store_accept_', '');
        
        // Find store by telegram chat id
        const storeSetting = await prisma.systemSetting.findFirst({
          where: { value: telegramUserId, key: { startsWith: 'telegram_chat_shop_' } }
        });
        
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '6681465010';
        if (!storeSetting && telegramUserId !== adminChatId) {
           return NextResponse.json({ success: true });
        }

        // Update status to AWAITING_COURIER (broadcasting part can be triggered from UI or here)
        // Since we broadcast from UI in shop dashboard, or we can broadcast right here:
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'AWAITING_COURIER' },
          include: { shop: true, items: { include: { product: true } } }
        });
        
        if (order) {
            // Edit message to hide buttons
            const newText = callbackQuery.message.text + `\n\n✅ <b>تم قبول الطلب وبانتظار مندوب.</b>`;
            await editTelegramMessage(chatId, messageId, newText, { inline_keyboard: [] });
            
            // Broadcast to couriers using lib/telegram
            const { broadcastToCouriers } = await import('@/lib/telegram');
            const host = request.headers.get('host') || null;
            await broadcastToCouriers(order, host ?? undefined);
        }

        return NextResponse.json({ success: true, handled: true });
      }
      
      if (data.startsWith('store_reject_')) {
        const orderId = data.replace('store_reject_', '');
        
        // Simple reject logic
        await prisma.order.updateMany({
          where: { id: orderId },
          data: { status: 'CANCELLED' }
        });
        
        const newText = callbackQuery.message.text + `\n\n❌ <b>إلغاء الطلب من قبل المتجر.</b>`;
        await editTelegramMessage(chatId, messageId, newText, { inline_keyboard: [] });

        return NextResponse.json({ success: true, handled: true });
      }

    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
