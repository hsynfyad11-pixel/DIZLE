import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    // Rule: Shop queries explicitly include their related products to prevent empty screens
    const shops = await prisma.shop.findMany({
      where: {
        isAvailable: true,
        ...(category && category !== 'ALL' ? { category: category as any } : {}),
        ...(featured === 'true' ? { isFeatured: true } : featured === 'false' ? { isFeatured: false } : {}),
      },
      include: {
        products: {
          where: {
            isAvailable: true,
          }
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, shops: shops });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب قائمة المتاجر' },
      { status: 500 }
    );
  }
}
