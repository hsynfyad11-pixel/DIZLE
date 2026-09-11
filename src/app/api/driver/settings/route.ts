import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, name, phone, vehicle, vehicleImage, vehiclePlateImage, password, isAvailable } = body;

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'معرّف المندوب مطلوب' },
        { status: 400 }
      );
    }

    let updatedDriver;

    // 1. Immediately apply isAvailable if provided
    if (typeof isAvailable === 'boolean') {
      updatedDriver = await prisma.driver.update({
        where: { id: driverId },
        data: { isAvailable },
      });
    }

    // 2. Put profile changes in a pending ProfileUpdateRequest
    const profileData = {
      ...(name && name.trim() ? { name: name.trim() } : {}),
      ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
      ...(vehicle !== undefined ? { vehicle: vehicle?.trim() || null } : {}),
      ...(vehicleImage !== undefined ? { vehicleImage: vehicleImage?.trim() || null } : {}),
      ...(vehiclePlateImage !== undefined ? { vehiclePlateImage: vehiclePlateImage?.trim() || null } : {}),
      ...(password && password.trim() ? { password: password.trim() } : {}),
    };

    if (Object.keys(profileData).length > 0) {
      await prisma.profileUpdateRequest.create({
        data: {
          entityId: driverId,
          entityType: 'DRIVER',
          requestedData: JSON.stringify(profileData),
          status: 'PENDING',
        }
      });
    }

    return NextResponse.json({
      success: true,
      driver: updatedDriver,
      message: 'تم إرسال التحديثات لمدير النظام وبانتظار الموافقة.',
    });
  } catch (error) {
    console.error('Error updating driver settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تقديم طلب التحديث' },
      { status: 500 }
    );
  }
}
