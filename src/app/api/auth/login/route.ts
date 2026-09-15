import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createUserSession } from '@/lib/userAuth';
import { memoryUserStore } from '@/lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ── 1. Try Database first ──────────────────────────────────────────────────
    let dbUser = null;
    let dbAvailable = false;
    let dbError: unknown = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
      dbAvailable = true;
    } catch (dbErr: any) {
      dbError = dbErr;
      console.warn('DB error during user login, using memory fallback:', dbErr?.message);
    }

    if (dbAvailable && dbUser) {
      // Found in DB — authenticate normally
      const isValidPassword = await bcrypt.compare(password, dbUser.password);

      if (!isValidPassword) {
        return NextResponse.json({ success: false, error: 'Incorrect email or password.' }, { status: 401 });
      }

      if (!dbUser.isVerified) {
        // Resend OTP for unverified users
        return NextResponse.json({
          success: false,
          requiresVerification: true,
          error: 'Your account is not verified yet. A new OTP code has been sent to your email.',
          email: dbUser.email,
        }, { status: 403 });
      }

      const userPayload = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        phone: dbUser.phone || undefined,
        address: dbUser.address || undefined,
        city: dbUser.city || undefined,
        preferredBranch: dbUser.preferredBranch || undefined,
      };

      await createUserSession(userPayload);

      return NextResponse.json({
        success: true,
        message: 'Sign in successful!',
        user: userPayload,
      });
    }

    if (dbAvailable && !dbUser) {
      // DB is working but user genuinely not found — check memory store for very recently registered users
      const memUser = memoryUserStore.get(trimmedEmail);
      if (!memUser) {
        return NextResponse.json({ success: false, error: 'No account found with this email. Please register.' }, { status: 401 });
      }
      // Fall through to memory auth below
      if (!memUser.isVerified) {
        return NextResponse.json({
          success: false,
          requiresVerification: true,
          error: 'Your account is not verified yet. Please enter the OTP code sent to your email.',
          email: trimmedEmail,
        }, { status: 403 });
      }

      const isValidPassword = await bcrypt.compare(password, memUser.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ success: false, error: 'Incorrect email or password.' }, { status: 401 });
      }

      const userPayload = {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        phone: memUser.phone,
        city: memUser.city,
        preferredBranch: memUser.preferredBranch,
      };

      await createUserSession(userPayload);
      return NextResponse.json({ success: true, message: 'Sign in successful!', user: userPayload });
    }

    // ── 2. DB unavailable — use memory fallback ─────────────────────────────────
    const memUser = memoryUserStore.get(trimmedEmail);

    if (!memUser) {
      return NextResponse.json({
        success: false,
        error: dbError
          ? 'Login is temporarily unavailable because the account database could not be reached. Please try again shortly.'
          : 'No account found with this email. If you just registered, please verify your OTP first.',
      }, { status: dbError ? 503 : 401 });
    }

    if (!memUser.isVerified) {
      return NextResponse.json({
        success: false,
        requiresVerification: true,
        error: 'Your account is not verified yet. Please enter the OTP code sent to your email.',
        email: trimmedEmail,
      }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, memUser.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: 'Incorrect email or password.' }, { status: 401 });
    }

    const userPayload = {
      id: memUser.id,
      email: memUser.email,
      name: memUser.name,
      phone: memUser.phone,
      address: memUser.address,
      city: memUser.city,
      preferredBranch: memUser.preferredBranch,
    };

    await createUserSession(userPayload);

    return NextResponse.json({
      success: true,
      message: 'Sign in successful!',
      user: userPayload,
    });
  } catch (error: any) {
    console.error('User login API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
  }
}
