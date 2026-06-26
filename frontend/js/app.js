// Usar la misma URL del dominio en producci�n (Vercel) para que /api/* apunte al backend desplegado aqu�.
const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000/api'
    : (window.METAGRO_API_BASE || `${window.location.origin}/api`);

window.DEFAULT_PRODUCTS = [
  {
    "id": 1,
    "name": "A - Rosca Hembra 2",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/A - Rosca Hembra 2.jpg"
  },
  {
    "id": 2,
    "name": "Acople Rapido a palanca aluminio",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Acople Rapido a palanca aluminio.jpg"
  },
  {
    "id": 3,
    "name": "Acople rapido con palanca plastico - copia",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Acople-rapido-palanca-plastico-copia.jpg"
  },
  {
    "id": 4,
    "name": "Adaptador BIN",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Adaptador BIN.jpeg"
  },
  {
    "id": 5,
    "name": "Aislador W",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Aislador W.jpg"
  },
  {
    "id": 6,
    "name": "Arandela Grower",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arandela Grower.jpeg"
  },
  {
    "id": 7,
    "name": "Arandela plana Zincada",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arandela plana Zincada.jpg"
  },
  {
    "id": 8,
    "name": "Arreador b",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador b.jpeg"
  },
  {
    "id": 9,
    "name": "Arreador con pilas",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador con pilas.jpeg"
  },
  {
    "id": 10,
    "name": "Arreador corto y largo",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador corto y largo.jpeg"
  },
  {
    "id": 11,
    "name": "Arreador mango",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador mango.jpg"
  },
  {
    "id": 12,
    "name": "Arreador puas",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador puas.jpg"
  },
  {
    "id": 13,
    "name": "Arreador Tapa Roscada b",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador Tapa Roscada b.jpg"
  },
  {
    "id": 14,
    "name": "Arreador",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arreador.jpg"
  },
  {
    "id": 15,
    "name": "Arredor Tapa roscada",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Arredor Tapa roscada.jpg"
  },
  {
    "id": 16,
    "name": "Autoperforante Madera",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Autoperforante Madera.jpg"
  },
  {
    "id": 17,
    "name": "Autoperforante Metal",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Autoperforante Metal.jpeg"
  },
  {
    "id": 18,
    "name": "B - Rosca Macho a Palanca 3",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/B - Rosca Macho a Palanca 3.jpg"
  },
  {
    "id": 19,
    "name": "bebederos cemento",
    "tag": "Bebederos",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/bebederos cemento.JPG"
  },
  {
    "id": 20,
    "name": "Blanca 1",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Blanca 1.jpg"
  },
  {
    "id": 21,
    "name": "Blanca 2",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Blanca 2.jpg"
  },
  {
    "id": 22,
    "name": "bobina 1000",
    "tag": "Bobinas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/bobina 1000.jpg"
  },
  {
    "id": 23,
    "name": "bobina 250",
    "tag": "Bobinas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/bobina 250.jpg"
  },
  {
    "id": 24,
    "name": "bobina 500",
    "tag": "Bobinas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/bobina 500.jpg"
  },
  {
    "id": 25,
    "name": "bobina 750",
    "tag": "Bobinas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/bobina 750.jpg"
  },
  {
    "id": 26,
    "name": "Buje reduccion",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Buje reduccion.jpg"
  },
  {
    "id": 27,
    "name": "Bulon Cabeza Hexagonal Dorado",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Bulon Cabeza Hexagonal Dorado.jpg"
  },
  {
    "id": 28,
    "name": "Bulon Cabeza Hexagonal",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Bulon Cabeza Hexagonal.jpg"
  },
  {
    "id": 29,
    "name": "Bulon Cabeza Redonda",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Bulon Cabeza Redonda.jpeg"
  },
  {
    "id": 30,
    "name": "C - Espiga a Palanca 3",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/C - Espiga a Palanca 3.jpg"
  },
  {
    "id": 31,
    "name": "Cable Dogo",
    "tag": "Cables",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Cable Dogo.jpg"
  },
  {
    "id": 32,
    "name": "Cable subterraneo Rolin 1.8mm",
    "tag": "Cables",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Cable subterraneo Rolin 1.8mm.jpg"
  },
  {
    "id": 33,
    "name": "Cable",
    "tag": "Cables",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Cable.jpeg"
  },
  {
    "id": 34,
    "name": "CAdena Balde 2",
    "tag": "Cadenas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/CAdena Balde 2.jpg"
  },
  {
    "id": 35,
    "name": "CAdena Balde",
    "tag": "Cadenas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/CAdena Balde.jpg"
  },
  {
    "id": 36,
    "name": "CAdena",
    "tag": "Cadenas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/CAdena.jpg"
  },
  {
    "id": 37,
    "name": "Campanita con Trabas",
    "tag": "Campanitas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Campanita con Trabas.jpg"
  },
  {
    "id": 38,
    "name": "Campanita",
    "tag": "Campanitas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Campanita.jpg"
  },
  {
    "id": 39,
    "name": "Carretel con Hilo 500 Mts",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Carretel con Hilo 500 Mts.jpg"
  },
  {
    "id": 40,
    "name": "Carretel con Hilo 750 Mts",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Carretel con Hilo 750 Mts.jpg"
  },
  {
    "id": 41,
    "name": "Carretel Vacio - Estructura Metal",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Carretel Vacio - Estructura Metal.jpg"
  },
  {
    "id": 42,
    "name": "Carretel Vacio - Estructura Plastica",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Carretel Vacio - Estructura Plastica.jpeg"
  },
  {
    "id": 43,
    "name": "Caños Galvanizados",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Caños Galvanizados.jpg"
  },
  {
    "id": 44,
    "name": "Cupla",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Cupla.jpg"
  },
  {
    "id": 45,
    "name": "D - Rosca Hembra Palanca",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/D - Rosca Hembra Palanca.jpg"
  },
  {
    "id": 46,
    "name": "E - Espiga  2",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/E - Espiga  2.jpg"
  },
  {
    "id": 47,
    "name": "Entre rosca",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Entre rosca.jpg"
  },
  {
    "id": 48,
    "name": "Esclusa 2 Pulgadas",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Esclusa 2 Pulgadas.jpeg"
  },
  {
    "id": 49,
    "name": "Esclusa 3 Pulgadas",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Esclusa 3 Pulgadas.jpeg"
  },
  {
    "id": 50,
    "name": "Esferica Mariposa",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Esferica Mariposa.jpg"
  },
  {
    "id": 51,
    "name": "Eslabon abierto",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Eslabon abierto.jpg"
  },
  {
    "id": 52,
    "name": "Gancho - Ojo",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Gancho - Ojo.jpg"
  },
  {
    "id": 53,
    "name": "GAncho J Estira Tejido",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/GAncho J Estira Tejido.jpg"
  },
  {
    "id": 54,
    "name": "Grillete corazon 1",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Grillete corazon 1.jpg"
  },
  {
    "id": 55,
    "name": "Grillete Recto",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Grillete Recto.jpg"
  },
  {
    "id": 56,
    "name": "Guardacabo",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Guardacabo.jpg"
  },
  {
    "id": 57,
    "name": "Llave ESferica 2",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave ESferica 2.jpg"
  },
  {
    "id": 58,
    "name": "Llave ESferica Plastica 2",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave ESferica Plastica 2.jpg"
  },
  {
    "id": 59,
    "name": "Llave ESferica Plastica 3",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave ESferica Plastica 3.jpg"
  },
  {
    "id": 60,
    "name": "Llave ESferica Plastica 4",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave ESferica Plastica 4.jpg"
  },
  {
    "id": 61,
    "name": "Llave ESferica Plastica Duke",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave ESferica Plastica Duke.jpg"
  },
  {
    "id": 62,
    "name": "Llave ESferica Plastica",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave ESferica Plastica.jpg"
  },
  {
    "id": 63,
    "name": "Llave Esferica",
    "tag": "Llaves",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Llave Esferica.jpg"
  },
  {
    "id": 64,
    "name": "Manija Aislada con resorte",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Manija Aislada con resorte.jpg"
  },
  {
    "id": 65,
    "name": "Manija Aislada Reforzada",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Manija Aislada Reforzada.jpg"
  },
  {
    "id": 66,
    "name": "Manija Puntera",
    "tag": "Aisladores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Manija Puntera.jpg"
  },
  {
    "id": 67,
    "name": "Medidor de bateria 1",
    "tag": "Medidores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Medidor de bateria 1.jpg"
  },
  {
    "id": 68,
    "name": "Medidor de bateria",
    "tag": "Medidores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Medidor de bateria.jpg"
  },
  {
    "id": 69,
    "name": "Modelo A - Rosca Hembra",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Modelo A - Rosca Hembra.jpg"
  },
  {
    "id": 70,
    "name": "Modelo C - Espiga",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Modelo C - Espiga.jpg"
  },
  {
    "id": 71,
    "name": "Modelo D - Rosca  Hembra",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Modelo D - Rosca  Hembra.jpg"
  },
  {
    "id": 72,
    "name": "Modelo E - Eespiga",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Modelo E - Eespiga.jpg"
  },
  {
    "id": 73,
    "name": "Niple Galvanizados 2",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Niple Galvanizados 2.jpg"
  },
  {
    "id": 74,
    "name": "Niple Galvanizados",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Niple Galvanizados.jpg"
  },
  {
    "id": 75,
    "name": "Plastica",
    "tag": "General",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Plastica.jpg"
  },
  {
    "id": 76,
    "name": "pluviometro chicho",
    "tag": "Pluviometros",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/pluviometro chicho.jpg"
  },
  {
    "id": 77,
    "name": "pluviometro grande",
    "tag": "Pluviometros",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/pluviometro grande.jpg"
  },
  {
    "id": 78,
    "name": "Poste Quebracho 2",
    "tag": "Postes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Poste Quebracho.JPG"
  },
  {
    "id": 79,
    "name": "Poste Quebracho",
    "tag": "Postes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Poste Quebracho-79.JPG"
  },
  {
    "id": 80,
    "name": "postes de quebracho colorado",
    "tag": "Postes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/postes de quebracho colorado.JPG"
  },
  {
    "id": 81,
    "name": "Postes Quebracho 3",
    "tag": "Postes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Postes Quebracho 3.JPG"
  },
  {
    "id": 82,
    "name": "Postes Quebracho",
    "tag": "Postes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Postes Quebracho.JPG"
  },
  {
    "id": 83,
    "name": "Prensa Cable",
    "tag": "Cables",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Prensa Cable.jpg"
  },
  {
    "id": 84,
    "name": "Pôste quebracho",
    "tag": "Postes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/P-ste-quebracho-84.JPG"
  },
  {
    "id": 85,
    "name": "reforzada 500",
    "tag": "Bobinas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/reforzada 500.jpg"
  },
  {
    "id": 86,
    "name": "reforzada 750",
    "tag": "Bobinas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/reforzada 750.jpg"
  },
  {
    "id": 87,
    "name": "Regulable Ajustable",
    "tag": "Regulables",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Regulable Ajustable.jpeg"
  },
  {
    "id": 88,
    "name": "Regulable con Gancho y Mariposa",
    "tag": "Regulables",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Regulable con Gancho y Mariposa.jpeg"
  },
  {
    "id": 89,
    "name": "Roldana Plastico",
    "tag": "Roldanas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Roldana Plastico.jpg"
  },
  {
    "id": 90,
    "name": "Separador Corto",
    "tag": "Separadores",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Separador Corto.jpg"
  },
  {
    "id": 91,
    "name": "Tapon Goma 2",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tapon Goma 2.jpg"
  },
  {
    "id": 92,
    "name": "Tapon Goma 3",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tapon Goma 3.jpg"
  },
  {
    "id": 93,
    "name": "Tapon Goma",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tapon Goma.jpg"
  },
  {
    "id": 94,
    "name": "Tarugo fischer 10 hueco solo",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tarugo fischer 10 hueco solo.jpg"
  },
  {
    "id": 95,
    "name": "tarugo fischer con balde",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/tarugo fischer con balde.jpg"
  },
  {
    "id": 96,
    "name": "tarugo fischer Nº6 x 30 caja",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/tarugo fischer Nº6 x 30 caja.jpg"
  },
  {
    "id": 97,
    "name": "Terminal Liviano",
    "tag": "Terminales",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Terminal Liviano.jpg"
  },
  {
    "id": 98,
    "name": "Terminal Reforzado",
    "tag": "Terminales",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Terminal Reforzado.jpg"
  },
  {
    "id": 99,
    "name": "todos los acoples y adaptadores",
    "tag": "Accesorios",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/todos los acoples y adaptadores.jpg"
  },
  {
    "id": 100,
    "name": "Tornillos tirafondo",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tornillos tirafondo.jpg"
  },
  {
    "id": 101,
    "name": "Torniquete Nº8 Negro",
    "tag": "Torniquetes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Torniquete Nº8 Negro.jpg"
  },
  {
    "id": 102,
    "name": "Torniquete Nº8 Zincado",
    "tag": "Torniquetes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Torniquete Nº8 Zincado.jpg"
  },
  {
    "id": 103,
    "name": "Torniquete Nº9 Negro",
    "tag": "Torniquetes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Torniquete Nº9 Negro.jpeg"
  },
  {
    "id": 104,
    "name": "Torniquete Nº9Tv Zincado",
    "tag": "Torniquetes",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Torniquete Nº9Tv Zincado.jpeg"
  },
  {
    "id": 105,
    "name": "Tripode para carretel 2",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tripode para carretel 2.jpeg"
  },
  {
    "id": 106,
    "name": "Tripode para carretel 3",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tripode para carretel 3.jpeg"
  },
  {
    "id": 107,
    "name": "Tripode para carretel",
    "tag": "Carreteles",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tripode para carretel.jpeg"
  },
  {
    "id": 108,
    "name": "Tuerca Zincada",
    "tag": "Bulonería",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Tuerca Zincada.jpg"
  },
  {
    "id": 109,
    "name": "Valvula Flotante 2",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Flotante 2.jpg"
  },
  {
    "id": 110,
    "name": "Valvula flotante Plastica",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula flotante Plastica.jpg"
  },
  {
    "id": 111,
    "name": "Valvula Flotante",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Flotante.jpg"
  },
  {
    "id": 112,
    "name": "Valvula Foglia",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Foglia.png"
  },
  {
    "id": 113,
    "name": "Valvula Fundicion completa",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Fundicion completa.jpg"
  },
  {
    "id": 114,
    "name": "Valvula Fundicion",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Fundicion.jpg"
  },
  {
    "id": 115,
    "name": "Valvula Hansen",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Hansen.jpg"
  },
  {
    "id": 116,
    "name": "Valvula Hierro Verde sola a",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Valvula Hierro Verde sola a.png"
  },
  {
    "id": 117,
    "name": "valvula Plastica completa roja",
    "tag": "Válvulas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/valvula Plastica completa roja.jpg"
  },
  {
    "id": 118,
    "name": "Varilla Con 1 Rulo",
    "tag": "Varillas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Varilla Con 1 Rulo.jpg"
  },
  {
    "id": 119,
    "name": "Varilla con 2 Rulos",
    "tag": "Varillas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Varilla con 2 Rulos.jpg"
  },
  {
    "id": 120,
    "name": "Varilla Galvanizada",
    "tag": "Varillas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Varilla Galvanizada.JPG"
  },
  {
    "id": 121,
    "name": "Varilla Plastica",
    "tag": "Varillas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Varilla Plastica.jpg"
  },
  {
    "id": 122,
    "name": "Varilla Roscada",
    "tag": "Varillas",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Varilla Roscada.jpg"
  },
  {
    "id": 123,
    "name": "Velas Electrico 1",
    "tag": "Instalacion Electrica",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Velas Electrico 1.jpg"
  },
  {
    "id": 124,
    "name": "Velas Eletrico 2",
    "tag": "Instalacion Electrica",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Velas Eletrico 2.jpg"
  },
  {
    "id": 125,
    "name": "Voltimetro 1",
    "tag": "Instalacion Electrica",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Voltimetro 1.jpg"
  },
  {
    "id": 126,
    "name": "Voltimetro",
    "tag": "Instalacion Electrica",
    "desc": "Consultá disponibilidad y precio en Metagro SRL.",
    "img": "productos/Voltimetro.jpg"
  }
];

