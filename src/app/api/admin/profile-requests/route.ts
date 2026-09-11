import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const requests = await prisma.profileUpdateRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    
    // Enrich with old data
    const enriched = await Promise.all(requests.map(async req => {
      let oldData = null;
      if (req.entityType === 'SHOP') {
        const shop = await prisma.shop.findUnique({ where: { id: req.entityId } });
        if (shop) oldData = { nameAr: shop.nameAr, phone: shop.phone, description: shop.description, areaName: shop.areaName, imageUrl: shop.imageUrl, deliveryFee: shop.deliveryFee, minOrderAmount: shop.minOrderAmount };
      } else {
        const driver = await prisma.driver.findUnique({ where: { id: req.entityId } });
        if (driver) oldData = { name: driver.name, phone: driver.phone, vehicle: driver.vehicle };
      }
      return { ...req, oldData, requestedDataParsed: JSON.parse(req.requestedData) };
    }));

    return NextResponse.json({ success: true, requests: enriched });
  } catch (error) {
    console.error('Error fetching profile requests:', error);
    return NextResponse.json({ success: false, error: 'فشل جلب الطلبات' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // APPROVE or REJECT

    const req = await prisma.profileUpdateRequest.findUnique({ where: { id } });
    if (!req) return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });

    if (action === 'APPROVE') {
      const parsedData = JSON.parse(req.requestedData);
      
      if (req.entityType === 'SHOP') {
        // Extract password if provided
        const { password, ...restData } = parsedData;
        await prisma.shop.update({
          where: { id: req.entityId },
          data: restData,
        });

        if (password && password.trim() !== '') {
          // If shop password updated, we also update it in the shop model (or however they login)
          // Wait, Shop has `password` field in prisma right?
          const shop = await prisma.shop.update({
            where: { id: req.entityId },
            data: { password: password.trim() }
          });
        }
      } else if (req.entityType === 'DRIVER') {
        const { password, ...restData } = parsedData;
        await prisma.driver.update({
          where: { id: req.entityId },
          data: restData, // name, phone, vehicle, etc.
        });

        if (password && password.trim() !== '') {
          await prisma.driver.update({
            where: { id: req.entityId },
            data: { pinCode: password.trim() }
          });
        }
      }
    }

    await prisma.profileUpdateRequest.update({
      where: { id },
      data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }
    });

    return NextResponse.json({ success: true, message: action === 'APPROVE' ? 'تم اعتماد البيانات الجديدة' : 'تم رفض التغييرات' });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}
