// Rate limiter en memoria (por instancia). Suficiente para una sola instancia;
// con varias réplicas conviene moverlo a Redis/Upstash.

type Entry = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, Entry> | undefined;
};

const store = (globalForRateLimit.rateLimitStore ??= new Map<string, Entry>());

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const now = Date.now();

  if (store.size > 10_000) {
    for (const [k, entry] of store) if (entry.resetAt <= now) store.delete(k);
  }

  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) return { success: false, remaining: 0 };

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
