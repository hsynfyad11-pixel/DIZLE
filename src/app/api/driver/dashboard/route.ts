import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول ككابتن توصيل.' },
        { status: 401 }
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

    const currentDebt = typeof driver.currentDebt === 'number' ? driver.currentDebt : Number(driver.currentDebt) || 0;
    const maxCreditLimit = typeof driver.maxCreditLimit === 'number' ? driver.maxCreditLimit : Number(driver.maxCreditLimit) || 50000;
    const isBlocked = currentDebt >= maxCreditLimit;

    // Fetch active assigned orders for this driver
    const activeOrders = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['COURIER_ASSIGNED', 'ON_THE_WAY'] },
      },
      include: {
        shop: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch completed order history for this driver
    const completedOrders = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: 'DELIVERED',
      },
      include: {
        shop: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    // Fetch unassigned orders available for pickup if driver is not blocked
    const availableOrders = !isBlocked
      ? await prisma.order.findMany({
          where: {
            driverId: null,
            status: 'AWAITING_COURIER',
          },
          include: {
            shop: true,
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const activeTransportRaw = await prisma.transportRequest.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['ACCEPTED', 'NEGOTIATING'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeTransport = activeTransportRaw.map(req => {
      if (req.status === 'NEGOTIATING') {
        return {
          ...req,
          customerPhone: 'يظهر للقبول',
          recipientPhone: req.recipientPhone ? 'يظهر للقبول' : null,
        };
      }
      return req;
    });

    const completedTransport = await prisma.transportRequest.findMany({
      where: {
        driverId: driver.id,
        status: 'COMPLETED',
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    const availableTransportRaw = !isBlocked
      ? await prisma.transportRequest.findMany({
          where: {
            driverId: null,
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const availableTransport = availableTransportRaw.map(req => ({
      ...req,
      customerPhone: 'يظهر بعد القبول',
      recipientPhone: req.recipientPhone ? 'يظهر بعد القبول' : null,
    }));

    return NextResponse.json({
      success: true,
      driver: {
        ...driver,
        isBlocked,
      },
      activeOrders,
      completedOrders,
      availableOrders,
      activeTransport,
      completedTransport,
      availableTransport,
    });
  } catch (error) {
    console.error('Error fetching driver dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب بيانات السائق' },
      { status: 500 }
    );
  }
}
