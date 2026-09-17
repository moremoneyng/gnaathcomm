import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { resetMemoryStore } from '@/lib/resetMemoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email, OTP code, and new password required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();
    let isMatch = false;

    try {
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email: trimmedEmail,
          code: trimmedCode,
          type: 'PASSWORD_RESET',
          expiresAt: { gte: new Date() },
        },
      });

      if (otpRecord) {
        isMatch = true;
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      }
    } catch (dbErr: unknown) {
      console.warn('DB error during reset password OTP check:', dbErr instanceof Error ? dbErr.message : String(dbErr));
    }

    if (!isMatch) {
      const memRecord = resetMemoryStore.get(trimmedEmail);
      if (memRecord && memRecord.code === trimmedCode && memRecord.expiresAt > Date.now()) {
        isMatch = true;
        resetMemoryStore.delete(trimmedEmail);
      }
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset OTP code.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await prisma.user.update({
        where: { email: trimmedEmail },
        data: { password: hashedPassword, isVerified: true },
      });
    } catch (dbErr: unknown) {
      console.warn('DB password update fallback:', dbErr instanceof Error ? dbErr.message : String(dbErr));
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Reset password failed';
    console.error('Reset password API error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
