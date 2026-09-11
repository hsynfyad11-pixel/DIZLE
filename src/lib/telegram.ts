import { prisma } from './prisma';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8766355337:AAGFx-vA40Uwlb9O_4CEuYQiFswxZys5rdo';
const COURIERS_CHAT_ID = process.env.TELEGRAM_COURIERS_CHAT_ID || '@dizly7';

export function getAppUrl(hostUrl?: string): string {
  // Helper to safely format URLs for Telegram (Telegram rejects 'localhost' but accepts '127.0.0.1')
  const sanitizeUrl = (url: string) => {
    let cleanUrl = url.replace('localhost', '127.0.0.1');
    return cleanUrl.startsWith('http') ? cleanUrl : `http://${cleanUrl}`;
  };

  // 1. Absolute Priority: Direct HTTP Request Host (Always accurate to what customer visits)
  if (hostUrl) {
    return sanitizeUrl(hostUrl);
  }

  // 2. Vercel Permanent Production Domain
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 3. Fallback to manually configured URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return sanitizeUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  // 4. Default Fallback
  return 'http://127.0.0.1:3000';
}

export async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8766355337:AAGFx-vA40Uwlb9O_4CEuYQiFswxZys5rdo';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  if (!chatId) return;

  try {
    console.log(`[TELEGRAM API] Dispatching message to Chat ID: ${chatId}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });
    
    const data = await response.json();
    if (!data.ok) {
      console.error('[TELEGRAM API ERROR Response]:', data);
    } else {
      console.log(`[TELEGRAM API] Message sent successfully to ${chatId}!`);
    }
    return data;
  } catch (error) {
    console.error('[TELEGRAM API NETWORK ERROR]:', error);
  }
}

export async function sendTelegramPhoto(chatId: string, photoUrl: string, caption: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8766355337:AAGFx-vA40Uwlb9O_4CEuYQiFswxZys5rdo';
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  
  if (!chatId) return;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('[TELEGRAM sendPhoto ERROR]:', error);
  }
}

export async function editTelegramMessage(chatId: string, messageId: number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8766355337:AAGFx-vA40Uwlb9O_4CEuYQiFswxZys5rdo';
  const url = `https://api.telegram.org/bot${token}/editMessageText`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error editing Telegram message:', error);
  }
}

export async function broadcastToCouriers(order: any, hostUrl?: string) {
  const targetChannel = process.env.TELEGRAM_COURIERS_CHAT_ID || '@dizly7';
  if (!targetChannel) return;

  const itemsList = order.items.map((item: any) => `• ${item.product.nameAr} x${item.quantity}`).join('\n');
  
  const uniqueShops = new Set(order.items.map((item: any) => item.product?.shopId || order.shopId));
  const numShops = uniqueShops.size || 1;
  const courierShare = 1000 + (250 * (numShops - 1));
  
  const text = `
🆕 <b>طلب جديد متوفر للتوصيل!</b>
📦 رقم الطلب: <code>${order.id}</code>
🏪 المتجر: <b>${order.shop.nameAr}</b>

👤 <b>الزبون:</b> ${order.customerName}
📞 <b>الهاتف:</b> ${order.customerPhone}
📍 <b>المنطقة:</b> ${order.deliveryArea}

💵 <b>الإجمالي:</b> ${order.grandTotal.toLocaleString('en-US')} د.ع
🚚 <b>أجرة التوصيل:</b> ${courierShare.toLocaleString('en-US')} د.ع

📋 <b>التفاصيل:</b>
${itemsList}
  `.trim();

  const appUrl = getAppUrl(hostUrl);
  
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🛵 قبول الطلب',
          url: `${appUrl}/driver/dashboard`
        }
      ]
    ]
  };

  const result = await sendTelegramMessage(targetChannel, text, replyMarkup);
  
  if (result?.ok && result.result?.message_id) {
    try {
      // @ts-ignore
      await prisma.order.update({
        where: { id: order.id },
        // @ts-ignore
        data: { telegramMessageId: result.result.message_id }
      });
    } catch (err) {
      console.error('Failed to save telegramMessageId:', err);
    }
  }
}

export async function notifyStoreOwner(order: any, shopChatId: string, hostUrl?: string) {
  if (!shopChatId) return;

  const itemsList = order.items.map((item: any) => `• ${item.product.nameAr} x${item.quantity}`).join('\n');
  
  const text = `
🚨 <b>طلب زبون جديد! (#${order.id.slice(-6)})</b>
👤 الزبون: ${order.customerName}
📞 الهاتف: ${order.customerPhone}

💵 الفاتورة: ${order.grandTotal.toLocaleString()} د.ع

📋 <b>المنتجات:</b>
${itemsList}

⚠️ <b>لإدارة الطلب:</b> يرجى التوجه إلى لوحة تحكم المتجر في الموقع (لوحة المتاجر) لمعالجة هذا الطلب وبدء التجهيز فوراً.
  `.trim();

  const appUrl = getAppUrl(hostUrl);
  
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🏪 معالجة الطلب وبدء التجهيز',
          url: `${appUrl}/shop/dashboard`
        }
      ]
    ]
  };

  await sendTelegramMessage(shopChatId, text, replyMarkup);
}

