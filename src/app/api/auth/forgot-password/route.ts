import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/email';
import { resetMemoryStore } from '@/lib/resetMemoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    try {
      const user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'No account registered with this email address.' }, { status: 404 });
      }

      await prisma.otpVerification.deleteMany({ where: { email: trimmedEmail, type: 'PASSWORD_RESET' } });
      await prisma.otpVerification.create({
        data: {
          email: trimmedEmail,
          code: otpCode,
          type: 'PASSWORD_RESET',
          expiresAt,
        },
      });
    } catch (dbErr: unknown) {
      console.warn('DB error during forgot password, using memory store:', dbErr instanceof Error ? dbErr.message : String(dbErr));
    }

    resetMemoryStore.set(trimmedEmail, { code: otpCode, expiresAt: expiresAt.getTime() });

    const emailResult = await sendOtpEmail(trimmedEmail, otpCode, 'PASSWORD_RESET');

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: `Failed to send reset email: ${emailResult.error}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset OTP code sent to ${trimmedEmail}`,
      email: trimmedEmail,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Forgot password failed';
    console.error('Forgot password API error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