let products = [];
let useApi = true;
let hasUnsavedChanges = false;
let originalProducts = [];
let currentPage = 1;
const itemsPerPage = 24;

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function encodeImgPath(path) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = sessionStorage.getItem('mg_admin_token');
  if (token) headers['x-mg-token'] = token;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res;
}

function showError(message) {
  const el = document.getElementById('app-error');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.app-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function renderSkeletons(count = 6) {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }).map(() => `
    <div class="cat-card cat-card--skeleton">
      <div class="cat-img-placeholder cat-img-placeholder--skeleton"></div>
      <div class="cat-body">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--text"></div>
        <div class="skeleton-line skeleton-line--tag"></div>
      </div>
    </div>
  `).join('');
}

function normalizeProducts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(p => {
    const imgMain = p.img || p.imagen_url || p.imagen || '';
    const imgs = Array.isArray(p.images) && p.images.length
      ? p.images
      : (imgMain ? [imgMain] : []);
    return {
      id:         p.id ?? null,
      name:       p.name || p.nombre || '',
      tag:        p.tag || p.categoria || p.category || 'General',
      desc:       p.desc || p.descripcion || p.description || 'Consultá disponibilidad y precio en Metagro SRL.',
      icon:       p.icon || '',
      img:        imgMain,
      imagen_url: p.imagen_url || imgMain,
      images:     imgs
    };
  }).filter(p => p.id !== null);
}

