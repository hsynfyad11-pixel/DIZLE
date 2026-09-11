import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { targetType, id, isAvailable } = body; // targetType: 'SHOP' | 'DRIVER'

    if (!targetType || !id || isAvailable === undefined) {
      return NextResponse.json(
        { success: false, error: 'بيانات التجميد/التفعيل غير مكتملة' },
        { status: 400 }
      );
    }

    if (targetType === 'SHOP') {
      const updatedShop = await prisma.shop.update({
        where: { id },
        data: { isAvailable },
      });
      return NextResponse.json({
        success: true,
        entity: updatedShop,
        message: isAvailable ? 'تم تفعيل حساب المتجر بنجاح' : 'تم إيقاف/تجميد حساب المتجر بنجاح',
      });
    } else {
      const updatedDriver = await prisma.driver.update({
        where: { id },
        data: { isAvailable },
      });
      return NextResponse.json({
        success: true,
        entity: updatedDriver,
        message: isAvailable ? 'تم تفعيل حساب السائق بنجاح' : 'تم إيقاف/تجميد حساب السائق بنجاح',
      });
    }
  } catch (error) {
    console.error('Error toggling entity status:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تعديل حالة الحساب' },
      { status: 500 }
    );
  }
}