export async function broadcastTransportToCouriers(tr: any, hostUrl?: string) {
  const targetChannel = process.env.TELEGRAM_COURIERS_CHAT_ID || '@dizly7';
  if (!targetChannel) return;

  const isParcel = tr.type === 'PARCEL';
  const typeLabel = isParcel ? "📦 توصيل أمانة" : "🚕 توصيل مشوار (أشخاص)";
  
  let text = `
🆕 <b>طلب خدمة أوصلني جديد!</b>
🔖 النوع: <b>${typeLabel}</b>
🏷️ رقم المعرف: <code>TR-${tr.id.slice(-5)}</code>

📍 <b>من (موقع الاستلام):</b> ${tr.pickupLocation}`;

  if (tr.pickupLat && tr.pickupLng) {
    text += `\n🗺️ <a href="https://maps.google.com/?q=${tr.pickupLat},${tr.pickupLng}">عرض موقع الاستلام على الخريطة</a>`;
  }
  
  text += `\n🏁 <b>إلى (موقع التسليم):</b> ${tr.dropoffLocation}`;
  if (tr.dropoffLat && tr.dropoffLng) {
    text += `\n🗺️ <a href="https://maps.google.com/?q=${tr.dropoffLat},${tr.dropoffLng}">عرض موقع التسليم على الخريطة</a>`;
  }
  
  text += `\n\n👤 <b>هاتف المُرسل (الزبون):</b> يظهر للسائق بعد القبول`;

  if (isParcel) {
    text += `\n📦 <b>هاتف المستلم:</b> يظهر للسائق بعد القبول`;
  }
  
  if (tr.notes) {
    text += `\n📋 <b>ملاحظات:</b> ${tr.notes}`;
  }

  const appUrl = getAppUrl(hostUrl);
  
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🛵 التوجه للوحة السائق للقبول',
          url: `${appUrl}/driver/dashboard`
        }
      ]
    ]
  };

  await sendTelegramMessage(targetChannel, text, replyMarkup);
}

export async function notifyAdminOfRepayment(driver: any, amount: number, receiptImage: string, hostUrl?: string) {
  const adminAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '1480133486';
  
  if (!adminAdminChatId) return;

  const caption = `
💰 <b>طلب تسديد جديد من الكابتن!</b>
👤 السائق: <b>${driver.name}</b>
📱 الهاتف: ${driver.phone}

💵 المبلغ المُسدّد: <b>${amount.toLocaleString('en-US')} د.ع</b>
📊 الذمة المالية السابقة: ${driver.currentDebt.toLocaleString('en-US')} د.ع

⚠️ يرجى الدخول للوحة التحكم لمراجعة الوصل واعتماده أو رفضه.
  `.trim();

  const appUrl = getAppUrl(hostUrl);
  
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🛡️ الذهاب للوحة الإدارة (تسديدات)',
          url: `${appUrl}/admin/dashboard`
        }
      ]
    ]
  };

  if (receiptImage && receiptImage.startsWith('http')) {
    // If it's a valid remote URL, send natively via sendPhoto
    await sendTelegramPhoto(adminAdminChatId, receiptImage, caption, replyMarkup);
  } else if (receiptImage && receiptImage.startsWith('data:image/')) {
    // Note: Telegram API's sendPhoto URL field doesn't support raw base64 data URIs.
    // If it's base64, we fallback to sending standard message with a truncated prefix.
    const textBase = caption + `\n\n[ملاحظة: الوصل مرفوع כصورة Base64 ولا يمكن عرضه هنا. يرجى المراجعة من لوحة التحكم]`;
    await sendTelegramMessage(adminAdminChatId, textBase, replyMarkup);
  } else {
    const textBase = caption + `\n\n[لا يوجد وصل أو رابط غير صالح]`;
    await sendTelegramMessage(adminAdminChatId, textBase, replyMarkup);
  }
}

export async function notifyTransportCancellation(tr: any, hostUrl?: string) {
  const targetChannel = process.env.TELEGRAM_COURIERS_CHAT_ID || '@dizly7';
  if (!targetChannel) return;

  const isParcel = tr.type === 'PARCEL';
  const typeLabel = isParcel ? "📦 توصيل أمانة" : "🚕 توصيل مشوار (أشخاص)";
  
  let text = `
❌ <b>تم إلغاء الطلب من قبل الزبون</b>
🔖 النوع: <b>${typeLabel}</b>
🏷️ رقم المعرف: <code>TR-${tr.id.slice(-5)}</code>

تم إلغاء الطلب ولم يعد متوفراً للتوصيل.
`;

  await sendTelegramMessage(targetChannel, text.trim());
}

