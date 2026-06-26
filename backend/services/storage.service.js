const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')

function createS3Client() {
  const endpoint = process.env.S3_ENDPOINT || 'https://<account>.r2.cloudflarestorage.com'
  const region = process.env.S3_REGION || 'auto'
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  const bucket = process.env.S3_BUCKET || 'metagro-productos'

  if (!accessKeyId || !secretAccessKey) {
    return { client: null, bucket: null, configured: false }
  }

  const client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE
  })

  return { client, bucket, configured: true }
}

const { client: s3Client, bucket, configured } = createS3Client()

async function uploadFile(key, buffer, contentType = 'image/jpeg') {
  if (!configured || !s3Client || !bucket) throw new Error('S3 no configurado')
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  })
  await s3Client.send(cmd)
  return `https://cdn.metagro.com.ar/${key}`
}

async function deleteFile(key) {
  if (!configured || !s3Client || !bucket) return
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key })
  await s3Client.send(cmd)
}

function getPublicUrl(key) {
  if (!configured || !bucket) return null
  const base = process.env.CDN_BASE_URL || `https://cdn.metagro.com.ar`
  return `${base}/${key}`
}

async function uploadWithThumbnails(key, buffer, contentType = 'image/jpeg') {
  if (!configured || !s3Client || !bucket) throw new Error('S3 no configurado')
  const baseKey = key.replace(/\.[^.]+$/, '')
  const ext = key.split('.').pop() || 'jpg'
  const sizes = [
    { suffix: '-thumb', width: 300 },
    { suffix: '-medium', width: 800 },
    { suffix: '', width: 1200 }
  ]
  const results = await Promise.all(sizes.map(async ({ suffix, width }) => {
    const resized = await sharp(buffer)
      .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer()
    const fullKey = `${baseKey}${suffix}.${ext}`
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: resized,
      ContentType: contentType
    })
    await s3Client.send(cmd)
    return { key: fullKey, url: getPublicUrl(fullKey) }
  }))
  return results
}

module.exports = { uploadFile, deleteFile, getPublicUrl, isStorageConfigured: () => configured, uploadWithThumbnails }
