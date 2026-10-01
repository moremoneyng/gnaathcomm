import { createHash } from 'node:crypto';

const cache = new Map<string, Uint8Array>();

/**
 * Resolves the HMAC key used to sign session cookies.
 *
 * The explicit env var wins. Otherwise the key is derived from secrets that every
 * deployment already has, so sessions can never be signed with a value that is
 * visible in the public source code. Resolution is lazy so `next build` can import
 * route modules without runtime secrets.
 */
export function getSessionSecret(label: 'admin' | 'user', explicit: string | undefined): Uint8Array {
  const cached = cache.get(label);
  if (cached) return cached;

  let secret: Uint8Array;
  if (explicit && explicit.trim()) {
    secret = new TextEncoder().encode(explicit.trim());
  } else {
    const seeds = [
      process.env.DATABASE_URL,
      process.env.FLUTTERWAVE_SECRET_KEY,
      process.env.CLOUDINARY_API_SECRET,
    ].filter((value): value is string => Boolean(value && value.trim()));

    if (seeds.length === 0) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Session secret for ${label} sessions is not configured.`);
      }
      seeds.push('local-development-only');
    }

    secret = createHash('sha256').update(`gnaath-session:${label}\0`).update(seeds.join('\0')).digest();
  }

  cache.set(label, secret);
  return secret;
}
