const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { uploadFile, isStorageConfigured } = require('../services/storage.service')

async function backupDatabase() {
  const dbUrl = process.env.DATABASE_URL || process.env.PG_URI
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
        if (stat.size > 0 && isStorageConfigured()) {
          const content = fs.readFileSync(tmpPath)
          const url = await uploadFile(`backups/db/${filename}`, content, 'application/gzip')
          console.log(`[backup] Backup subido a S3: ${url}`)
        } else {
          console.log('[backup] S3 no configurado, backup guardado localmente:', tmpPath)
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

module.exports = { backupDatabase }
