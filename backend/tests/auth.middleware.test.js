// jest globals available (describe, it, expect, jest)
// eslint-disable-next-line no-unused-vars
function createReqResNext(overrides = {}) {
  const obj = {
    headers: { 'x-mg-token': overrides.token || '' },
    ...(overrides.req || {}),
    ip: overrides.ip || '127.0.0.1',
    status: function (code) {
      this._status = code
      return this
    },
    json: function (body) {
      this._json = body
      return this
    },
    next: overrides.next || (() => {})
  }
  obj._status = undefined
  obj._json = undefined
  return obj
}

describe('auth middleware', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
  })

  it('rechaza sin token', () => {
    const { auth } = require('../middleware/auth.middleware')
    const req = createReqResNext()
    const res = req
    auth(req, res, req.next)
    expect(req._status).toBe(401)
  })

  it('acepta cuando METAGRO_TOKEN coincide', () => {
    process.env.METAGRO_TOKEN = 'abc123'
    process.env.JWT_SECRET = 'jwtsecret'
    const { auth } = require('../middleware/auth.middleware')
    const req = createReqResNext({ token: 'abc123' })
    auth(req, req, req.next)
    expect(req._status).toBeUndefined()
  })

  it('acepta cuando JWT valido y no hay METAGRO_TOKEN', () => {
    delete process.env.METAGRO_TOKEN
    process.env.JWT_SECRET = 'jwtsecret'
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ role: 'admin', user: 'test' }, 'jwtsecret', { expiresIn: '1h' })
    const { auth } = require('../middleware/auth.middleware')
    const req = createReqResNext({ token })
    auth(req, req, req.next)
    expect(req._status).toBeUndefined()
  })

  it('rechaza JWT invalido', () => {
    delete process.env.METAGRO_TOKEN
    process.env.JWT_SECRET = 'jwtsecret'
    const { auth } = require('../middleware/auth.middleware')
    const req = createReqResNext({ token: 'invalidtoken' })
    auth(req, req, req.next)
    expect(req._status).toBe(401)
  })
})
