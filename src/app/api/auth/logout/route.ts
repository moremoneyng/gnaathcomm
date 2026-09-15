import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/userAuth';

export async function POST() {
  await clearUserSession();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