async function fetchProducts() {
  if (!useApi) return;
  renderSkeletons();
  try {
    const res = await api('/products');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      products = normalizeProducts(data);
      localStorage.setItem('mg_products', JSON.stringify(products));
    } else if (!data || !data.length) {
      const saved = localStorage.getItem('mg_products');
      if (saved) { try { products = JSON.parse(saved); } catch (e) { /* localStorage corrupto, ignorar */ } }
      if (!products.length) products = [...(window.DEFAULT_PRODUCTS || [])];
    }
  } catch (e) {
    useApi = false;
    const saved = localStorage.getItem('mg_products');
    if (saved) { try { products = JSON.parse(saved); } catch (e) {} }
    if (!products.length) products = [...(window.DEFAULT_PRODUCTS || [])];
    showError('No se pudo cargar el cat�logo. Se mostrar�n los productos guardados.');
    const bar = document.getElementById('api-status-bar');
    if (bar) bar.classList.add('show');
  } finally {
    populateCategoryFilter();
    renderCatalog();
  }
}

function localFallback() {
  try {
    const raw = localStorage.getItem('mg_products');
    if (raw) products = JSON.parse(raw);
  } catch (e) {
    products = [];
  }
}

function saveLocal() {
  localStorage.setItem('mg_products', JSON.stringify(products));
}

function populateCategoryFilter() {
  const sel = document.getElementById('cat-filter');
  if (!sel) return;
  const current = sel.value;
  const set = new Set(products.map(p => (p.tag || '').trim()).filter(Boolean));
  const cats = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  sel.innerHTML = '<option value="__all__">Todas las categor�as</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  sel.value = cats.includes(current) ? current : '__all__';
}

function getSelectedProducts() {
  const q = (document.getElementById('cat-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('cat-filter')?.value || '__all__';
  const filtered = products
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      const tag = (p.tag || '').toLowerCase();
      const matchesQ = !q || name.includes(q) || desc.includes(q) || tag.includes(q);
      const matchesCat = cat === '__all__' || (p.tag || '') === cat;
      return matchesQ && matchesCat;
    });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * itemsPerPage;
  const paged = filtered.slice(start, start + itemsPerPage);
  return { items: paged, total, totalPages, page: currentPage };
}

