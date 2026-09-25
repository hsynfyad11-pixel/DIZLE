import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      ownerName,
      phone,
      shopName,
      area,
      minOrderAmount,
      notes,
      pinCode,
    } = body;

    if (!ownerName || !phone || !pinCode) {
      return NextResponse.json(
        { success: false, error: 'يرجى ملء الحقول الإجبارية الأساسية' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(pinCode, 10);

    if (type === 'SHOP') {
      if (!shopName || !area) {
        return NextResponse.json(
          { success: false, error: 'اسم المتجر والمنطقة حقول إجبارية للمتاجر' },
          { status: 400 }
        );
      }

      await db.shop.create({
        data: {
          name: shopName,
          nameAr: shopName,
          phone: phone,
          password: hashedPassword,
          description: notes || '',
          category: 'STANDARD',
          deliveryFee: 1500,
          minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : 15000,
          areaName: area,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح، سيتم مراجعته وتفعيل حسابك من قبل الإدارة قريباً.',
    });
  } catch (error) {
    console.error('API Join Error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم أثناء حفظ البيانات، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}