const fs = require('fs')
const path = require('path')

const productosDir = path.join(__dirname, '..', 'productos')
const dataJsPath = path.join(__dirname, '..', 'data.js')

const realFiles = new Set(fs.readdirSync(productosDir).map(f => f.toLowerCase()))

const dataContent = fs.readFileSync(dataJsPath, 'utf8')
const imgMatches = [...dataContent.matchAll(/"img":\s*"([^"]+)"/g)].map(m => m[1])

const issues = []
for (const img of imgMatches) {
  const fileName = path.basename(img).toLowerCase()
  if (!realFiles.has(fileName)) {
    const similar = [...realFiles].filter(f => f.replace(/\.[^.]+$/, '') === fileName.replace(/\.[^.]+$/, ''))
    issues.push({
      dataJs: img,
      real: similar.length ? similar.join(', ') : 'NO ENCONTRADO',
      action: similar.length ? 'CASE SENSITIVE Mismatch' : 'Archivo faltante'
    })
  }
}

if (issues.length) {
  console.log('\n❌ IMÁGENES CON PROBLEMAS:\n')
  issues.forEach(i => {
    console.log(`  data.js dice:      "${i.dataJs}"`)
    console.log(`  archivo real es:   "${i.real}"`)
    console.log(`  problema:          ${i.action}\n`)
  })
  process.exit(1)
} else {
  console.log(`✅ Todas las ${imgMatches.length} imágenes de data.js existen y coinciden en casing.`)
}