function renderCatalog() {
  const totalEl = document.getElementById('prod-total-display');
  const filtered = getSelectedProducts();
  if (totalEl && products.length) {
    totalEl.style.display = 'block';
    totalEl.textContent = `${filtered.items.length} de ${filtered.total} productos`;
  }
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  const items = filtered.items;
  if (!items.length) {
    grid.innerHTML = '<div class="cat-empty">No se encontraron productos.</div>';
    return;
  }
  grid.innerHTML = items.map(({ p, i }) => {
    const allImages = Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []);
    const mainImg = allImages[0] || '';
    const hasImg = !!mainImg;
    const descClean = (p.desc || '')
      .split(/\r?\n/)
      .map(line => line.split(' | ').pop() || line)
      .map(line => line.trim())
      .filter(line => line && line !== (p.tag || '') && line !== (p.name || ''));
    const descHtml = descClean.length
      ? `<div class="cat-desc">${escapeHtml(descClean.join('\n'))}</div>`
      : '';
    const iconSafe = escapeHtml(p.icon || '??');
    const imgOnError = hasImg ? ` onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\\'cat-icon-fallback\\'>${iconSafe}</span>')"` : '';
    const thumbs = allImages.slice(1).map(src => `<img src="${encodeImgPath(src)}" alt="" loading="lazy" />`).join('');
    return `
    <div class="cat-card" data-index="${i}">
      <div class="cat-img-placeholder${hasImg ? '' : ' cat-img-placeholder--noimg'}">
        ${hasImg ? `<img src="${encodeImgPath(mainImg)}" loading="lazy" fetchpriority="low" decoding="async" alt="${escapeHtml(p.name || '')}"${imgOnError} />` : `<span class="cat-icon-fallback">${iconSafe}</span>`}
      </div>
      ${thumbs ? `<div class="cat-variants">${thumbs}</div>` : ''}
      <div class="cat-body">
        <div class="cat-name">${escapeHtml(p.name)}</div>
        ${descHtml}
        <span class="cat-tag">${escapeHtml(p.tag)}</span>
      </div>
    </div>
  `;}).join('');

  const paginationEl = document.getElementById('cat-pagination');
  if (paginationEl) {
    if (filtered.totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    let html = '<div class="cat-pagination">';
    html += `<button class="cat-page-btn" ${filtered.page === 1 ? 'disabled' : ''} onclick="goToPage(${filtered.page - 1})">« Anterior</button>`;
    html += `<span class="cat-page-info">Página ${filtered.page} de ${filtered.totalPages}</span>`;
    html += `<button class="cat-page-btn" ${filtered.page === filtered.totalPages ? 'disabled' : ''} onclick="goToPage(${filtered.page + 1})">Siguiente »</button>`;
    html += '</div>';
    paginationEl.innerHTML = html;
  }
}

