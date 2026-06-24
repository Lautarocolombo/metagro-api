# Herramientas de Mantenimiento

Scripts auxiliares para desarrolladores. Usar desde la raíz del proyecto.

## Uso

```bash
node tools/<script>.mjs
```

## Descripción

| Script | Descripción |
|--------|-------------|
| `test-api.cjs` | Verifica que la API local responda correctamente |
| `bulk-upload.mjs` | Carga masiva de imágenes/productos |
| `sync-html-to-json.cjs` | Extrae productos del HTML y los guarda en `backend/data/products.json` |
| `inject-products.cjs` | Inyecta productos desde JSON a la base de datos |
| `count-products.cjs` | Cuenta productos en la base de datos |
| `seed-products-from-html.mjs` | Genera seed SQL desde el HTML |
| `build-sql.mjs` | Genera archivo SQL con inserts de productos |
| `setup-home-content.mjs` | Puebla la tabla `home_content` |
| `create-site-texts.mjs` | Inserta textos base de leyendas en `site_texts` |
| `create-site-changes.mjs` | Crea registros de ejemplo en `site_changes` |
| `generate-seed-all.mjs` | Genera seed completo del sitio |
| `fix-commas.mjs` | Corrige comas en nombres de productos |
| `run-seed.mjs` | Ejecuta el seed principal |

## Variables de Entorno

Para scripts que acceden a PostgreSQL:

```bash
POSTGRES_URL=postgres://user:pass@host:5432/metagro
```
