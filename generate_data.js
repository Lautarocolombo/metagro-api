const fs = require('fs')
const path = require('path')

const productsDir = path.join(__dirname, 'productos')
const files = fs.readdirSync(productsDir)

const txtFiles = files.filter(f => f.endsWith('.txt'))
const products = []

txtFiles.forEach(txt => {
  const name = path.basename(txt, '.txt')
  const content = fs.readFileSync(path.join(productsDir, txt), 'utf8')
  
  const base = name.replace(/\.txt$/i, '')
  
  const imgFile = files.find(f => {
    const fBase = path.basename(f, path.extname(f))
    return fBase.replace(/\.txt$/i, '') === base || f.toLowerCase().startsWith(base.toLowerCase())
  })
  
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const desc = lines.join('. ')
  
  const tag = lines.find(l => /^categor[íi]a[:\s]/i.test(l) || /^tag[:\s]/i.test(l))
    ? lines.find(l => /^categor[íi]a[:\s]/i.test(l) || /^tag[:\s]/i.test(l)).replace(/^(categor[íi]a|tag)[:\s]+/i, '')
    : 'General'
  
  const product = {
    id: products.length + 1,
    name: base.replace(/[-_]/g, ' '),
    tag,
    desc,
    icon: '📦'
  }
  
  if (imgFile) {
    const imgPath = path.join(productsDir, imgFile)
    const ext = path.extname(imgFile).toLowerCase()
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
    const data = fs.readFileSync(imgPath).toString('base64')
    product.img = `data:${mime};base64,${data}`
  }
  
  products.push(product)
})

const output = `window.DEFAULT_PRODUCTS = ${JSON.stringify(products, null, 2)};`
fs.writeFileSync(path.join(__dirname, 'data.js'), output)
console.log(`data.js generado con ${products.length} productos`)
