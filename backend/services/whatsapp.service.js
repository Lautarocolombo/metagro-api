const axios = require('axios')

async function sendWhatsAppText(to, body) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  if (!token || !phoneId) {
    console.warn('[wa] token/phone no configurado')
    return { simulated: true }
  }
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`
  const res = await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body }
  }, { headers: { Authorization: `Bearer ${token}` } })
  return res.data
}

async function sendWhatsAppTemplate(to, templateName, components = []) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  if (!token || !phoneId) return { simulated: true }
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`
  const res = await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: { name: templateName, language: { code: 'es_AR' }, components }
  }, { headers: { Authorization: `Bearer ${token}` } })
  return res.data
}

module.exports = { sendWhatsAppText, sendWhatsAppTemplate }
