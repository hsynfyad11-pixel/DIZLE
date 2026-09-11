import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { id: true, status: true, grandTotal: true },
        },
      },
    });

    const driversWithStats = drivers.map((d) => {
      const deliveredCount = d.orders.filter((o) => o.status === 'DELIVERED').length;
      const isBlocked = d.currentDebt >= d.maxCreditLimit;
      return {
        ...d,
        deliveredCount,
        isBlocked,
      };
    });

    return NextResponse.json({ success: true, drivers: driversWithStats });
  } catch (error) {
    console.error('Error fetching admin drivers:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب قائمة السائقين' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { driverId, action, maxCreditLimit, currentDebt } = body;

    if (!driverId || !action) {
      return NextResponse.json(
        { success: false, error: 'معرّف السائق والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json(
        { success: false, error: 'السائق غير موجود' },
        { status: 404 }
      );
    }

    let updatedDriver;

    if (action === 'SET_CREDIT_LIMIT') {
      if (typeof maxCreditLimit !== 'number' || maxCreditLimit < 0) {
        return NextResponse.json(
          { success: false, error: 'رنج الدين المسموح به غير صالح' },
          { status: 400 }
        );
      }

      updatedDriver = await prisma.driver.update({
        where: { id: driverId },
        data: { maxCreditLimit },
      });

      return NextResponse.json({
        success: true,
        driver: updatedDriver,
        message: `تم تحديث رنج الدين المسموح به للسائق (${driver.name}) إلى ${maxCreditLimit.toLocaleString('en-US')} د.ع`,
      });
    }

    if (action === 'RESET_DEBT') {
      updatedDriver = await prisma.driver.update({
        where: { id: driverId },
        data: { currentDebt: 0 },
      });

      return NextResponse.json({
        success: true,
        driver: updatedDriver,
        message: `تمت تصفية ديون السائق (${driver.name}) وتعديل الذمة المالية إلى 0 د.ع بنجاح 🟢`,
      });
    }

    if (action === 'SET_DEBT') {
      if (typeof currentDebt !== 'number' || currentDebt < 0) {
        return NextResponse.json(
          { success: false, error: 'مبلغ الدين غير صالح' },
          { status: 400 }
        );
      }

      updatedDriver = await prisma.driver.update({
        where: { id: driverId },
        data: { currentDebt },
      });

      return NextResponse.json({
        success: true,
        driver: updatedDriver,
        message: `تم تعديل دين السائق (${driver.name}) إلى ${currentDebt.toLocaleString('en-US')} د.ع`,
      });
    }

    if (action === 'TOGGLE_STATUS') {
      const newStatus = typeof body.isAvailable === 'boolean' ? body.isAvailable : !driver.isAvailable;
      updatedDriver = await prisma.driver.update({
        where: { id: driverId },
        data: { isAvailable: newStatus },
      });
      return NextResponse.json({
        success: true,
        driver: updatedDriver,
        message: `تم ${newStatus ? 'تفعيل' : 'إيقاف'} الكابتن ${driver.name} بنجاح`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating driver financial controls:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تعديل بيانات السائق المالية' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'المعرف مطلوب' }, { status: 400 });
    }

    // Safely cleanup relational data before deleting the driver
    await prisma.$transaction([
      // Unlink from orders
      prisma.order.updateMany({
        where: { driverId: id },
        data: { driverId: null },
      }),
      // Unlink from transport requests
      prisma.transportRequest.updateMany({
        where: { driverId: id },
        data: { driverId: null },
      }),
      // Delete their repayment requests
      prisma.repaymentRequest.deleteMany({
        where: { driverId: id },
      }),
      // Finally, delete the driver
      prisma.driver.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'تم حذف الكابتن بنجاح' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء حذف السائق بسبب ارتباطات في النظام' }, { status: 500 });
  }
}
