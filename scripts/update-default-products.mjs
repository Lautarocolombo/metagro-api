import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/index.html';
const content = readFileSync(indexPath, 'utf8');

const seedProducts = [
  { id: 1, name: '08 10 Estiradora', tag: 'Maquinaria', img: 'productos/08-10-estiradora.jpg' },
  { id: 2, name: 'Aislador W', tag: 'Aisladores', img: 'productos/Aislador W.jpg' },
  { id: 3, name: 'Arreadores', tag: 'Arreadores', img: 'productos/Arreador b.jpeg' },
  { id: 11, name: 'Bebedero Cemento', tag: 'Bebederos', img: 'productos/bebederos cemento.JPG' },
  { id: 12, name: 'Bobinas Electropiolín', tag: 'Bobinas', img: 'productos/bobina 1000.jpg' },
  { id: 16, name: 'Cable Subterráneo Rolin 1.8mm', tag: 'Cables', img: 'productos/Cable subterraneo Rolin 1.8mm.jpg' },
  { id: 17, name: 'Campanitas', tag: 'Campanitas', img: 'productos/Campanita.jpg' },
  { id: 19, name: 'Carreteles', tag: 'Carreteles', img: 'productos/Carretel con Hilo 500 Mts.jpg' },
  { id: 22, name: 'Medidores de Batería', tag: 'General', img: 'productos/Medidor de bateria.jpg' },
  { id: 25, name: 'Manijas Aisladas', tag: 'Aisladores', img: 'productos/Manija Aislada Reforzada.jpg' },
  { id: 28, name: 'Medidores de Batería 1', tag: 'General', img: 'productos/Medidor de bateria 1.jpg' },
  { id: 30, name: 'Pluviómetros', tag: 'Pluviometros', img: 'productos/pluviometro grande.jpg' },
  { id: 32, name: 'Postes de Quebracho', tag: 'Postes', img: 'productos/Postes Quebracho.JPG' },
  { id: 37, name: 'Alambre Reforzado', tag: 'General', img: 'productos/reforzada 500.jpg' },
  { id: 39, name: 'Regulables', tag: 'Regulables', img: 'productos/Regulable Ajustable.jpeg' },
  { id: 41, name: 'Roldana Plástico', tag: 'Roldanas', img: 'productos/Roldana Plastico.jpg' },
  { id: 42, name: 'Separador Corto', tag: 'Separadores', img: 'productos/Separador Corto.jpg' },
  { id: 43, name: 'Terminales', tag: 'Terminales', img: 'productos/Terminal Liviano.jpg' },
  { id: 45, name: 'Torniquetes', tag: 'Torniquetes', img: 'productos/Torniquete Nº8 Negro.jpg' },
  { id: 52, name: 'Varillas', tag: 'Varillas', img: 'productos/Varilla Con 1 Rulo.jpg' },
  { id: 55, name: 'Velas Eléctricas', tag: 'Instalacion Electrica', img: 'productos/Velas Electrico 1.jpg' },
  { id: 57, name: 'Voltímetros', tag: 'Instalacion Electrica', img: 'productos/Voltimetro.jpg' },
];

const defaultMatch = content.match(/window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\];/);
if (!defaultMatch) {
  console.error('No se encontró DEFAULT_PRODUCTS');
  process.exit(1);
}

let productsStr = defaultMatch[1];

for (const seed of seedProducts) {
  const id = seed.id;
  const newProduct = `{
    "id": ${id},
    "name": "${seed.name}",
    "tag": "${seed.tag}",
    "desc": "",
    "icon": "",
    "img": "${seed.img}",
    "imagen_url": "${seed.img}",
    "images": [
      "${seed.img}"
    ]
  }`;
  
  // Buscar el producto con el mismo ID
  const idPattern = new RegExp(`\\{\\s*"id":\\s*${id},[\\s\\S]*?\\n\\s*\\},`, '');
  const existingMatch = productsStr.match(idPattern);
  
  if (existingMatch) {
    // Reemplazar el producto existente
    productsStr = productsStr.replace(idPattern, newProduct);
    console.log(`Actualizado ID ${id}: ${seed.name}`);
  } else {
    // Buscar el último } del array y agregar antes
    const lastBracket = productsStr.lastIndexOf('},');
    if (lastBracket !== -1) {
      productsStr = productsStr.slice(0, lastBracket + 1) + ',\n  ' + newProduct + productsStr.slice(lastBracket + 1);
      console.log(`Agregado ID ${id}: ${seed.name}`);
    }
  }
}

const newContent = content.replace(
  /window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\];/,
  `window.DEFAULT_PRODUCTS = [${productsStr}];`
);

writeFileSync(indexPath, newContent);
console.log('DEFAULT_PRODUCTS actualizado correctamente');
