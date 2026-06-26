const PDFDocument = require('pdfkit')
const { v4: uuidv4 } = require('uuid')
const { sendEmail } = require('./email.service')

function generateBudgetPdf(data) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const buffers = []
    doc.on('data', (chunk) => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))

    doc.fontSize(20).text('Presupuesto - Metagro SRL', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Cliente: ${data.cliente || 'Consumidor Final'}`)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`)
    doc.moveDown()
    doc.text('Productos:')
    doc.moveDown(0.5)
    data.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} - Cant: ${item.qty} - ${item.obs || ''}`)
    })
    doc.moveDown()
    doc.text(`Notas: ${data.notas || ''}`)
    doc.end()
  })
}

async function sendBudgetEmail({ to, data }) {
  const pdfBuffer = await generateBudgetPdf(data)
  const fileName = `presupuesto-${uuidv4()}.pdf`
  const result = await sendEmail({
    to: to || 'metagro@example.com',
    subject: `Presupuesto Metagro SRL - ${new Date().toLocaleDateString('es-AR')}`,
    text: 'Adjunto presupuesto solicitado.',
    html: '<p>Adjunto presupuesto solicitado.</p>',
    attachments: [{ filename: fileName, content: pdfBuffer, contentType: 'application/pdf' }]
  })
  return { ok: true, fileName, result }
}

module.exports = { generateBudgetPdf, sendBudgetEmail }
