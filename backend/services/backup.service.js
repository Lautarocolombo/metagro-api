const { uploadFile } = require('./storage.service')
const { v4: uuidv4 } = require('uuid')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

async function backupToS3(data, filename) {
  const key = `backups/${filename || `metagro-${new Date().toISOString().split('T')[0]}.json`}`
  const buffer = Buffer.from(JSON.stringify(data, null, 2))
  const url = await uploadFile(key, buffer, 'application/json')
  return { ok: true, url, key }
}

async function scheduledBackup(req) {
  const { listProducts } = require('../controllers/productos.controller')
  const mockReq = { user: { username: 'system' } }
  const mockRes = { json: async (d) => d }
  const data = await listProducts(mockReq, mockRes)
  const key = `backups/auto-${new Date().toISOString().split('T')[0]}.json`
  const buffer = Buffer.from(JSON.stringify(data, null, 2))
  await uploadFile(key, buffer, 'application/json')
  return { ok: true, key }
}

async function backupDatabase() {
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.PG_URI
  if (!dbUrl) {
    console.error('[backup] DATABASE_URL no configurado')
    return false
  }
  const date = new Date()
  const timestamp = date.toISOString().replace(/[-:T]/g, '').split('.')[0]
  const filename = `db-backup-metagro-${timestamp}.sql.gz`
  const tmpPath = path.join('/tmp', filename)
  return new Promise((resolve) => {
    const command = `pg_dump "${dbUrl}"`
    exec(command, { maxBuffer: 50 * 1024 * 1024 }, async (err, stdout) => {
      if (err) {
        console.error('[backup] pg_dump error:', err.message)
        resolve(false)
        return
      }
      try {
        const gzipped = zlib.gzipSync(stdout)
        fs.writeFileSync(tmpPath, gzipped)
        const stat = fs.statSync(tmpPath)
        if (stat.size > 0) {
          const content = fs.readFileSync(tmpPath)
          const url = await uploadFile(`backups/db/${filename}`, content, 'application/gzip')
          console.log(`[backup] Backup DB subido a S3: ${url}`)
        } else {
          console.log('[backup] Backup DB vacío')
        }
        fs.unlinkSync(tmpPath)
        resolve(true)
      } catch (e) {
        console.error('[backup] upload error:', e)
        resolve(false)
      }
    })
  })
}

module.exports = { backupToS3, scheduledBackup, backupDatabase }
