const { z } = require('zod')

const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  tag: z.string().optional().default('General'),
  desc: z.string().optional().default(''),
  especificaciones: z.string().optional().default(''),
  img: z.string().url('URL de imagen inválida').optional().or(z.literal('')).default(''),
  images: z.array(z.string().url('URL inválida')).optional().default([])
})

const homeChangeSchema = z.object({
  id: z.string().min(1),
  nuevo: z.string()
})

const homeContentSchema = z.object({
  changes: z.array(homeChangeSchema),
  usuario: z.string().optional()
})

const siteTextSchema = z.object({
  key: z.string().min(1),
  value: z.string()
})

const siteChangeSchema = z.object({
  tipo: z.string().min(1),
  descripcion: z.string().min(1),
  datos: z.any().optional()
})

const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

module.exports = {
  productSchema,
  homeContentSchema,
  siteTextSchema,
  siteChangeSchema,
  adminLoginSchema
}
