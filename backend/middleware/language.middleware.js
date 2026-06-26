const cookie = require('cookie')

function languageMiddleware(req, res, next) {
  const customLang = req.headers['x-accept-language']
  if (customLang === 'es' || customLang === 'en') {
    res.setHeader('Set-Cookie', cookie.serialize('mg_lang', customLang, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/'
    }))
  }
  next()
}

function detectLanguageFromHeader(req) {
  const header = req.headers['accept-language'] || req.headers['x-accept-language'] || 'es'
  const lang = header.split(',')[0].trim().split('-')[0]
  return ['es', 'en'].includes(lang) ? lang : 'es'
}

module.exports = { languageMiddleware, detectLanguageFromHeader }
