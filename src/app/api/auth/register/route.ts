import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';
import { memoryOtpStore, memoryUserStore } from '@/lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, city, preferredBranch } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Check memory store first for existing verified user
    const memUser = memoryUserStore.get(trimmedEmail);
    if (memUser && memUser.isVerified) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists. Please sign in.' }, { status: 400 });
    }

    try {
      // Check if verified user exists in DB
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (existingUser && existingUser.isVerified) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists. Please sign in.' }, { status: 400 });
      }

      // Upsert User record in DB
      await prisma.user.upsert({
        where: { email: trimmedEmail },
        update: {
          name,
          password: hashedPassword,
          phone,
          address,
          city: city || 'Lagos',
          preferredBranch: preferredBranch || 'lagos_head_office',
          isVerified: false,
        },
        create: {
          email: trimmedEmail,
          name,
          password: hashedPassword,
          phone,
          address,
          city: city || 'Lagos',
          preferredBranch: preferredBranch || 'lagos_head_office',
          isVerified: false,
        },
      });

      // Delete old OTPs and insert new OTP in DB
      await prisma.otpVerification.deleteMany({ where: { email: trimmedEmail } });
      await prisma.otpVerification.create({
        data: {
          email: trimmedEmail,
          code: otpCode,
          type: 'REGISTER',
          expiresAt,
        },
      });
    } catch (dbErr: any) {
      console.error('Database error during registration:', dbErr?.message);
      return NextResponse.json(
        { success: false, error: 'Registration is temporarily unavailable because the account database could not be reached.' },
        { status: 503 }
      );
    }

    // Always save to shared memory store as backup
    memoryOtpStore.set(trimmedEmail, {
      code: otpCode,
      expiresAt: expiresAt.getTime(),
      passwordHash: hashedPassword,
      name,
      phone,
      address,
      city: city || 'Lagos',
      preferredBranch: preferredBranch || 'lagos_head_office',
    });

    // Pre-save user to memory (unverified) so login fallback can check it
    memoryUserStore.set(trimmedEmail, {
      id: `mem_${Date.now()}`,
      email: trimmedEmail,
      name,
      passwordHash: hashedPassword,
      phone,
      address,
      city: city || 'Lagos',
      preferredBranch: preferredBranch || 'lagos_head_office',
      isVerified: false,
      createdAt: Date.now(),
    });

    // Send Resend OTP Email
    const emailResult = await sendOtpEmail(trimmedEmail, otpCode, 'REGISTER');

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Account created, but failed to send OTP email: ${emailResult.error}. Please contact support or check email spelling.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification OTP sent to ${trimmedEmail}`,
      email: trimmedEmail,
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Registration failed' }, { status: 500 });
  }
}
