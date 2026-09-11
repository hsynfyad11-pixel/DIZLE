import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all join requests
export async function GET() {
  try {
    const requests = await prisma.joinRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching admin join requests:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب طلبات الانضمام' },
      { status: 500 }
    );
  }
}

// PATCH approve / reject join request
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'معرّف الطلب والإجراء المطلوبين' },
        { status: 400 }
      );
    }

    const joinReq = await prisma.joinRequest.findUnique({
      where: { id },
    });

    if (!joinReq) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على الطلب' },
        { status: 404 }
      );
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updatedReq = await prisma.joinRequest.update({
      where: { id },
      data: { status: newStatus },
    });

    // If APPROVED and type === 'SHOP', automatically create the Shop record in DB!
    if (action === 'APPROVE' && joinReq.type === 'SHOP') {
      const existingShop = await prisma.shop.findFirst({
        where: { nameAr: joinReq.shopName || joinReq.name },
      });

      if (!existingShop) {
        const pinReq = await prisma.systemSetting.findUnique({ where: { key: `joinReq_pin_${joinReq.id}` } });
        const newShop = await prisma.shop.create({
          data: {
            name: joinReq.shopName || joinReq.name,
            nameAr: joinReq.shopName || `متجر ${joinReq.name}`,
            phone: joinReq.phone,
            password: pinReq?.value || null,
            description: `متجر شريك في DIZLY - منطقة ${joinReq.area || ''}`,
            category: 'STANDARD',
            areaName: joinReq.area,
            minOrderAmount: joinReq.minOrderAmount || 15000,
            deliveryFee: 1500,
            rating: 5.0,
            imageUrl: joinReq.storeFrontImage || null,
            isAvailable: true,
          },
        });
      }
    } else if (action === 'APPROVE' && joinReq.type === 'DRIVER') {
      const existingDriver = await prisma.driver.findFirst({
        where: { phone: joinReq.phone },
      });

      if (!existingDriver) {
        const pinReq = await prisma.systemSetting.findUnique({ where: { key: `joinReq_pin_${joinReq.id}` } });
        await prisma.driver.create({
          data: {
            name: joinReq.name,
            phone: joinReq.phone,
            vehicle: (joinReq as any).vehicle || 'دراجة نارية',
            vehicleImage: (joinReq as any).vehicleImage || null,
            vehiclePlateImage: (joinReq as any).vehiclePlateImage || null,
            pinCode: pinReq?.value || '123456',
            isAvailable: true,
          } as any, // Cast entire data object to bypass strict type check for now
        });
      }
    }

    // Get password logic for frontend Whatsapp link
    let returnedPassword = '';
    const pinReq = await prisma.systemSetting.findUnique({ where: { key: `joinReq_pin_${joinReq.id}` } });
    if (pinReq) {
      returnedPassword = pinReq.value;
    } else {
      returnedPassword = joinReq.type === 'DRIVER' ? '123456' : 'تواصل مع الإدارة لمعرفة الرمز';
    }

    return NextResponse.json({
      success: true,
      request: updatedReq,
      entityType: joinReq.type,
      entityPassword: returnedPassword,
      message: action === 'APPROVE' ? 'تم قبول الطلب وإنشاء الحساب في النظام!' : 'تم رفض الطلب',
    });
  } catch (error) {
    console.error('Error updating join request:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
