// In-memory rate limiter keyed by an identifier (IP or email).
// NOTE: This works for single-instance deployments. For production with
// multiple server instances, replace the Map with a Redis-based solution
// (e.g. Upstash Redis with @upstash/ratelimit) so state is shared across
// all instances.

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const bucket = buckets.get(identifier) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= maxRequests) {
    buckets.set(identifier, bucket);
    return { allowed: false, remaining: 0 };
  }

  bucket.timestamps.push(now);
  buckets.set(identifier, bucket);
  const remaining = maxRequests - bucket.timestamps.length;
  return { allowed: true, remaining };
}

export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  );
}
