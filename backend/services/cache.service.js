const Redis = require('ioredis')

let redis = null
let redisEnabled = true

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null,
    connectTimeout: 1000,
    lazyConnect: true
  })
  redis.on('connect', () => console.log('[Redis] connected'))
  redis.on('error', (e) => { console.error('[Redis] connection error:', e.message); redisEnabled = false })
  redis.on('end', () => { console.warn('[Redis] connection closed'); redisEnabled = false })
} catch (e) {
  console.error('[Redis] init failed:', e.message)
  redisEnabled = false
}

async function getRedis() {
  if (!redisEnabled || !redis) return null
  try {
    await redis.ping()
    return redis
  } catch (e) {
    redisEnabled = false
    return null
  }
}

const TTL_PRODUCTS = 300

async function getProducts(key) {
  try {
    const r = await getRedis()
    if (!r) return null
    const cached = await r.get(key)
    if (cached) return JSON.parse(cached)
  } catch (e) {
    console.error('[Redis] get error:', e.message)
  }
  return null
}

async function setProducts(key, data) {
  try {
    const r = await getRedis()
    if (!r) return
    await r.setex(key, TTL_PRODUCTS, JSON.stringify(data))
  } catch (e) {
    console.error('[Redis] set error:', e.message)
  }
}

async function invalidateProducts() {
  try {
    const r = await getRedis()
    if (!r) return
    const keys = await r.keys('metagro:products:*')
    if (keys.length) await r.del(...keys)
  } catch (e) {
    console.error('[Redis] invalidate error:', e.message)
  }
}

async function recordVisit(productId) {
  try {
    const r = await getRedis()
    if (!r) return
    await r.incr(`metagro:visits:product:${productId}`)
  } catch (e) {
    console.error('[Redis] visit error:', e.message)
  }
}

async function getVisits(productId) {
  try {
    const r = await getRedis()
    if (!r) return 0
    const v = await r.get(`metagro:visits:product:${productId}`)
    return v ? parseInt(v, 10) : 0
  } catch (e) {
    return 0
  }
}

async function getTopProducts(limit = 10) {
  try {
    const r = await getRedis()
    if (!r) return []
    const keys = await r.keys('metagro:visits:product:*')
    const items = await Promise.all(keys.map(async k => {
      const id = k.split(':').pop()
      const v = await r.get(k)
      return { id: parseInt(id, 10), visits: v ? parseInt(v, 10) : 0 }
    }))
    items.sort((a, b) => b.visits - a.visits)
    return items.slice(0, limit)
  } catch (e) {
    return []
  }
}

module.exports = { getProducts, setProducts, invalidateProducts, recordVisit, getVisits, getTopProducts, redis }
