import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyTransportCancellation } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing request ID' }, { status: 400 });
    }

    const transportReq = await prisma.transportRequest.findUnique({
      where: { id }
    });

    if (!transportReq) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (transportReq.status === 'COMPLETED' || transportReq.status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: 'Cannot cancel this request' }, { status: 400 });
    }

    const updated = await prisma.transportRequest.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Notify drivers via Telegram
    try {
      const host = req.headers.get('host') || null;
      await notifyTransportCancellation(updated, host ?? undefined);
    } catch (tgError) {
      console.error('Failed to send Telegram cancellation for transport:', tgError);
    }

    return NextResponse.json({ success: true, transportRequest: updated });
  } catch (error) {
    console.error('Transport cancellation error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
