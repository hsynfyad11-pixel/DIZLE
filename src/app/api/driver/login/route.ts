import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        phone: phone,
      }
    });

    if (!driver) {
      console.log(`[DRIVER LOGIN DEBUG] Driver not found for phone: ${phone}`);
      return NextResponse.json({ success: false, error: 'حساب غير موجود' }, { status: 401 });
    }

    console.log(`[DRIVER LOGIN DEBUG] Driver ID: ${driver.id} | DB PinCode: "${driver.pinCode}"`);

    const cleanInputPassword = password.trim();
    const dbPassword = driver.pinCode ? String(driver.pinCode).trim() : '123456';

    if (dbPassword !== cleanInputPassword) {
      console.log(`[DRIVER LOGIN DEBUG] PinCode mismatch: "${dbPassword}" !== "${cleanInputPassword}"`);
      return NextResponse.json({ success: false, error: 'كلمة المرور (Pin Code) غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      driverId: driver.id
    });
  } catch (error) {
    console.error('Driver login error:', error);
    return NextResponse.json({ success: false, error: 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
