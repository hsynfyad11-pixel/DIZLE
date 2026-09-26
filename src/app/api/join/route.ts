import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      ownerName,
      name,
      phone,
      shopName,
      area,
      mapCoordinates,
      storeFrontImage,
      vehicle,
      vehicleImage,
      vehiclePlateImage,
      minOrderAmount,
      notes,
      pinCode,
    } = body;

    // التحقق من الحقول الأساسية
    if (!phone || (!ownerName && !name)) {
      return NextResponse.json(
        { success: false, error: 'يرجى ملء الحقول الإجبارية الأساسية (الاسم ورقم الهاتف)' },
        { status: 400 }
      );
    }

    const applicantName = ownerName || name;

    // حفظ الطلب في جدول JoinRequest لكي يظهر فوراً في لوحة تحكم الأدمن
    await prisma.joinRequest.create({
      data: {
        type: type || 'SHOP',
        name: applicantName,
        ownerName: applicantName,
        phone: phone,
        shopName: type === 'SHOP' ? shopName : null,
        area: type === 'SHOP' ? area : null,
        mapCoordinates: mapCoordinates || null,
        storeFrontImage: storeFrontImage || null,
        vehicle: type === 'DRIVER' ? vehicle : null,
        vehicleImage: vehicleImage || null,
        vehiclePlateImage: vehiclePlateImage || null,
        minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : 15000,
        notes: notes || '',
        status: 'PENDING', // معلق لكي يظهر في لوحة الأدمن
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح، سيتم مراجعته وتفعيل حسابك من قبل الإدارة قريباً.',
    });
  } catch (error) {
    console.error('API Join Error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم أثناء حفظ البيانات، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}