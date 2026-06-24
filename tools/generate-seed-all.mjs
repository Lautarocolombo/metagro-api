import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const productosDir = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/productos';
const outputFile = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/sql/seed-productos-all.sql';

const files = readdirSync(productosDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

const lines = ['BEGIN;'];
let id = 1;

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '');
  const categoria = detectCategory(name);
  const safeName = name.replace(/'/g, "''");
  const safeFile = file.replace(/'/g, "''");
  
  lines.push(`INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (${id}, '${categoria}', '${safeName}', '${safeName}', '${safeName}', 'productos/${safeFile}') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;`);
  id++;
}

lines.push('COMMIT;');

import { writeFileSync } from 'fs';
writeFileSync(outputFile, lines.join('\n'));
console.log(`Generados ${files.length} productos en ${outputFile}`);

function detectCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('aislador') || n.includes('manija') || n.includes('arreador')) return 'Aisladores';
  if (n.includes('buje') || n.includes('acople') || n.includes('adaptador') || n.includes('niple') || n.includes('cupla') || n.includes('caño') || n.includes('caños') || n.includes('esfera') || n.includes('esclusa')) return 'Accesorios';
  if (n.includes('cable') || n.includes('prensa')) return 'Cables';
  if (n.includes('cadena')) return 'Cadenas';
  if (n.includes('campana') || n.includes('campanita')) return 'Campanitas';
  if (n.includes('carretel')) return 'Carreteles';
  if (n.includes('torniquete')) return 'Torniquetes';
  if (n.includes('poste') || n.includes('quebracho')) return 'Postes';
  if (n.includes('bobina') || n.includes('reforzada')) return 'Bobinas';
  if (n.includes('regulable')) return 'Regulables';
  if (n.includes('roldana')) return 'Roldanas';
  if (n.includes('separador')) return 'Separadores';
  if (n.includes('terminal')) return 'Terminales';
  if (n.includes('varilla')) return 'Varillas';
  if (n.includes('bebedero')) return 'Bebederos';
  if (n.includes('medidor') || n.includes('bateria')) return 'Medidores';
  if (n.includes('pluvio')) return 'Pluviometros';
  if (n.includes('vela') || n.includes('encendido')) return 'Instalacion Electrica';
  if (n.includes('voltimetro')) return 'Instalacion Electrica';
  if (n.includes('tapon') || n.includes('goma')) return 'Accesorios';
  if (n.includes('tarugo') || n.includes('fischer')) return 'Accesorios';
  if (n.includes('bulon') || n.includes('tornillo') || n.includes('tuerca') || n.includes('arandela')) return 'Bulonería';
  if (n.includes('gancho') || n.includes('grillete') || n.includes('guardacabo') || n.includes('eslabon')) return 'Accesorios';
  if (n.includes('llave') || n.includes('esferica')) return 'Llaves';
  if (n.includes('valvula') || n.includes('válvula')) return 'Válvulas';
  if (n.includes('tripode')) return 'Carreteles';
  if (n.includes('estiradora')) return 'Maquinaria';
  return 'General';
}
