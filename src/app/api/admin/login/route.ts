import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createAdminSession } from '@/lib/auth';
import { clientIp, isRateLimited, resetRateLimit } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const limitKey = `admin-login:${clientIp(request)}:${email}`;
    if (isRateLimited(limitKey, MAX_ATTEMPTS, WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
        { status: 429 }
      );
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const isValidPassword = admin ? await bcrypt.compare(password, admin.password) : false;

    if (!admin || !isValidPassword) {
      return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
    }

    resetRateLimit(limitKey);
    const session = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
    await createAdminSession(session, admin.password);

    return NextResponse.json({ success: true, admin: session });
  } catch (error: unknown) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Sign-in is temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    );
  }
}
