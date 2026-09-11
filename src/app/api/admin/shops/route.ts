import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all shops for admin management
export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
      ],
      include: {
        products: true,
      },
    });

    return NextResponse.json({ success: true, shops });
  } catch (error) {
    console.error('Error fetching admin shops:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المتاجر' },
      { status: 500 }
    );
  }
}

// POST create or update shop details (including logo/imageUrl)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, nameAr, description, category, deliveryFee, imageUrl, isFeatured, isAvailable } = body;

    if (!nameAr || !nameAr.trim()) {
      return NextResponse.json(
        { success: false, error: 'اسم المتجر بالعربية مطلوب' },
        { status: 400 }
      );
    }

    let shop;
    if (id) {
      // Fetch existing to prevent overwriting missing fields in strict toggles
      const existing = await prisma.shop.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'المتجر غير موجود' }, { status: 404 });
      }

      // Update existing shop
      shop = await prisma.shop.update({
        where: { id },
        data: {
          nameAr: nameAr ? nameAr.trim() : existing.nameAr,
          name: nameAr ? nameAr.trim() : existing.name,
          description: description !== undefined ? (description?.trim() || null) : existing.description,
          category: category !== undefined ? category : existing.category,
          deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : existing.deliveryFee,
          imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : existing.imageUrl,
          isFeatured: typeof isFeatured === 'boolean' ? isFeatured : existing.isFeatured,
          isAvailable: typeof isAvailable === 'boolean' ? isAvailable : existing.isAvailable,
        },
      });
    } else {
      // Create new shop
      shop = await prisma.shop.create({
        data: {
          nameAr: nameAr.trim(),
          name: nameAr.trim(),
          description: description?.trim() || null,
          category: category || 'STANDARD',
          deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : 1500,
          imageUrl: imageUrl?.trim() || null,
          isFeatured: typeof isFeatured === 'boolean' ? isFeatured : true,
          isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      shop,
      message: id ? 'تم تحديث بيانات وشعار المتجر بنجاح' : 'تم إضافة المتجر والشعار بنجاح',
    });
  } catch (error) {
    console.error('Error saving shop:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حفظ بيانات وشعار المتجر' },
      { status: 500 }
    );
  }
}

// DELETE Shop and cascade cleanup all associated products and orders
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const force = searchParams.get('force');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرّف المتجر مطلوب للحذف' },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        }
      },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على المتجر' },
        { status: 404 }
      );
    }

    if (shop._count.orders > 0 && force !== 'true') {
      return NextResponse.json(
        { 
          success: false, 
          error: `لا يمكن حذف المتجر (${shop.nameAr}) بطريقة عادية لوجود ${shop._count.orders} طلب/طلبات سابقة مرتبطة به في النظام. يرجى إيقاف تشغيله (تعطيله) بدلاً من حذفه للمحافظة على سجل الأرباح، أو استخدم خيار (الحذف الإجباري).`,
          requiresForce: true
        },
        { status: 400 } // keep 400 to trigger alert on client side, client can re-request with force=true
      );
    }

    if (force === 'true') {
      // First, manually cascade delete the associated orders since the schema relation lacks Cascade 
      await prisma.order.deleteMany({
        where: { shopId: id },
      });
    }

    await prisma.shop.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: force === 'true' 
        ? `تم حذف المتجر "${shop.nameAr}" وجميع منتجاته وطلباته (${shop._count.orders} طلب) بنجاح`
        : `تم حذف المتجر "${shop.nameAr}" وجميع منتجاته بنجاح`,
    });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف المتجر. قد يكون هناك بيانات أخرى مرتبطة به تمنع الحذف.' },
      { status: 500 }
    );
  }
}
