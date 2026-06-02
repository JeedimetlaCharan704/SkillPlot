interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()
const TTL = 5 * 60 * 1000

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > TTL) cache.delete(key)
  }
}, 60 * 1000)

function get(key: string): any {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function set(key: string, data: any, ttl: number = TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

function clear(pattern?: string): void {
  if (!pattern) { cache.clear(); return }
  const regex = new RegExp(pattern)
  for (const key of cache.keys()) {
    if (regex.test(key)) cache.delete(key)
  }
}

export { get, set, clear }