function goToPage(page) {
  currentPage = page;
  renderCatalog();
  const grid = document.getElementById('cat-grid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleMenu() {
  const menu = document.getElementById('navLinks');
  menu.classList.toggle('open');
}

document.querySelectorAll('.navbar-menu .menu-link').forEach(link => {
  link.addEventListener('click', () => {
    const menu = document.getElementById('navLinks');
    if (menu.classList.contains('open')) menu.classList.remove('open');
  });
});

const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.menu-link')

function updateActiveNav() {
  let current = ''
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top
    if (top <= 140) current = section.getAttribute('id')
  })
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`)
  })
}
window.addEventListener('scroll', updateActiveNav, { passive: true })

function renderAdminProducts() {
  const countEl = document.getElementById('prod-count-bar');
  if (countEl) countEl.textContent = products.length + ' productos cargados';
  const grid = document.getElementById('admin-prod-grid');
  if (!grid) return;
  grid.innerHTML = products.map((p, i) => `
    <div class="admin-prod-card" data-index="${i}">
      <div class="admin-prod-card-header">
        <span class="admin-prod-card-title">${escapeHtml(p.name || 'Sin nombre')}</span>
        <button class="btn-del" aria-label="Eliminar producto" onclick="deleteProduct(${i})" title="Eliminar">?</button>
      </div>
      <div class="admin-prod-card-body">
        <label class="admin-label">Nombre</label>
        <input class="admin-input" data-field="name" value="${escapeHtml(p.name || '')}" onchange="updateAdminProduct(${i},'name',this.value)" />
        <label class="admin-label">Categor�a</label>
        <input class="admin-input" data-field="tag" value="${escapeHtml(p.tag || '')}" onchange="updateAdminProduct(${i},'tag',this.value)" />
        <label class="admin-label">Descripci�n</label>
        <textarea class="admin-textarea" data-field="desc" onchange="updateAdminProduct(${i},'desc',this.value)">${escapeHtml(p.desc || '')}</textarea>
        <label class="admin-label">Imagen (ruta o base64)</label>
        <input class="admin-input" data-field="img" value="${escapeHtml(p.img || '')}" onchange="updateAdminProduct(${i},'img',this.value)" placeholder="productos/foto.jpg" />
        <div class="img-preview-wrap" onclick="this.querySelector('input').click()">
          ${p.img ? `<img src="${p.img}" alt="preview" />` : '<span style="color:#555;font-size:.8rem">Sin imagen</span>'}
          <input type="file" accept="image/*" class="file-input-hidden" onchange="handleAdminImage(this, ${i})" />
        </div>
        <span class="img-preview-label">Clic para cambiar imagen</span>
      </div>
    </div>
  `).join('');
}

function updateAdminProduct(index, field, value) {
  if (products[index]) {
    products[index][field] = value;
    hasUnsavedChanges = true;
    updateUnsavedIndicator();
  }
}

async function deleteProduct(index) {
  if (!confirm('�Borrar este producto?')) return;
  const p = products[index];
  if (!p) return;
  if (p.id && originalProducts.find(op => op.id === p.id)) {
    try {
      await api(`/products/${p.id}`, { method: 'DELETE' });
    } catch(e) {
      showToast('No se pudo eliminar del servidor. Se elimin� localmente.', 'error');
    }
  }
  originalProducts = originalProducts.filter(op => op.id !== p.id);
  products.splice(index, 1);
  hasUnsavedChanges = false;
  saveLocal();
  populateCategoryFilter();
  renderAdminProducts();
  renderCatalog();
  showToast('Producto eliminado');
}

function addProduct() {
  const newP = { id: Date.now(), name: 'Producto nuevo', tag: 'General', desc: '', icon: '🤝', img: '' };
  products.push(newP);
  hasUnsavedChanges = true;
  updateUnsavedIndicator();
  saveLocal();
  populateCategoryFilter();
  renderAdminProducts();
  renderCatalog();
  document.getElementById('admin-prod-grid').scrollTop = document.getElementById('admin-prod-grid').scrollHeight;
}

async function handleAdminImage(input, index) {
  const file = input.files[0];
  if (!file) return;
  try {
    const base64 = await compressImage(file);
    if (products[index]) {
      products[index].img = base64;
      hasUnsavedChanges = true;
      updateUnsavedIndicator();
      saveLocal();
      renderAdminProducts();
      renderCatalog();
    }
  } catch (err) {
    showToast('Error al procesar la imagen', 'error');
  }
}

function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function saveProducts() {
  const invalid = products.filter(p => !p.name || !p.name.trim());
  if (invalid.length > 0) {
    showToast(invalid.length + ' producto(s) sin nombre. Correg� antes de guardar.', 'error');
    return;
  }
  saveLocal();
  let created = 0, updated = 0, deleted = 0;
  try {
    const currentIds = new Set(products.map(p => p.id).filter(Boolean));
    const originalIds = new Set(originalProducts.map(p => p.id).filter(Boolean));
    for (const p of products) {
      if (!p.id || !originalIds.has(p.id)) {
        const res = await api('/products', { method: 'POST', body: JSON.stringify(p) });
        const saved = await res.json();
        if (saved.id) p.id = saved.id;
        created++;
      } else {
        const orig = originalProducts.find(op => op.id === p.id);
        if (orig && JSON.stringify(orig) !== JSON.stringify(p)) {
          await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });
          updated++;
        }
      }
    }
    for (const p of originalProducts) {
      if (p.id && !currentIds.has(p.id)) {
        await api(`/products/${p.id}`, { method: 'DELETE' });
        deleted++;
      }
    }
    originalProducts = JSON.parse(JSON.stringify(products));
  } catch(e) {
    showError('Error al guardar en el servidor: ' + e.message);
  }
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  saveLocal();
  const parts = [];
  if (created) parts.push(created + ' creados');
  if (updated) parts.push(updated + ' actualizados');
  if (deleted) parts.push(deleted + ' eliminados');
  const msg = parts.length ? '? ' + parts.join(', ') : '? Sin cambios pendientes';
  showToast(msg);
  const msgEl = document.getElementById('save-msg-prod');
  if (msgEl) { msgEl.textContent = msg; msgEl.classList.add('show'); setTimeout(() => msgEl.classList.remove('show'), 3000); }
  populateCategoryFilter();
  renderCatalog();
}

async function openBulkUpload() {
  document.getElementById('bulk-zone').style.display = 'flex';
  document.getElementById('bulk-names').value = '';
  document.getElementById('bulk-list').innerHTML = '';
  document.getElementById('bulk-bar').style.width = '0%';
}

function closeBulkUpload() {
  document.getElementById('bulk-zone').style.display = 'none';
}

async function handleBulkFiles(input) {
  const files = Array.from(input.files);
  if (!files.length) return;
  const list = document.getElementById('bulk-list');
  const bar = document.getElementById('bulk-bar');
  const namesText = document.getElementById('bulk-names').value.trim();
  const namesArr = namesText ? namesText.split('\n').map(s => s.trim()).filter(Boolean) : [];
  list.innerHTML = '';
  files.forEach((f) => {
    const item = document.createElement('div');
    item.className = 'bulk-item';
    item.textContent = f.name;
    list.appendChild(item);
  });
  bar.style.width = '100%';
  const processFile = async (file, idx) => {
    try {
      const base64 = await compressImage(file);
      const name = namesArr[idx] || file.name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
      products.push({
        id: Date.now() + idx,
        name, tag: 'General', desc: 'Cargado por carga masiva', icon: '', img: base64
      });
    } catch (err) {
      // silently skip failed image
    }
  };
  await Promise.all(files.map((f, i) => processFile(f, i)));
  populateCategoryFilter();
  renderCatalog();
  renderAdminProducts();
  await Promise.allSettled(
    products.slice(products.length - files.length).map(np =>
      api('/products', { method: 'POST', body: JSON.stringify(np) })
        .then(res => res.json())
        .then(saved => { if (saved.id) np.id = saved.id; })
        .catch(() => {})
    )
  );
  saveLocal();
  originalProducts = JSON.parse(JSON.stringify(products));
  setTimeout(() => { bar.style.width = '0%'; }, 600);
  input.value = '';
}

function saveColors() {
  const colors = {
    '--yellow': document.getElementById('color-yellow').value,
    '--black': document.getElementById('color-black').value,
    '--steel': document.getElementById('color-steel').value,
    '--cream': document.getElementById('color-cream').value,
  };
  const root = document.documentElement;
  for (const [key, val] of Object.entries(colors)) root.style.setProperty(key, val);
  localStorage.setItem('mg_colors', JSON.stringify(colors));
  const msg = document.getElementById('save-msg-color');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 2000);
}

function resetColors() {
  const defaults = { '--yellow': '#F5C800', '--black': '#111111', '--steel': '#1a1a1a', '--cream': '#F5F0E8' };
  const root = document.documentElement;
  for (const [key, val] of Object.entries(defaults)) root.style.setProperty(key, val);
  document.getElementById('color-yellow').value = defaults['--yellow'];
  document.getElementById('color-black').value = defaults['--black'];
  document.getElementById('color-steel').value = defaults['--steel'];
  document.getElementById('color-cream').value = defaults['--cream'];
  localStorage.removeItem('mg_colors');
}

function applyColor(key, value) {
  document.documentElement.style.setProperty(key, value);
}

function updateUnsavedIndicator() {
  const el = document.getElementById('unsaved-indicator');
  if (el) el.style.display = hasUnsavedChanges ? 'inline' : 'none';
}

function syncLocalInfoToInputs() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}'); } catch (e) { return {}; } })();
  const map = { 'cfg-tel': 'tel', 'cfg-wa': 'wa', 'cfg-horario1': 'horario1', 'cfg-horario2': 'horario2', 'cfg-dir': 'dir', 'cfg-wamsg': 'wamsg', 'cfg-admin-user': 'adminUser', 'cfg-admin-pass': 'adminPass' };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el && cfg[key]) el.value = cfg[key];
  }
}

async function saveLocalInfo() {
  const cfg = {
    tel: document.getElementById('cfg-tel')?.value || '',
    wa: document.getElementById('cfg-wa')?.value || '',
    horario1: document.getElementById('cfg-horario1')?.value || '',
    horario2: document.getElementById('cfg-horario2')?.value || '',
    dir: document.getElementById('cfg-dir')?.value || '',
    wamsg: document.getElementById('cfg-wamsg')?.value || ''
  };
  localStorage.setItem('mg_config', JSON.stringify(cfg));
  try {
    await api('/guardar-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
  } catch (e) {
    showToast('No se pudo guardar la config en el servidor', 'error');
  }
  const msg = document.getElementById('save-msg-local');
  if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 2000); }
}

const VENTAJAS_CONFIG = [
  { key: 'rapida', icon: '⚡', defaultTitulo: 'Atención Rápida', defaultDesc: 'Atendemos más rápido que la competencia. Tu tiempo en el campo vale.' },
  { key: 'cta', icon: '🤝', defaultTitulo: 'Cuenta Corriente', defaultDesc: 'Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.' },
  { key: 'precios', icon: '💰', defaultTitulo: 'Mejores Precios', defaultDesc: 'Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.' },
  { key: 'stock', icon: '📦', defaultTitulo: 'Stock Permanente', defaultDesc: 'Amplia disponibilidad de productos para que no pares tu trabajo.' },
  { key: 'exp', icon: '🏆', defaultTitulo: '43 Años de Experiencia', defaultDesc: 'Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.' },
  { key: 'agro', icon: '🌿', defaultTitulo: 'Especialistas en el Agro', defaultDesc: 'Asesoramiento técnico para agroganaderos, molineros y alambradores.' },
];

const SITE_TEXTS_FALLBACKS = {
  'hero_linea_1': 'SIEMPRE JUNTO',
  'hero_linea_2': 'AL CAMPO.',
  'hero_desc': 'Insumos para la agroganader�a, alambrados, molinos, aguadas y ferreter�a. Atención personalizada, precios competitivos y cuenta corriente para nuestros clientes.',
  'hero_numero': '43',
  'hero_etiqueta': 'A�OS EN EL MERCADO',
  'vent_eyebrow': 'POR QU� ELEGIRNOS',
  'vent_titulo_1': 'VENTAJAS',
  'vent_titulo_2': 'METAGRO',
  'vent_card_1_titulo': 'ATENCI�N R�PIDA',
  'vent_card_1_desc': 'Atendemos más r�pido que la competencia. Tu tiempo en el campo vale.',
  'vent_card_2_titulo': 'CUENTA CORRIENTE',
  'vent_card_2_desc': 'Cr�dito para clientes habituales. Compr� hoy y pag� cuando puedas.',
  'vent_card_3_titulo': 'MEJORES PRECIOS',
  'vent_card_3_desc': 'Precios competitivos respaldados por 43 a�os de trayectoria y volumen de compra.',
  'vent_card_4_titulo': 'STOCK PERMANENTE',
  'vent_card_4_desc': 'Amplia disponibilidad de productos para que no pares tu trabajo.',
  'vent_card_5_titulo': '43 A�OS DE EXPERIENCIA',
  'vent_card_5_desc': 'Desde 1983 sirviendo al campo de Entre R�os. Cartera de clientes fiel y reconocida.',
  'vent_card_6_titulo': 'ESPECIALISTAS EN EL AGRO',
  'vent_card_6_desc': 'Asesoramiento técnico para agroganaderos, molineros y alambradores.',
  'cont_eyebrow': 'CONTACTO',
  'cont_titulo_1': '�NECESIT�S UN PRODUCTO?',
  'cont_titulo_2': 'CONSULTANOS.',
  'cont_desc': 'Ya sea para tu estancia, chacra o trabajo profesional, en Metagro SRL te asesoramos sin compromiso. Respondemos r�pido por WhatsApp o por tel�fono.',
  'footer_tagline': 'Siempre junto al campo � Desde 1983'
};

function getSiteTexts() {
  try { return JSON.parse(localStorage.getItem('mg_site_texts') || '{}'); } catch(e) { return {}; }
}

async function loadSiteTextsIntoTab() {
  try {
    const texts = getSiteTexts();
    const get = (key) => texts[key] || SITE_TEXTS_FALLBACKS[key] || '';

    const heroLinea1El = document.getElementById('txt-hero-linea-1');
    const heroLinea2El = document.getElementById('txt-hero-linea-2');
    const heroDescEl = document.getElementById('txt-hero-desc');
    const heroNumeroEl = document.getElementById('txt-hero-numero');
    const heroEtiquetaEl = document.getElementById('txt-hero-etiqueta');

    if (heroLinea1El) heroLinea1El.value = get('hero_linea_1');
    if (heroLinea2El) heroLinea2El.value = get('hero_linea_2');
    if (heroDescEl) heroDescEl.value = get('hero_desc');
    if (heroNumeroEl) heroNumeroEl.value = get('hero_numero');
    if (heroEtiquetaEl) heroEtiquetaEl.value = get('hero_etiqueta');

    const ventEyebrowEl = document.getElementById('txt-vent-eyebrow');
    const ventTitulo1El = document.getElementById('txt-vent-titulo-1');
    const ventTitulo2El = document.getElementById('txt-vent-titulo-2');

    if (ventEyebrowEl) ventEyebrowEl.value = get('vent_eyebrow');
    if (ventTitulo1El) ventTitulo1El.value = get('vent_titulo_1');
    if (ventTitulo2El) ventTitulo2El.value = get('vent_titulo_2');

    const grid = document.getElementById('info-ventajas-grid');
    let ventajasCards = [];
    for (let i = 1; i <= 6; i++) {
      const titulo = get(`vent_card_${i}_titulo`);
      const desc = get(`vent_card_${i}_desc`);
      if (titulo) {
        ventajasCards.push({
          icon: VENTAJAS_CONFIG[i-1]?.icon || '??',
          titulo: titulo,
          descripcion: desc
        });
      }
    }

    if (grid) {
      grid.innerHTML = ventajasCards.map((card, idx) => `
        <div class="ventaja-card" data-index="${idx}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-weight:bold;color:var(--yellow);">Tarjeta #${idx + 1}</span>
            <button onclick="removeVentajaCard(${idx})" style="background:#c0392b;color:#fff;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">?🗑️ Eliminar</button>
          </div>
          <label class="admin-label">�cono (emoji)</label>
          <input class="admin-input ventaja-icon" data-index="${idx}" value="${escapeHtml(card.icon || '')}" placeholder="?" />
          <label class="admin-label">T�tulo</label>
          <input class="admin-input ventaja-titulo" data-index="${idx}" value="${escapeHtml(card.titulo || '')}" placeholder="Atención R�pida" />
          <label class="admin-label">Descripci�n</label>
          <textarea class="admin-textarea ventaja-desc" data-index="${idx}" rows="2">${escapeHtml(card.descripcion || '')}</textarea>
        </div>
      `).join('');
    }
  } catch (e) {
    showToast('Error al cargar los textos', 'error');
    const grid = document.getElementById('info-ventajas-grid');
    if (grid) grid.style.background = '#c0392b';
    console.error('[Leyendas] Error cargando textos:', e);
  }
}

function addVentajaCard() {
  const grid = document.getElementById('info-ventajas-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.ventaja-card');
  const newIndex = cards.length;
  const html = `
    <div class="ventaja-card" data-index="${newIndex}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <span style="font-weight:bold;color:var(--yellow);">Tarjeta #${newIndex + 1}</span>
        <button onclick="removeVentajaCard(${newIndex})" style="background:#c0392b;color:#fff;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">?🗑️ Eliminar</button>
      </div>
      <label class="admin-label">�cono (emoji)</label>
      <input class="admin-input ventaja-icon" data-index="${newIndex}" value="" placeholder="?" />
      <label class="admin-label">T�tulo</label>
      <input class="admin-input ventaja-titulo" data-index="${newIndex}" value="" placeholder="Nuevo beneficio" />
      <label class="admin-label">Descripci�n</label>
      <textarea class="admin-textarea ventaja-desc" data-index="${newIndex}" rows="2"></textarea>
    </div>
  `;
  grid.insertAdjacentHTML('beforeend', html);
}

function removeVentajaCard(index) {
  const card = document.querySelector(`.ventaja-card[data-index="${index}"]`);
  if (card) card.remove();
}

function saveSiteTexts() {
  const texts = getSiteTexts();

  const heroLinea1 = document.getElementById('txt-hero-linea-1');
  const heroLinea2 = document.getElementById('txt-hero-linea-2');
  const heroDesc = document.getElementById('txt-hero-desc');
  const heroNumero = document.getElementById('txt-hero-numero');
  const heroEtiqueta = document.getElementById('txt-hero-etiqueta');

  if (heroLinea1) texts['hero_linea_1'] = heroLinea1.value;
  if (heroLinea2) texts['hero_linea_2'] = heroLinea2.value;
  if (heroDesc) texts['hero_desc'] = heroDesc.value;
  if (heroNumero) texts['hero_numero'] = heroNumero.value;
  if (heroEtiqueta) texts['hero_etiqueta'] = heroEtiqueta.value;

  const ventEyebrow = document.getElementById('txt-vent-eyebrow');
  const ventTitulo1 = document.getElementById('txt-vent-titulo-1');
  const ventTitulo2 = document.getElementById('txt-vent-titulo-2');

  if (ventEyebrow) texts['vent_eyebrow'] = ventEyebrow.value;
  if (ventTitulo1) texts['vent_titulo_1'] = ventTitulo1.value;
  if (ventTitulo2) texts['vent_titulo_2'] = ventTitulo2.value;

  const grid = document.getElementById('info-ventajas-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.ventaja-card');
    const ventajasCards = Array.from(cards).map((card, i) => ({
      icon: card.querySelector('.ventaja-icon')?.value || '',
      titulo: card.querySelector('.ventaja-titulo')?.value || '',
      descripcion: card.querySelector('.ventaja-desc')?.value || ''
    })).filter(c => c.titulo.trim());
    ventajasCards.forEach((card, i) => {
      texts[`vent_card_${i + 1}_titulo`] = card.titulo;
      texts[`vent_card_${i + 1}_desc`] = card.descripcion;
    });
    for (let i = ventajasCards.length + 1; i <= 6; i++) {
      delete texts[`vent_card_${i}_titulo`];
      delete texts[`vent_card_${i}_desc`];
    }
  }

  const prevTexts = getSiteTexts();
  localStorage.setItem('mg_site_texts', JSON.stringify(texts));
  addHistoryEntry(prevTexts, texts);
  fetchAndApplyTexts();
  Object.entries(texts).forEach(([key, value]) => {
    api(`/api/site-texts/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    }).catch(() => {});
  });
  const msg = document.getElementById('save-msg-texts');
  if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 2500); }
  showToast('? Todos los textos guardados');
}

