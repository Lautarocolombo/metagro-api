const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})

const TTL_PRODUCTS = 300

async function getProducts(key) {
  try {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)
  } catch (e) {
    console.error('[Redis] get error:', e.message)
  }
  return null
}

async function setProducts(key, data) {
  try {
    await redis.setex(key, TTL_PRODUCTS, JSON.stringify(data))
  } catch (e) {
    console.error('[Redis] set error:', e.message)
  }
}

async function invalidateProducts() {
  try {
    const keys = await redis.keys('metagro:products:*')
    if (keys.length) await redis.del(...keys)
  } catch (e) {
    console.error('[Redis] invalidate error:', e.message)
  }
}

async function recordVisit(productId) {
  try {
    await redis.incr(`metagro:visits:product:${productId}`)
  } catch (e) {
    console.error('[Redis] visit error:', e.message)
  }
}

async function getVisits(productId) {
  try {
    const v = await redis.get(`metagro:visits:product:${productId}`)
    return v ? parseInt(v, 10) : 0
  } catch (e) {
    return 0
  }
}

async function getTopProducts(limit = 10) {
  try {
    const keys = await redis.keys('metagro:visits:product:*')
    const items = await Promise.all(keys.map(async k => {
      const id = k.split(':').pop()
      const v = await redis.get(k)
      return { id: parseInt(id, 10), visits: v ? parseInt(v, 10) : 0 }
    }))
    items.sort((a, b) => b.visits - a.visits)
    return items.slice(0, limit)
  } catch (e) {
    return []
  }
}

module.exports = { getProducts, setProducts, invalidateProducts, recordVisit, getVisits, getTopProducts, redis }
