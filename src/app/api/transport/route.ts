import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastTransportToCouriers } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { type, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, notes, customerPhone, recipientPhone } = await req.json();

    if (!type || !pickupLocation || !dropoffLocation || !customerPhone) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    let pickupLat = null, pickupLng = null;
    if (pickupCoords && typeof pickupCoords === 'string' && pickupCoords.includes(',')) {
      const parts = pickupCoords.split(',');
      pickupLat = parseFloat(parts[0].trim());
      pickupLng = parseFloat(parts[1].trim());
    }

    let dropoffLat = null, dropoffLng = null;
    if (dropoffCoords && typeof dropoffCoords === 'string' && dropoffCoords.includes(',')) {
      const parts = dropoffCoords.split(',');
      dropoffLat = parseFloat(parts[0].trim());
      dropoffLng = parseFloat(parts[1].trim());
    }

    const transportReq = await prisma.transportRequest.create({
      data: {
        type,
        pickupLocation,
        pickupLat,
        pickupLng,
        dropoffLocation,
        dropoffLat,
        dropoffLng,
        notes,
        customerPhone,
        recipientPhone,
        status: 'PENDING',
      },
    });

    // Notify drivers via Telegram
    try {
      const host = req.headers.get('host') || null;
      await broadcastTransportToCouriers(transportReq, host ?? undefined);
    } catch (tgError) {
      console.error('Failed to send Telegram broadcast for transport:', tgError);
    }

    return NextResponse.json({ success: true, transportRequest: transportReq });
  } catch (error) {
    console.error('Transport request error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
