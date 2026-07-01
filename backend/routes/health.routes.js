const express = require('express')
const router = express.Router()
const { checkDbConnection } = require('../config/db')
const os = require('os')

const START_TIME = Date.now()

async function getHealth(req, res) {
  const start = Date.now()
  let dbStatus = 'ok'
  let dbError = null
  try {
    const ok = await checkDbConnection();
    if (!ok) { dbStatus = 'error'; dbError = 'Connection test failed - check logs for details'; }
  } catch (e) {
    dbStatus = 'error'
    dbError = e.message
  }
  const memUsage = process.memoryUsage()
  const uptimeSec = Math.floor((Date.now() - START_TIME) / 1000)
  res.json({
    db: dbStatus,
    uptime: uptimeSec,
    version: process.env.npm_package_version || require('../../package.json').version,
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    responseTime: Date.now() - start
  })
}

router.get('/health', getHealth)

module.exports = router
