import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createAdminSession, getAdminSession } from '@/lib/auth';
import { isRateLimited } from '@/lib/rateLimit';

const MIN_PASSWORD_LENGTH = 10;

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    if (isRateLimited(`admin-password:${session.id}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: session.id } });
    if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
    }

    if (await bcrypt.compare(newPassword, admin.password)) {
      return NextResponse.json({ success: false, error: 'Choose a password different from the current one.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({ where: { id: admin.id }, data: { password: hashed } });

    // Every other device signed in with the old password is now logged out; keep this one signed in.
    await createAdminSession(session, hashed);

    return NextResponse.json({ success: true, message: 'Password updated. Other devices have been signed out.' });
  } catch (error: unknown) {
    console.error('Admin password change error:', error);
    return NextResponse.json({ success: false, error: 'Could not update the password right now.' }, { status: 500 });
  }
}
