import { createHash } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionSecret } from '@/lib/sessionSecret';

const COOKIE_NAME = 'gnaath_admin_token';
const SESSION_HOURS = 24 * 7;

function adminSecret() {
  return getSessionSecret('admin', process.env.ADMIN_JWT_SECRET);
}

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Short fingerprint of the stored hash: changing the password revokes every older session. */
export function passwordVersion(passwordHash: string) {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
}

export async function createAdminSession(payload: AdminSessionPayload, passwordHash: string) {
  const token = await new SignJWT({ ...payload, pv: passwordVersion(passwordHash) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(adminSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * SESSION_HOURS,
  });

  return token;
}

/**
 * Returns the signed-in admin, re-checked against the database on every call so that
 * deleted admins and changed passwords take effect immediately.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, adminSecret());
    if (typeof payload.id !== 'string' || typeof payload.pv !== 'string') return null;

    const admin = await prisma.adminUser.findUnique({ where: { id: payload.id } });
    if (!admin || passwordVersion(admin.password) !== payload.pv) return null;

    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
