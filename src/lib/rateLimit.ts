const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort fixed-window limiter. State is per server instance, so it slows down
 * password guessing without being a hard guarantee across a serverless fleet.
 */
export function isRateLimited(key: string, limit: number, windowMs: number, now = Date.now()) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}
