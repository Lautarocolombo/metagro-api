jest.mock('../data/pool', () => ({
  query: jest.fn()
}))

jest.mock('../services/analytics.service', () => ({
  getDashboardStats: jest.fn().mockResolvedValue({ products: 0 }),
  getTopSearches: jest.fn().mockResolvedValue([])
}))

const pool = require('../data/pool')
const { getSiteTexts, updateSiteText, createSiteChange, getSiteChanges, getAnalytics, getTopSearches } = require('../controllers/site.controller')

describe('site.controller', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getSiteTexts devuelve textos mapeados', async () => {
    pool.query.mockResolvedValue({ rows: [{ key: 'hero_t', value: 'Hola' }] })
    const req = {}
    const res = { json: jest.fn() }
    await getSiteTexts(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true, texts: { hero_t: 'Hola' } })
  })

  it('updateSiteText actualiza o inserta texto', async () => {
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
    const req = { body: { key: 'hero_t', value: 'Nuevo' }, ip: '1.2.3.4', connection: { remoteAddress: '1.2.3.4' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await updateSiteText(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('updateSiteText maneja validacion fallida con 400', async () => {
    const req = { params: { key: '' }, body: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await updateSiteText(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validación fallida' }))
  })

  it('createSiteChange registra cambio', async () => {
    pool.query.mockResolvedValue({})
    const req = { body: { tipo: 'edit', descripcion: 'cambio', datos: { a: 1 } }, ip: '1.2.3.4', connection: { remoteAddress: '1.2.3.4' }, headers: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await createSiteChange(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('getSiteChanges devuelve cambios limit 100', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] })
    const req = {}
    const res = { json: jest.fn() }
    await getSiteChanges(req, res)
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT 100'))
    expect(res.json).toHaveBeenCalledWith({ ok: true, cambios: [{ id: 1 }] })
  })

  it('getAnalytics devuelve stats', async () => {
    const req = {}
    const res = { json: jest.fn() }
    await getAnalytics(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true, stats: { products: 0 } })
  })
})
