jest.mock('../data/pool', () => ({
  query: jest.fn()
}))

const pool = require('../config/db')
const { listProducts } = require('../controllers/productos.controller')

describe('listProducts', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('devuelve productos formateados desde DB', async () => {
    const mockRows = [
      { id: 1, categoria: 'General', nombre: 'Torniquete', descripcion: 'Desc', especificaciones: 'Esp', imagen_url: 'img.jpg' },
      { id: 2, categoria: 'Buloneria', nombre: 'Bulon', descripcion: '', especificaciones: null, imagen_url: null }
    ]
    pool.query.mockResolvedValue({ rows: mockRows })

    const req = {}
    const res = {
      json: jest.fn()
    }

    await listProducts(req, res)
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, name: 'Torniquete', tag: 'General', desc: 'Desc', icon: '', img: 'img.jpg', imagen_url: 'img.jpg', images: ['img.jpg'], especificaciones: 'Esp', seo: { title: 'Torniquete | Metagro SRL', description: 'Desc - Metagro SRL, insumos para el agro en Gualeguay, Entre Ríos.', image: 'https://metagro.com.ar/img.jpg', url: 'https://metagro.com.ar/productos/1-torniquete' } },
      { id: 2, name: 'Bulon', tag: 'Buloneria', desc: '', icon: '', img: '', imagen_url: '', images: [], especificaciones: '', seo: { title: 'Bulon | Metagro SRL', description: 'Producto - Metagro SRL, insumos para el agro en Gualeguay, Entre Ríos.', image: 'https://metagro.com.ar/logo/Logo.jpg', url: 'https://metagro.com.ar/productos/2-bulon' } }
    ])
  })

  it('maneja error de DB devolviendo array vacio', async () => {
    pool.query.mockRejectedValue(new Error('DB off'))
    const req = {}
    const res = { json: jest.fn() }
    await listProducts(req, res)
    expect(res.json).toHaveBeenCalledWith([])
  })
})
