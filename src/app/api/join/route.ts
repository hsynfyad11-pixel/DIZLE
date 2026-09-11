import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = 'SHOP',
      ownerName,
      name,
      shopName,
      phone,
      area,
      mapCoordinates,
      storeFrontImage,
      minOrderAmount,
      notes,
      pinCode,
      vehicle,
      vehicleImage,
      vehiclePlateImage,
    } = body;

    const applicantName = ownerName || name;
    const targetShopName = shopName || name;

    if (!applicantName || !phone || (type === 'SHOP' && !area)) {
      return NextResponse.json(
        { success: false, error: 'اسم صاحب الطلب، رقم الهاتف، والموقع (للمتجر) حقول مطلوبة' },
        { status: 400 }
      );
    }

    const parsedMinOrderAmount = minOrderAmount ? parseInt(minOrderAmount, 10) : undefined;

    const joinReq = await prisma.joinRequest.create({
      data: {
        type: type === 'DRIVER' ? 'DRIVER' : 'SHOP',
        name: applicantName,
        ownerName: applicantName,
        phone: phone.trim(),
        shopName: type === 'SHOP' ? targetShopName : null,
        area: area ? area.trim() : null,
        mapCoordinates: mapCoordinates ? mapCoordinates.trim() : null,
        storeFrontImage: storeFrontImage ? storeFrontImage.trim() : null,
        vehicle: vehicle ? vehicle.trim() : null,
        vehicleImage: vehicleImage ? vehicleImage.trim() : null,
        vehiclePlateImage: vehiclePlateImage ? vehiclePlateImage.trim() : null,
        minOrderAmount: isNaN(parsedMinOrderAmount!) ? null : parsedMinOrderAmount,
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
      },
    });

    if (pinCode) {
      await prisma.systemSetting.create({
        data: {
          key: `joinReq_pin_${joinReq.id}`,
          value: pinCode
        }
      });
    }

    return NextResponse.json({
      success: true,
      requestId: joinReq.id,
      message: 'تم إرسال طلبك بنجاح، سيتم مراجعته وتفعيل حسابك من قبل الإدارة قريباً.',
    });
  } catch (error) {
    console.error('Error submitting join request:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إرسال طلب الانضمام' },
      { status: 500 }
    );
  }
}
