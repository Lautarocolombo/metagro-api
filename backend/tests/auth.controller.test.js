jest.mock('jsonwebtoken')
jest.mock('../data/pool', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] })
}))

describe('auth.controller', () => {
  const jwt = require('jsonwebtoken')
  const { login, refresh } = require('../controllers/auth.controller')
  const pool = require('../data/pool')

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('login exitoso devuelve token', async () => {
    process.env.ADMIN_USER = 'admin'
    process.env.ADMIN_PASS = 'pass123'
    process.env.JWT_SECRET = 'secret'
    jwt.sign.mockReturnValue('token-abc')

    const req = { body: { username: 'admin', password: 'pass123' } }
    const res = { json: jest.fn() }
    login(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token-abc' }))
    expect(jwt.sign).toHaveBeenCalledWith({ role: 'admin', user: 'admin' }, 'secret', { expiresIn: '15m' })
  })

  it('login falla credenciales invalidas', () => {
    process.env.ADMIN_USER = 'admin'
    process.env.ADMIN_PASS = 'pass123'
    const req = { body: { username: 'bad', password: 'bad' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    login(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('login falla si falta ADMIN_USER o ADMIN_PASS', () => {
    delete process.env.ADMIN_USER
    const req = { body: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    login(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('refresh exitoso renueva tokens', async () => {
    process.env.JWT_SECRET = 'secret'
    jwt.sign.mockReturnValue('new-token-abc')
    pool.query.mockResolvedValue({
      rows: [{
        id: 1,
        user_id: 'admin',
        role: 'admin',
        token_hash: 'abc'
      }]
    })
    const req = { body: { refreshToken: 'valid-token' } }
    const res = { json: jest.fn() }
    await refresh(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'new-token-abc' }))
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO refresh_tokens (token_hash, user_id, role, expires_at) VALUES ($1, $2, $3, $4)',
      expect.any(Array)
    )
  })
})
