import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const USER_JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'gnaath_global_communications_user_secret_key_2026'
);

const COOKIE_NAME = 'gnaath_user_token';

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  preferredBranch?: string;
}

export async function createUserSession(payload: UserSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(USER_JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return token;
}

export async function getUserSession(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, USER_JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      phone: payload.phone as string | undefined,
      address: payload.address as string | undefined,
      city: payload.city as string | undefined,
      preferredBranch: payload.preferredBranch as string | undefined,
    };
  } catch (error) {
    return null;
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
