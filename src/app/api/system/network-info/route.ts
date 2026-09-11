import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    const ips: string[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        // Skip internal (non-public) and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address);
        }
      }
    }

    return NextResponse.json({
      success: true,
      localhostUrl: 'http://localhost:3000',
      networkIps: ips,
    });
  } catch (error) {
    console.error('Error retrieving network info:', error);
    return NextResponse.json({
      success: false,
      localhostUrl: 'http://localhost:3000',
      networkIps: [],
    });
  }
}
