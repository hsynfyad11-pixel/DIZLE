import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [shops, drivers] = await Promise.all([
      prisma.shop.findMany({
        include: {
          products: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ success: true, shops, drivers });
  } catch (error) {
    console.error('Error fetching admin directory:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب دليل المتاجر والسائقين' },
      { status: 500 }
    );
  }
}