function getSiteTextsHistory() {
  try { return JSON.parse(localStorage.getItem('mg_site_texts_history') || '[]'); } catch(e) { return []; }
}

function addHistoryEntry(prev, next) {
  const history = getSiteTextsHistory();
  const changes = [];
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  keys.forEach(key => {
    const oldVal = (prev && prev[key]) || '';
    const newVal = (next && next[key]) || '';
    if (oldVal !== newVal) {
      changes.push({ key, oldVal, newVal });
    }
  });
  if (changes.length === 0) return;
  history.unshift({
    date: new Date().toISOString(),
    changes
  });
  if (history.length > 50) history.length = 50;
  localStorage.setItem('mg_site_texts_history', JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const container = document.getElementById('info-history');
  if (!container) return;
  const history = getSiteTextsHistory();
  if (!history.length) {
    container.innerHTML = '<p style="color:#666;font-size:.85rem;">Sin cambios registrados</p>';
    return;
  }
  container.innerHTML = history.map(entry => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString('es-AR') + ' ' + d.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});
    const changesHtml = entry.changes.map(c => {
      const label = c.key.replace(/_/g, ' ').toUpperCase();
      return `<div style="margin-bottom:0.4rem;padding:0.4rem;background:#111;border-left:2px solid var(--yellow);font-size:.82rem;">
        <strong style="color:var(--yellow);">${escapeHtml(label)}</strong><br/>
        <span style="color:#888;">Antes:</span> ${escapeHtml(c.oldVal || '(vac�o)')}<br/>
        <span style="color:#4caf50;">Ahora:</span> ${escapeHtml(c.newVal || '(vac�o)')}
      </div>`;
    }).join('');
    return `<div style="margin-bottom:1rem;padding-bottom:0.8rem;border-bottom:1px solid #222;">
      <div style="color:#aaa;font-size:.75rem;margin-bottom:0.4rem;">?? ${dateStr}</div>
      ${changesHtml}
    </div>`;
  }).join('');
}

