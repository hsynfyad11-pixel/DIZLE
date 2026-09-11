import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId, nameAr, description, deliveryFee, minOrderAmount, imageUrl, phone, areaName, isAvailable, password } = body;

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'معرّف المتجر مطلوب' },
        { status: 400 }
      );
    }

    let updatedShop;
    
    // 1. Immediately apply isAvailable if provided
    if (typeof isAvailable === 'boolean') {
      updatedShop = await prisma.shop.update({
        where: { id: shopId },
        data: { isAvailable },
      });
    }

    // 2. Put profile changes in a pending ProfileUpdateRequest
    const profileData = {
      ...(nameAr && nameAr.trim() ? { nameAr: nameAr.trim(), name: nameAr.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      ...(areaName !== undefined ? { areaName: areaName?.trim() || null } : {}),
      ...(typeof deliveryFee === 'number' ? { deliveryFee } : {}),
      ...(typeof minOrderAmount === 'number' ? { minOrderAmount } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl?.trim() || null } : {}),
      ...(password && password.trim() ? { password: password.trim() } : {}),
    };

    if (Object.keys(profileData).length > 0) {
      await prisma.profileUpdateRequest.create({
        data: {
          entityId: shopId,
          entityType: 'SHOP',
          requestedData: JSON.stringify(profileData),
          status: 'PENDING',
        }
      });
    }

    return NextResponse.json({
      success: true,
      shop: updatedShop,
      message: 'تم إرسال التحديثات لمدير النظام وبانتظار الموافقة.',
    });
  } catch (error) {
    console.error('Error updating shop settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث إعدادات وشعار المتجر' },
      { status: 500 }
    );
  }
}
