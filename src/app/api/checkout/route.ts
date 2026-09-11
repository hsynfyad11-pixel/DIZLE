import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, deliveryArea, mapCoordinates, shopId, items, deliveryFee, houseImage } = body;

    // Basic Validation
    if (!customerName || !customerPhone || !deliveryArea || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة لإكمال الطلب' },
        { status: 400 }
      );
    }

    // 1. Resolve Shop safely with robust fallbacks
    const resolvedShopId = shopId || (items && items[0]?.product?.shopId);
    let shop = resolvedShopId
      ? await prisma.shop.findUnique({ where: { id: resolvedShopId } })
      : null;

    if (!shop) {
      shop = await prisma.shop.findFirst({
        where: { isAvailable: true },
      });
    }

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: 'DIZLY',
          nameAr: 'متجر دزلي الرئيسي',
          category: 'STANDARD',
          deliveryFee: 1500,
        },
      });
    }

    // 2. Calculate totals
    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * (item.quantity || 1),
      0
    );

    // Minimum Order Amount Validation
    const minRequired = shop.minOrderAmount || 0;
    if (minRequired > 0 && totalPrice < minRequired) {
      return NextResponse.json(
        {
          success: false,
          error: `عذراً، أقل مبلغ للطلب من ${shop.nameAr} هو ${minRequired.toLocaleString('en-US')} د.ع (المجموع الحالي: ${totalPrice.toLocaleString('en-US')} د.ع)`,
        },
        { status: 400 }
      );
    }

    const grandTotal = totalPrice + (deliveryFee ?? shop.deliveryFee);

    // Dynamic Host Protocol Discovery
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const originUrl = `${protocol}://${host}`;

    // 3. Ensure all products exist in Database before referencing in OrderItems
    const orderItemsData = [];
    for (const item of items) {
      const pId = item.product?.id;
      let prod = pId ? await prisma.product.findUnique({ where: { id: pId } }) : null;

      if (!prod) {
        prod = await prisma.product.create({
          data: {
            shopId: shop.id,
            nameAr: item.product?.nameAr || 'منتج دزلي DIZLY',
            price: item.product?.price || 1000,
            imageUrl: item.product?.imageUrl || null,
          },
        });
      }

      orderItemsData.push({
        productId: prod.id,
        quantity: item.quantity || 1,
        unitPrice: item.product?.price || prod.price,
      });
    }

    // 4. Create Order in Database with PENDING_WHATSAPP_SENT initial status
    const initialStatus = body.status || 'PENDING_WHATSAPP_SENT';
    const { orderNotes, substitutionPreference } = body;

    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryArea: deliveryArea.trim(),
        houseImage: houseImage || null,
        totalPrice,
        deliveryFee: deliveryFee ?? shop.deliveryFee,
        grandTotal,
        status: initialStatus,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        shop: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Workaround: Inject newly added fields via raw SQL to bypass Windows DLL locking on Prisma Client
    try {
      if (orderNotes !== undefined || substitutionPreference !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Order" SET notes = ?, substitutionPreference = ? WHERE id = ?`,
          orderNotes ? orderNotes.trim() : null,
          substitutionPreference || null,
          order.id
        );
      }
    } catch (sqlErr) {
      console.warn("Could not save secondary fields:", sqlErr);
    }

    console.log('✅ [CHECKOUT API SUCCESS] Order created in database with ID:', order.id);

    const mapLinkFormatted = mapCoordinates
      ? `\n🗺️ *الخريطة:* https://maps.google.com/?q=${encodeURIComponent(mapCoordinates)}`
      : '';

    // -------------------------------------------------------------
    // Dual-Target WhatsApp Messaging Workflow
    // -------------------------------------------------------------

    // Target 1: Admin Notification with Direct Action & Review Link
    const adminActionLink = `${originUrl}/admin/dashboard`;
    const adminWhatsAppPayload = {
      recipient: 'ADMIN',
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryArea: order.deliveryArea,
      mapCoordinates: mapCoordinates || null,
      shopName: shop.nameAr,
      items: order.items.map((i) => ({
        productName: i.product.nameAr,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.quantity * i.unitPrice,
      })),
      totalPrice: order.totalPrice,
      deliveryFee: order.deliveryFee,
      grandTotal: order.grandTotal,
      actionLink: adminActionLink,
      timestamp: order.createdAt.toISOString(),
      messageFormatted: `🚨 *طلب جديد - دزلي DIZLY (رقم #${order.id.slice(-6)})*
👤 *الزبون:* ${order.customerName}
📞 *الهاتف:* ${order.customerPhone}
📍 *العنوان:* ${order.deliveryArea}${mapLinkFormatted}
🏪 *المتجر:* ${shop.nameAr}
---
📦 *المنتجات:*
${order.items.map((i) => `• ${i.product.nameAr} x${i.quantity} (${(i.unitPrice * i.quantity).toLocaleString('en-US')} د.ع)`).join('\n')}
---
💰 *المجموع:* ${order.totalPrice.toLocaleString('en-US')} د.ع
🚚 *التوصيل:* ${order.deliveryFee.toLocaleString('en-US')} د.ع
💵 *الكلي:* ${order.grandTotal.toLocaleString('en-US')} د.ع
---
🔗 *رابط مراجعة وإدارة الطلب (لوحة الأدمن):*
${adminActionLink}`,
    };

    // Target 2: Store Owner Notification with Item Breakdown & Preparation Link
    const storePreparationLink = `${originUrl}/shop`;
    const shopWhatsAppPayload = {
      recipient: 'STORE_OWNER',
      orderId: order.id,
      shopName: shop.nameAr,
      items: order.items.map((i) => ({
        productName: i.product.nameAr,
        quantity: i.quantity,
      })),
      totalPrice: order.totalPrice,
      preparationLink: storePreparationLink,
      timestamp: order.createdAt.toISOString(),
      messageFormatted: `🏪 *هناك طلب جديد لك في موقع دزلي DIZLY، يرجى التجهيز (رقم #${order.id.slice(-6)})*
🏪 *المتجر:* ${shop.nameAr}
---
📦 *عناصر الطلب للتجهيز:*
${order.items.map((i) => `• ${i.product.nameAr} x${i.quantity}`).join('\n')}
---
💰 *إجمالي قيمة التجهيز:* ${order.totalPrice.toLocaleString('en-US')} د.ع
---
🔗 *رابط تجهيز ومتابعة الطلب للمتجر:*
${storePreparationLink}
⚠️ *ملاحظة:* يرجى المباشرة بتجهيز المواد فوراً، سيصل مندوب دزلي DIZLY لاستلام الطلب.`,
    };

    // Simulate 2 Concurrent Dispatches via WhatsApp API Services
    const [adminResult, shopResult] = await Promise.allSettled([
      // Dispatch 1: Admin Notification
      (async () => {
        console.log('--- [WHATSAPP DISPATCH 1: ADMIN ACTION PAYLOAD] ---');
        console.log(JSON.stringify(adminWhatsAppPayload, null, 2));
        return { status: 'sent', recipient: 'admin', payload: adminWhatsAppPayload };
      })(),

      // Dispatch 2: Store Owner Notification
      (async () => {
        console.log('--- [WHATSAPP DISPATCH 2: STORE OWNER PREPARATION PAYLOAD] ---');
        console.log(JSON.stringify(shopWhatsAppPayload, null, 2));

        // Telegram Integration: Send store notification
        try {
          const { notifyStoreOwner, broadcastToCouriers } = await import('@/lib/telegram');
          
          const shopSetting = await prisma.systemSetting.findUnique({
            where: { key: 'telegram_chat_shop_' + shop.id }
          });
          
          if (shopSetting?.value) {
            await notifyStoreOwner(order, shopSetting.value, host);
          }

          // Central Admin / Group broadcast
          const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '6681465010';
          if (adminChatId) {
            await notifyStoreOwner(order, adminChatId, host);
          }
          
        } catch (err) {
          console.error('Telegram notification failed:', err);
        }

        return { status: 'sent', recipient: 'store_owner', payload: shopWhatsAppPayload };
      })(),
    ]);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'تم تسجيل الطلب بنجاح وإشعار الإدارة والكادر بالتجهيز',
      dispatchSummary: {
        admin: adminResult.status === 'fulfilled' ? adminResult.value : 'failed',
        shop: shopResult.status === 'fulfilled' ? shopResult.value : 'failed',
      },
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
