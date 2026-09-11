import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('id');

    if (!shopId) {
      return NextResponse.json({ success: false, error: 'Shop ID required' }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { minOrderAmount: true, nameAr: true, deliveryFee: true }
    });

    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, shop });
  } catch (error) {
    console.error('Error fetching shop info:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
