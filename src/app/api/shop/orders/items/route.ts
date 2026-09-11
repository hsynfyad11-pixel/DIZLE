import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Trigger WhatsApp Notification for Order Updates
async function sendWhatsAppNotification(phone: string, storeName: string, orderId: string, originalName: string, altName: string) {
  const message = `مرحباً بك، نعتذر منك لعدم توفر منتج (${originalName}) في طلبك رقم ${orderId.slice(-6)} من متجر ${storeName}.\nالاقترح البديل من المتجر: (${altName}).\nيرجى مراجعة الطلب والموافقة عليه أو تعديله خلال ساعة عبر الموقع لكي لا يتم إلغاء الطلب تلقائياً.`;
  
  // Pluggable logic for UltraMsg, Twilio, or Meta Cloud API
  const WA_API_URL = process.env.WHATSAPP_API_URL;
  const WA_TOKEN = process.env.WHATSAPP_API_TOKEN;
  
  if (WA_API_URL && WA_TOKEN) {
    try {
      await fetch(WA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: WA_TOKEN,
          to: phone,
          body: message
        })
      });
      console.log('✅ Real WhatsApp Notification Dispatched via API');
    } catch (e) {
      console.error('Failed to send WhatsApp message via API:', e);
    }
  } else {
    // Simulator feedback for the dashboard / system logs
    console.log('--- [WHATSAPP DISPATCH TO CUSTOMER SIMULATOR] ---');
    console.log(`TO: ${phone}`);
    console.log(`MESSAGE: ${message}`);
    console.log('---------------------------------------------------');
  }
}

export async function PATCH(request: Request) {
  try {
    const { itemId, altProductName, altUnitPrice } = await request.json();
    if (!itemId) {
      return NextResponse.json({ success: false, error: 'رقم العنصر مطلوب' }, { status: 400 });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status: 'OUT_OF_STOCK_HAS_ALTERNATIVE',
        altProductName,
        altUnitPrice: altUnitPrice ? Number(altUnitPrice) : null,
      },
      include: { product: true }
    });

    // Also update order status
    const updatedOrder = await prisma.order.update({
      where: { id: updatedItem.orderId },
      data: { status: 'PENDING_CUSTOMER_APPROVAL' },
      include: { shop: true }
    });

    // Generate WhatsApp / Backend Notification Trigger Logic
    await sendWhatsAppNotification(updatedOrder.customerPhone, updatedOrder.shop.nameAr, updatedOrder.id, updatedItem.product.nameAr, altProductName);

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error('Error suggesting alternative:', err);
    return NextResponse.json({ success: false, error: 'فشل في اقتراح البديل' }, { status: 500 });
  }
}
