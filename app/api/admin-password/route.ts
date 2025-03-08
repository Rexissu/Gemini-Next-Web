import { NextResponse } from 'next/server';

export async function GET() {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  return NextResponse.json({ adminPassword });
}
