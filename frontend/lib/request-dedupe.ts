/**
 * Shares one in-flight Promise per key so concurrent identical requests (e.g. React Strict Mode
 * double mount) coalesce into a single network call. The entry is cleared when the promise settles.
 */
const inflight = new Map<string, Promise<unknown>>()

export function dedupeAsync<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing

  const p = factory().finally(() => {
    inflight.delete(key)
  }) as Promise<T>

  inflight.set(key, p)
  return p
}
