import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const shops = await prisma.shop.findMany({
      where: { phone: phone },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[SHOP LOGIN DEBUG] Phone: ${phone} | Input Password: "${password}"`);
    console.log(`[SHOP LOGIN DEBUG] DB Found ${shops.length} shop(s).`);

    // Clean input password
    const cleanInputPassword = password.trim();

    // Since a user might create multiple test stores with the same phone, find the exact one that matches the password they provided
    const validShop = shops.find(s => {
      // @ts-ignore
      const dbPassword = s.password ? String(s.password).trim() : 'password123';
      console.log(`[SHOP LOGIN DEBUG] Checking Shop ID: ${s.id} | DB Password: "${dbPassword}" | Match: ${dbPassword === cleanInputPassword}`);
      return dbPassword === cleanInputPassword;
    });

    if (!validShop) {
      return NextResponse.json({ success: false, error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      shopId: validShop.id
    });
  } catch (error) {
    console.error('Shop login error:', error);
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
