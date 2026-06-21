import jwt from 'jsonwebtoken';
import cors from 'cors';

const corsMiddleware = cors({ origin: '*', credentials: true });

const DEFAULT_PRODUCTS = [
  { "id": 1, "name": "08 10 Estiradora", "tag": "Maquinaria", "desc": "Equipo para estirado y mantenimiento de alambrados.", "icon": "🎭", "img": "productos/08-10-estiradora.jpg" },
  { "id": 2, "name": "Aislador W", "tag": "Aisladores", "desc": "Marca: Rolin", "icon": "⚡", "img": "productos/Aislador W.jpg" },
  { "id": 3, "name": "Arreadores", "tag": "Arreadores", "desc": "Modelos de arreadores para diferentes tipos de alambrado.", "icon": "🐣", "img": "productos/arreador b.jpeg", "variants": [{ "name": "Arreador B", "img": "productos/arreador b.jpeg" }, { "name": "Arreador con Pilas", "img": "productos/Arreador con pilas.jpeg" }, { "name": "Arreador Corto y Largo", "img": "productos/Arreador corto y largo.jpeg" }, { "name": "Arreador Mango", "img": "productos/Arreador mango.jpg" }, { "name": "Arreador Puas", "img": "productos/Arreador puas.jpg" }, { "name": "Arreador Tapa Roscada", "img": "productos/Arreador Tapa Roscada b.jpg" }, { "name": "Arreador", "img": "productos/Arreador.jpg" }, { "name": "Arredor Tapa Roscada", "img": "productos/Arredor Tapa roscada.jpg" }] },
  { "id": 11, "name": "Bebedero Cemento", "tag": "Bebederos", "desc": "Bebedero de cemento para ganado, resistente y durable.", "icon": "💧", "img": "productos/bebederos cemento.JPG" },
  { "id": 12, "name": "Bobinas Electropiolín", "tag": "Bobinas", "desc": "Electropiolín Rolin · Disponible en 250, 500, 750 y 1000 mts. Standard y Reforzada.", "icon": "🔄", "img": "productos/bobina 1000.jpg", "variants": [{ "name": "Bobina 250 mts", "img": "productos/bobina 250.jpg" }, { "name": "Bobina 500 mts", "img": "productos/bobina 500.jpg" }, { "name": "Bobina 750 mts", "img": "productos/bobina 750.jpg" }, { "name": "Bobina 1000 mts", "img": "productos/bobina 1000.jpg" }] },
  { "id": 16, "name": "Cable Subterráneo Rolin 1.8mm", "tag": "Cables", "desc": "Cable subterráneo de 1.8 mm para instalaciones eléctricas rurales.", "icon": "🔌", "img": "productos/Cable subterraneo Rolin 1.8mm.jpg" },
  { "id": 17, "name": "Campanitas", "tag": "Campanitas", "desc": "Campanitas para alambados, con y sin trabas.", "icon": "🔔", "img": "productos/Campanita.jpg", "variants": [{ "name": "Campanita", "img": "productos/Campanita.jpg" }, { "name": "Campanita con Trabas", "img": "productos/Campanita con Trabas.jpg" }] },
  { "id": 19, "name": "Carreteles", "tag": "Carreteles", "desc": "Carreteles con hilo y estructuras vacías para alambrado.", "icon": "🎥", "img": "productos/Carretel con Hilo 500 Mts.jpg", "variants": [{ "name": "Carretel con Hilo 500 mts", "img": "productos/Carretel con Hilo 500 Mts.jpg" }, { "name": "Carretel con Hilo 750 mts", "img": "productos/Carretel con Hilo 750 Mts.jpg" }, { "name": "Carretel Vacío Estructura Metal", "img": "productos/Carretel Vacio - Estructura Metal.jpg" }, { "name": "Carretel Vacío Estructura Plástica", "img": "productos/Carretel Vacio - Estructura Plastica.jpeg" }, { "name": "Trípode para Carretel", "img": "productos/Tripode para carretel.jpeg" }, { "name": "Trípode para Carretel 2", "img": "productos/Tripode para carretel 2.jpeg" }, { "name": "Trípode para Carretel 3", "img": "productos/Tripode para carretel 3.jpeg" }] },
  { "id": 22, "name": "Medidores de Batería", "tag": "General", "desc": "Medidores de batería para control eléctrico en instalaciones rurales.", "icon": "📦", "img": "productos/Medidor de bateria.jpg", "variants": [{ "name": "Medidor de Batería", "img": "productos/Medidor de bateria.jpg" }, { "name": "Medidor de Batería 1", "img": "productos/Medidor de bateria 1.jpg" }] },
  { "id": 25, "name": "Manijas Aisladas", "tag": "Aisladores", "desc": "Manijas aisladas con resorte y reforzadas para instalaciones eléctricas.", "icon": "⚡", "img": "productos/Manija Aislada Reforzada.jpg", "variants": [{ "name": "Manija Aislada con Resorte", "img": "productos/Manija Aislada con resorte.jpg" }, { "name": "Manija Aislada Reforzada", "img": "productos/Manija Aislada Reforzada.jpg" }, { "name": "Manija Puntera", "img": "productos/Manija Puntera.jpg" }] },
  { "id": 30, "name": "Pluviómetros", "tag": "Pluviometros", "desc": "Pluviómetros chico y grande para medición de lluvia.", "icon": "🌧️", "img": "productos/pluviometro grande.jpg", "variants": [{ "name": "Pluviómetro Chico", "img": "productos/pluviometro chicho.jpg" }, { "name": "Pluviómetro Grande", "img": "productos/pluviometro grande.jpg" }] },
  { "id": 32, "name": "Postes de Quebracho", "tag": "Postes", "desc": "Postes de quebracho natural y colorado para alambados y tranqueras.", "icon": "🌳", "img": "productos/Postes Quebracho.JPG", "variants": [{ "name": "Poste Quebracho", "img": "productos/Postes Quebracho.JPG" }, { "name": "Poste Quebracho 2", "img": "productos/Poste Quebracho 2.JPG" }, { "name": "Postes Quebracho 3", "img": "productos/Postes Quebracho 3.JPG" }, { "name": "Pôste Quebracho", "img": "productos/Pôste quebracho.JPG" }, { "name": "Postes de Quebracho Colorado", "img": "productos/postes de quebracho colorado.JPG" }] },
  { "id": 37, "name": "Alambre Reforzado", "tag": "General", "desc": "Alambre de acero reforzado para alambados de gran extensión.", "icon": "📦", "img": "productos/reforzada 500.jpg", "variants": [{ "name": "Alambre Reforzado 500", "img": "productos/reforzada 500.jpg" }, { "name": "Alambre Reforzado 750", "img": "productos/reforzada 750.jpg" }] },
  { "id": 39, "name": "Regulables", "tag": "Regulables", "desc": "Tensores regulables para alambados.", "icon": "🔧", "img": "productos/Regulable Ajustable.jpeg", "variants": [{ "name": "Regulable Ajustable", "img": "productos/Regulable Ajustable.jpeg" }, { "name": "Regulable con Gancho y Mariposa", "img": "productos/Regulable con Gancho y Mariposa.jpeg" }] },
  { "id": 41, "name": "Roldana Plástico", "tag": "Roldanas", "desc": "Roldana de plástico para carreteles y herramientas.", "icon": "⚙️", "img": "productos/Roldana Plastico.jpg" },
  { "id": 42, "name": "Separador Corto", "tag": "Separadores", "desc": "Separador corto para alambrados y postes.", "icon": "🔒", "img": "productos/Separador Corto.jpg" },
  { "id": 43, "name": "Terminales", "tag": "Terminales", "desc": "Terminales eléctricos livianos y reforzados para conexiones.", "icon": "🔌", "img": "productos/Terminal Liviano.jpg", "variants": [{ "name": "Terminal Liviano", "img": "productos/Terminal Liviano.jpg" }, { "name": "Terminal Reforzado", "img": "productos/Terminal Reforzado.jpg" }] },
  { "id": 45, "name": "Torniquetes", "tag": "Torniquetes", "desc": "Torniquetes Nº 8 y Nº 9, en negro y zincado. Para alambados de más de 50 mts.", "icon": "🔗", "img": "productos/Torniquete Nº8 Negro.jpg", "variants": [{ "name": "Torniquete Nº8 Negro", "img": "productos/Torniquete Nº8 Negro.jpg" }, { "name": "Torniquete Nº8 Zincado", "img": "productos/Torniquete Nº8 Zincado.jpg" }, { "name": "Torniquete Nº9 Negro", "img": "productos/Torniquete Nº9 Negro.jpeg" }, { "name": "Torniquete Nº9 Tv Zincado", "img": "productos/Torniquete Nº9Tv Zincado.jpeg" }] },
  { "id": 52, "name": "Varillas", "tag": "Varillas", "desc": "Varillas con rulos y varilla plástica para alambados.", "icon": "🌵", "img": "productos/Varilla Con 1 Rulo.jpg", "variants": [{ "name": "Varilla Con 1 Rulo", "img": "productos/Varilla Con 1 Rulo.jpg" }, { "name": "Varilla con 2 Rulos", "img": "productos/Varilla con 2 Rulos.jpg" }, { "name": "Varilla Plástica", "img": "productos/Varilla Plastica.jpg" }] },
  { "id": 55, "name": "Velas Eléctricas", "tag": "Instalacion Electrica", "desc": "Velas de encendido para instalación eléctrica rural.", "icon": "💡", "img": "productos/Velas Electrico 1.jpg", "variants": [{ "name": "Vela Eléctrico 1", "img": "productos/Velas Electrico 1.jpg" }, { "name": "Vela Eléctrico 2", "img": "productos/Velas Eletrico 2.jpg" }] },
  { "id": 57, "name": "Voltímetros", "tag": "Instalacion Electrica", "desc": "Voltímetros para control de instalaciones eléctricas en campo.", "icon": "💡", "img": "productos/Voltimetro.jpg", "variants": [{ "name": "Voltímetro", "img": "productos/Voltimetro.jpg" }, { "name": "Voltímetro 1", "img": "productos/Voltimetro 1.jpg" }] },
  { "id": 59, "name": "Bisagras para Tranquera", "tag": "Tranqueras", "desc": "Bisagras resistentes para tranqueras de campo.", "icon": "🚪", "img": "" }
];

