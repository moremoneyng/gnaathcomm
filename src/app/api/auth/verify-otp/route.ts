import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSession } from '@/lib/userAuth';
import { memoryOtpStore, memoryUserStore } from '@/lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, type = 'REGISTER' } = body;

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit OTP code required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    let isMatch = false;
    let memRecord = memoryOtpStore.get(trimmedEmail);

    try {
      // Check database OTP first
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email: trimmedEmail,
          code: trimmedCode,
          type,
          expiresAt: { gte: new Date() },
        },
      });

      if (otpRecord) {
        isMatch = true;
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      }
    } catch (dbErr: any) {
      console.warn('Prisma DB error checking OTP, checking memory fallback:', dbErr?.message);
    }

    // Check memory OTP store if DB check failed or returned no match
    if (!isMatch && memRecord) {
      if (memRecord.code === trimmedCode && memRecord.expiresAt > Date.now()) {
        isMatch = true;
        memoryOtpStore.delete(trimmedEmail);
      }
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid or expired 6-digit OTP code' }, { status: 400 });
    }

    // OTP matched! Mark user as verified
    let userPayload: {
      id: string;
      email: string;
      name: string;
      phone?: string;
      address?: string;
      city?: string;
      preferredBranch?: string;
    } = {
      id: `user_${Date.now()}`,
      email: trimmedEmail,
      name: memRecord?.name || 'G Naath Customer',
      phone: memRecord?.phone,
      address: memRecord?.address,
      city: memRecord?.city,
      preferredBranch: memRecord?.preferredBranch,
    };

    try {
      const updatedUser = await prisma.user.update({
        where: { email: trimmedEmail },
        data: { isVerified: true },
      });

      userPayload = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone || undefined,
        address: updatedUser.address || undefined,
        city: updatedUser.city || undefined,
        preferredBranch: updatedUser.preferredBranch || undefined,
      };
    } catch (dbErr) {
      console.warn('DB user update skipped in fallback mode.');
    }

    // Mark user as verified in memory store so login fallback can find them
    const existingMemUser = memoryUserStore.get(trimmedEmail);
    memoryUserStore.set(trimmedEmail, {
      id: userPayload.id,
      email: trimmedEmail,
      name: userPayload.name,
      passwordHash: memRecord?.passwordHash || existingMemUser?.passwordHash || '',
      phone: userPayload.phone,
      address: userPayload.address,
      city: userPayload.city,
      preferredBranch: userPayload.preferredBranch,
      isVerified: true,
      createdAt: existingMemUser?.createdAt || Date.now(),
    });

    // Create session cookie
    await createUserSession(userPayload);

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully!',
      user: userPayload,
    });
  } catch (error: any) {
    console.error('OTP Verification API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'OTP Verification failed' }, { status: 500 });
  }
}
