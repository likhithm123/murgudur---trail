const requests = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60000
) {
  const now = Date.now();

  const hits =
    requests.get(key)?.filter(
      time => now - time < windowMs
    ) || [];

  if (hits.length >= limit) {
    return false;
  }

  hits.push(now);
  requests.set(key, hits);

  return true;
}
