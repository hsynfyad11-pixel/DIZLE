import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// Add or Edit Product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[SHOP PRODUCT API] Received body:', body);

    const { id, shopId, name, nameAr, category, price, description, imageUrl, isAvailable } = body;

    if (!shopId) {
      console.log('[SHOP PRODUCT API] Missing shopId!');
      return NextResponse.json({ success: false, error: 'معرف المتجر مفقود' }, { status: 400 });
    }
    if (!nameAr) {
      console.log('[SHOP PRODUCT API] Missing nameAr!');
      return NextResponse.json({ success: false, error: 'اسم المنتج مطلوب' }, { status: 400 });
    }
    if (price === undefined || price === null || isNaN(Number(price))) {
      console.log('[SHOP PRODUCT API] Invalid price:', price);
      return NextResponse.json({ success: false, error: 'السعر غير صالح' }, { status: 400 });
    }
    if (!category || !String(category).trim()) {
      console.log('[SHOP PRODUCT API] Invalid category:', category);
      return NextResponse.json({ success: false, error: 'الفئة مطلوبة' }, { status: 400 });
    }

    if (id) {
      // Update existing product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          nameAr,
          name: name || nameAr,
          category: category.trim(),
          price: Number(price),
          description,
          imageUrl,
          isAvailable: isAvailable ?? true,
        },
      });
      return NextResponse.json({ success: true, product: updatedProduct });
    } else {
      // Create new product
      const newProduct = await prisma.product.create({
        data: {
          shopId,
          nameAr,
          name: name || nameAr,
          category: category.trim(),
          price: Number(price),
          description,
          imageUrl,
          isAvailable: isAvailable ?? true,
        },
      });
      return NextResponse.json({ success: true, product: newProduct });
    }
  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حفظ المنتج' },
      { status: 500 }
    );
  }
}

// Delete Product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرّف المنتج مطلوب للحذف' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
}
