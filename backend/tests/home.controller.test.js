jest.mock('../data/pool', () => ({
  query: jest.fn()
}))

const pool = require('../data/pool')
const { getHomeContent, postHomeContent, getHomeContentHistory, restoreHomeContent } = require('../controllers/home.controller')

describe('home.controller', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('getHomeContent devuelve mapa de contenido', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 'telefono', valor: '03444', categoria: 'contacto', descripcion: 'Tel' },
        { id: 'direccion', valor: 'Gualeguay', categoria: 'ubicacion', descripcion: 'Dir' }
      ]
    })
    const req = {}
    const res = { json: jest.fn() }
    await getHomeContent(req, res)
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: {
        telefono: { id: 'telefono', valor: '03444', categoria: 'contacto', descripcion: 'Tel' },
        direccion: { id: 'direccion', valor: 'Gualeguay', categoria: 'ubicacion', descripcion: 'Dir' }
      }
    })
  })

  it('getHomeContent maneja error con 500', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB down'))
    const req = {}
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await getHomeContent(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('postHomeContent aplica cambios en transaccion', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql === 'BEGIN') return Promise.resolve({})
      if (sql.includes('FOR UPDATE')) return Promise.resolve({ rows: [{ id: 'telefono', valor: 'old', categoria: 'contacto', descripcion: 'Tel' }] })
      if (sql.includes('UPDATE home_content')) return Promise.resolve({})
      if (sql.includes('INSERT INTO home_content_history')) return Promise.resolve({})
      if (sql === 'COMMIT') return Promise.resolve({})
      if (sql.includes('SELECT * FROM home_content ORDER BY')) return Promise.resolve({
        rows: [{ id: 'telefono', valor: 'new', categoria: 'contacto', descripcion: 'Tel' }]
      })
      return Promise.resolve({})
    })
    const req = { body: { changes: [{ id: 'telefono', nuevo: 'new' }], usuario: 'tester' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await postHomeContent(req, res)
    expect(pool.query).toHaveBeenCalledWith('BEGIN')
    expect(pool.query).toHaveBeenCalledWith('COMMIT')
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }))
  })

  it('restoreHomeContent restaura version anterior', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('SELECT * FROM home_content_history WHERE id')) return Promise.resolve({
        rows: [{ id: 1, valor_anterior: 'old', content_id: 'telefono', categoria: 'contacto', descripcion_campo: 'Tel' }]
      })
      if (sql === 'BEGIN') return Promise.resolve({})
      if (sql.includes('UPDATE home_content')) return Promise.resolve({})
      if (sql.includes('INSERT INTO home_content_history')) return Promise.resolve({})
      if (sql === 'COMMIT') return Promise.resolve({})
      return Promise.resolve({})
    })
    const req = { body: { history_id: 1 } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await restoreHomeContent(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: 'Versión restaurada' })
  })

  it('getHomeContentHistory devuelve historial', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] })
    const req = {}
    const res = { json: jest.fn() }
    await getHomeContentHistory(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: [{ id: 1 }] })
  })
})