const JWT_SECRET = process.env.JWT_SECRET || 'metagro-secret-fallback';
const ADMIN_USER = process.env.ADMIN_USER || 'metagro';
const ADMIN_PASS = process.env.ADMIN_PASS || 'montealegre22';

function defaultResJson(products) {
  return products.map(p => ({ ...p, images: Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []) }));
}

export default function handler(req, res) {
  corsMiddleware(req, res, () => {
    (async () => {
      const method = req.method || 'GET';
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      // Login
      if (pathname === '/api/admin/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { username, password } = JSON.parse(body);
            if (username !== ADMIN_USER || password !== ADMIN_PASS) {
              return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            const token = jwt.sign({ role: 'admin', user: ADMIN_USER }, JWT_SECRET, { expiresIn: '8h' });
            res.status(200).json({ token });
          } catch (e) {
            res.status(400).json({ error: 'Bad request' });
          }
        });
        return;
      }

      // Auth check helper
      const isAuth = () => {
        const header = req.headers['x-mg-token'] || '';
        if (!header) return false;
        if (header === process.env.MG_TOKEN) return true;
        try {
          jwt.verify(header, JWT_SECRET);
          return true;
        } catch (e) {
          return false;
        }
      };

      if (!isAuth()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Products list / backup download
      if (pathname === '/api/products' && method === 'GET') {
        return res.status(200).json(defaultResJson(DEFAULT_PRODUCTS));
      }

      // Create product
      if (pathname === '/api/products' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const images = Array.isArray(data.images) ? data.images.filter(Boolean) : (data.img ? [data.img] : []);
            const product = { id: Date.now(), ...data, images };
            if (!product.img && product.images.length) product.img = product.images[0];
            res.status(201).json(product);
          } catch (e) {
            res.status(400).json({ error: 'Bad request' });
          }
        });
        return;
      }

      // Update product
      const putMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (putMatch && method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const images = Array.isArray(data.images) ? data.images.filter(Boolean) : (data.img ? [data.img] : []);
            const product = { ...data, id: parseInt(putMatch[1]), images };
            if (!product.img && product.images.length) product.img = product.images[0];
            res.status(200).json(product);
          } catch (e) {
            res.status(400).json({ error: 'Bad request' });
          }
        });
        return;
      }

      // Delete product
      const delMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (delMatch && method === 'DELETE') {
        return res.status(200).json({ ok: true });
      }

      // Backup download
      if (pathname === '/api/backup' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=metagro-products.json');
        return res.status(200).json(defaultResJson(DEFAULT_PRODUCTS));
      }

      // Backup restore
      if (pathname === '/api/backup' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            res.status(200).json({ ok: true, count: Array.isArray(data) ? data.length : 0 });
          } catch (e) {
            res.status(400).json({ error: 'Bad request' });
          }
        });
        return;
      }

      res.status(404).json({ error: 'Not found' });
    })();
  });
}