function fetchAndApplyTexts() {
  const texts = getSiteTexts();
  const get = (key) => texts[key] || SITE_TEXTS_FALLBACKS[key] || '';

  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const linea1 = get('hero_linea_1');
    const linea2 = get('hero_linea_2');
    heroTitle.innerHTML = `${escapeHtml(linea1)}<br/>${escapeHtml(linea2)}`;
  }
  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc) heroDesc.textContent = get('hero_desc');
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = get('hero_eyebrow');
  const heroBtns = document.querySelectorAll('.hero-actions a');
  if (heroBtns[0]) heroBtns[0].textContent = get('hero_btn1') || 'Ver Productos';
  if (heroBtns[1]) heroBtns[1].textContent = get('hero_btn2') || '?? Contactarnos';
  const statNum = document.querySelector('.stat-number');
  if (statNum) statNum.textContent = get('hero_numero');
  const statLabel = document.querySelector('.stat-label');
  if (statLabel) statLabel.textContent = get('hero_etiqueta');

  const ventEyebrow = document.querySelector('#ventajas .section-label');
  if (ventEyebrow) ventEyebrow.textContent = get('vent_eyebrow');
  const ventTitulo = document.querySelector('#ventajas .section-title');
  if (ventTitulo) {
    const t1 = get('vent_titulo_1');
    const t2 = get('vent_titulo_2');
    ventTitulo.innerHTML = `${escapeHtml(t1)} <span>${escapeHtml(t2)}</span>`;
  }

  const ventItems = document.querySelectorAll('.vent-item');
  ventItems.forEach((item, i) => {
    const cardIdx = i + 1;
    const titleEl = item.querySelector('.vent-title');
    const descEl = item.querySelector('.vent-desc');
    const iconEl = item.querySelector('.vent-icon');
    if (titleEl) titleEl.textContent = get(`vent_card_${cardIdx}_titulo`);
    if (descEl) descEl.textContent = get(`vent_card_${cardIdx}_desc`);
    if (iconEl && VENTAJAS_CONFIG[i]) iconEl.textContent = VENTAJAS_CONFIG[i].icon || '';
  });

  const contEyebrow = document.querySelector('#contacto .section-label');
  if (contEyebrow) contEyebrow.textContent = get('cont_eyebrow');
  const contTitle = document.querySelector('#contacto .section-title');
  if (contTitle) {
    const ct1 = get('cont_titulo_1');
    const ct2 = get('cont_titulo_2');
    contTitle.innerHTML = `${escapeHtml(ct1)}<br/>${escapeHtml(ct2)}`;
  }
  const contDesc = document.querySelector('.cta-desc');
  if (contDesc) contDesc.textContent = get('cont_desc');

  const tagline = document.querySelector('.footer-tagline');
  if (tagline) tagline.textContent = get('footer_tagline');
}

function doLogout() {
  if (hasUnsavedChanges && !confirm('Ten�s cambios sin guardar. �Est�s seguro que quer�s salir?')) return;
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  sessionStorage.removeItem('mg_admin_token');
  document.getElementById('adminPanel').classList.remove('open');
}

