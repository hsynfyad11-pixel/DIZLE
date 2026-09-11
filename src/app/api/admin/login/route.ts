import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ success: false, error: 'Phone and password are required' }, { status: 400 });
    }

    console.log(`[ADMIN LOGIN DEBUG] Phone: ${phone} | Input Password: "${password}"`);

    const admin = await prisma.admin.findUnique({
      where: { phone },
    });

    if (!admin) {
      console.log(`[ADMIN LOGIN DEBUG] Admin record not found for phone: ${phone}`);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    console.log(`[ADMIN LOGIN DEBUG] DB Password: "${admin.password}"`);

    const cleanInputPassword = password.trim();
    const dbPassword = admin.password ? String(admin.password).trim() : '';

    if (dbPassword !== cleanInputPassword) {
      console.log(`[ADMIN LOGIN DEBUG] Password mismatch: "${dbPassword}" !== "${cleanInputPassword}"`);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