function openProductModal(p) {
  document.getElementById('modalName').textContent = p.name || '';
  document.getElementById('modalDesc').textContent = p.desc || '';
  document.getElementById('modalTag').textContent = p.tag || 'Producto';
  const imgWrap = document.getElementById('modalImage');
  if (p.img) {
    const iconSafe = escapeHtml(p.icon || '??');
    imgWrap.innerHTML = `<img src="${encodeImgPath(p.img)}" alt="${escapeHtml(p.name || '')}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\'font-size:4rem\\'>${iconSafe}</span>')" />`;
  } else {
    imgWrap.innerHTML = `<span style="font-size:4rem">${escapeHtml(p.icon || '??')}</span>`;
  }
  const waNum = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}').wa || '5403444466919'; } catch(e) { return '5403444466919'; } })();
  const waText = encodeURIComponent(`Hola Metagro! Quiero consultar por: ${p.name || 'producto'}. �Tienen stock y precio?`);
  document.getElementById('modalWa').href = `https://wa.me/${waNum}?text=${waText}`;
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function openAdminLogin() {
  document.getElementById('adminOverlay').classList.add('open');
  document.getElementById('adminUser').focus();
}

function closeAdminLogin() {
  document.getElementById('adminOverlay').classList.remove('open');
}

async function doLogin() {
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value;
  const errEl = document.getElementById('loginError');
  if (!u || !p) { errEl.style.display = 'block'; errEl.textContent = 'Ingres� usuario y contrase�a.'; return; }
  try {
    const res = await api('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem('mg_admin_token', data.token);
      document.getElementById('adminOverlay').classList.remove('open');
      document.getElementById('adminPanel').classList.add('open');
      await fetchProducts();
      originalProducts = JSON.parse(JSON.stringify(products || []));
      renderAdminProducts();
      syncLocalInfoToInputs();
      applyLocalConfig();
      loadSiteTextsIntoTab();
      errEl.style.display = 'none';
    } else {
      errEl.textContent = data.error || 'Usuario o contrase�a incorrectos.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.textContent = 'Error de conexi�n con el servidor.';
    errEl.style.display = 'block';
  }
}

document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    const menu = document.getElementById('navLinks');
    if (menu.classList.contains('open')) toggleMenu();
  });
});

document.getElementById('cat-grid').addEventListener('click', e => {
  const card = e.target.closest('.cat-card');
  if (!card) return;
  const idx = parseInt(card.getAttribute('data-index'), 10);
  if (!isNaN(idx) && products[idx]) openProductModal(products[idx]);
});

function init() {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const panel = document.getElementById('admin-test-panel');
    if (panel) panel.style.display = 'none';
  }
  let defaults = [];
  try {
    defaults = window.DEFAULT_PRODUCTS || [];
    if (!Array.isArray(defaults)) defaults = [];
  } catch (e) { defaults = []; }
  products = [...defaults];
  try {
    const raw = localStorage.getItem('mg_products');
    if (raw) {
      const local = JSON.parse(raw);
      if (Array.isArray(local)) {
        const remoteById = new Map(products.map(p => [String(p.id), p]));
        const merged = [...products];
        for (const p of local) {
          const idx = merged.findIndex(m => String(m.id) === String(p.id));
          if (idx >= 0) merged[idx] = { ...merged[idx], ...p };
          else merged.push(p);
        }
        products = merged;
      }
    }
  } catch (e) { products = [...defaults]; }
  if (!products.length) products = [...defaults];
  saveLocal();
  try {
    const current = JSON.parse(localStorage.getItem('mg_site_texts') || '{}');
    const merged = { ...SITE_TEXTS_FALLBACKS };
    for (const [key, value] of Object.entries(current)) {
      if (value && value.trim()) merged[key] = value;
    }
    localStorage.setItem('mg_site_texts', JSON.stringify(merged));
  } catch (e) {
    localStorage.setItem('mg_site_texts', JSON.stringify(SITE_TEXTS_FALLBACKS));
  }
  populateCategoryFilter();
  renderCatalog();
  const searchEl = document.getElementById('cat-search');
  const filterEl = document.getElementById('cat-filter');
  const clearBtn = document.getElementById('cat-clear');
  if (searchEl) searchEl.addEventListener('input', () => renderCatalog());
  if (filterEl) filterEl.addEventListener('change', () => renderCatalog());
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (searchEl) searchEl.value = '';
    if (filterEl) filterEl.value = '__all__';
    renderCatalog();
  });
  const btt = document.getElementById('backToTop');
  if (btt) {
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btt.classList.toggle('show', window.scrollY > 400);
    });
  }
   if (typeof useApi !== 'undefined' && useApi) fetchProducts();
  syncLocalInfoToInputs();
  fetchAndApplyTexts();
  loadHistory();
}

function initMap() {
  if (typeof L !== 'undefined' && document.getElementById('leaflet-map')) {
    try {
      setTimeout(() => {
        const mapEl = document.getElementById('leaflet-map');
        if (!mapEl || !mapEl.offsetWidth) return;
        const map = L.map('leaflet-map', { zoomControl: true, scrollWheelZoom: false }).setView([-33.1308927, -59.3156888], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        L.marker([-33.1308927, -59.3156888])
          .addTo(map)
          .bindPopup('<b>Metagro SRL</b><br/>Gualeguay, Entre R�os')
          .openPopup();
        setTimeout(() => map.invalidateSize(), 300);
      }, 300);
    } catch (e) { /* map init failed */ }
  }
}

function applyLocalConfig() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}'); } catch(e) { return {}; } })();
  const waBase = 'https://wa.me/' + (cfg.wa || '5403444466919') + '?text=' + encodeURIComponent(cfg.wamsg || 'Hola Metagro!');
  document.querySelectorAll('[data-wa-href]').forEach(el => { el.href = waBase; });
  document.querySelectorAll('[data-tel-href]').forEach(el => {
    el.href = 'tel:+' + (cfg.tel || '5403444466919').replace(/\D/g,'');
    if (el.childNodes.length === 1 && el.firstChild.nodeType === 3) {
      el.textContent = cfg.tel || '03444 - 466919';
    }
  });
  const dirEl = document.querySelector('[data-dir-text]');
  if (dirEl && cfg.dir) dirEl.textContent = cfg.dir;
  const horEl = document.querySelector('[data-horario-text]');
  if (horEl && cfg.horario1 && cfg.horario2) {
    horEl.innerHTML = cfg.horario1 + '<br/>' + cfg.horario2;
  }
}

async function syncFromDB() {
  const btn = document.getElementById('btn-sync-db');
  if (btn) btn.textContent = 'Sincronizando...';
  localStorage.removeItem('mg_products');
  useApi = true;
  await fetchProducts();
  originalProducts = JSON.parse(JSON.stringify(products));
  renderAdminProducts();
  const countEl = document.getElementById('prod-count-bar');
  if (countEl) countEl.textContent = products.length + ' productos cargados';
  if (btn) btn.textContent = 'Sincronizar DB';
  showToast('? ' + products.length + ' productos cargados desde la DB');
}

async function syncToDB() {
  try {
    await api('/sync-to-db', { method: 'POST' });
    showToast('📦 Productos migrados a la base de datos');
  } catch (e) {
    showToast('Error al migrar: ' + (e.message || 'desconocido'), 'error');
  }
}

function switchAdminTab(event, tabId) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

const initApp = () => { init(); initMap(); };
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}
