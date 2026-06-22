BEGIN;
-- Producto 1: 08 10 Estiradora
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (1, 'Maquinaria', '08 10 Estiradora', 'Equipo para estirado y mantenimiento de alambrados.', 'Equipo para estirado y mantenimiento de alambrados.', 'productos/08-10-estiradora.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 2: Aislador W
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (2, 'Aisladores', 'Aislador W', 'Marca: Rolin', 'Marca: Rolin', 'productos/Aislador W.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 3: Arreadores
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (3, 'Arreadores', 'Arreadores', 'Modelos de arreadores para diferentes tipos de alambrado.', 'Modelos de arreadores para diferentes tipos de alambrado.', 'productos/Arreador b.jpeg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 3;
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arreador con pilas.jpeg');
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arreador corto y largo.jpeg');
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arreador mango.jpg');
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arreador puas.jpg');
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arreador Tapa Roscada b.jpg');
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arreador.jpg');
INSERT INTO product_images (product_id, url) VALUES (3, 'productos/Arredor Tapa roscada.jpg');
-- Producto 11: Bebedero Cemento
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (11, 'Bebederos', 'Bebedero Cemento', 'Bebedero de cemento para ganado, resistente y durable.', 'Bebedero de cemento para ganado, resistente y durable.', 'productos/bebederos cemento.JPG') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 12: Bobinas Electropiolín
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (12, 'Bobinas', 'Bobinas Electropiolín', 'Electropiolín Rolin · Disponible en 250, 500, 750 y 1000 mts. Standard y Reforzada.', 'Electropiolín Rolin · Disponible en 250, 500, 750 y 1000 mts. Standard y Reforzada.', 'productos/bobina 1000.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 12;
INSERT INTO product_images (product_id, url) VALUES (12, 'productos/bobina 250.jpg');
INSERT INTO product_images (product_id, url) VALUES (12, 'productos/bobina 500.jpg');
INSERT INTO product_images (product_id, url) VALUES (12, 'productos/bobina 750.jpg');
-- Producto 16: Cable Subterráneo Rolin 1.8mm
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (16, 'Cables', 'Cable Subterráneo Rolin 1.8mm', 'Cable subterráneo de 1.8 mm para instalaciones eléctricas rurales.', 'Cable subterráneo de 1.8 mm para instalaciones eléctricas rurales.', 'productos/Cable subterraneo Rolin 1.8mm.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 17: Campanitas
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (17, 'Campanitas', 'Campanitas', 'Campanitas para alambados, con y sin trabas.', 'Campanitas para alambados, con y sin trabas.', 'productos/Campanita.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 17;
INSERT INTO product_images (product_id, url) VALUES (17, 'productos/Campanita con Trabas.jpg');
-- Producto 19: Carreteles
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (19, 'Carreteles', 'Carreteles', 'Carreteles con hilo eléctrico y estructuras metálicas y plásticas. Trípodes disponibles.', 'Carreteles con hilo eléctrico y estructuras metálicas y plásticas. Trípodes disponibles.', 'productos/Carretel con Hilo 500 Mts.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 19;
INSERT INTO product_images (product_id, url) VALUES (19, 'productos/Carretel con Hilo 750 Mts.jpg');
INSERT INTO product_images (product_id, url) VALUES (19, 'productos/Carretel Vacio - Estructura Metal.jpg');
INSERT INTO product_images (product_id, url) VALUES (19, 'productos/Carretel Vacio - Estructura Plastica.jpeg');
INSERT INTO product_images (product_id, url) VALUES (19, 'productos/Tripode para carretel.jpeg');
INSERT INTO product_images (product_id, url) VALUES (19, 'productos/Tripode para carretel 2.jpeg');
INSERT INTO product_images (product_id, url) VALUES (19, 'productos/Tripode para carretel 3.jpeg');
-- Producto 22: Medidores de Batería
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (22, 'General', 'Medidores de Batería', 'Medidores de batería para control eléctrico en instalaciones rurales.', 'Medidores de batería para control eléctrico en instalaciones rurales.', 'productos/Medidor de bateria.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 22;
INSERT INTO product_images (product_id, url) VALUES (22, 'productos/Medidor de bateria 1.jpg');
-- Producto 25: Manijas Aisladas
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (25, 'Aisladores', 'Manijas Aisladas', 'Manijas aisladas con resorte y reforzadas.', 'Manijas aisladas con resorte y reforzadas.', 'productos/Manija Aislada Reforzada.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 25;
INSERT INTO product_images (product_id, url) VALUES (25, 'productos/Manija Aislada con resorte.jpg');
INSERT INTO product_images (product_id, url) VALUES (25, 'productos/Manija Puntera.jpg');
-- Producto 28: Medidores de Batería 1
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (28, 'General', 'Medidores de Batería 1', 'Medidor de batería adicional.', 'Medidor de batería adicional.', 'productos/Medidor de bateria 1.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 30: Pluviómetros
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (30, 'Pluviometros', 'Pluviómetros', 'Pluviómetros chico y grande para medición de lluvia.', 'Pluviómetros chico y grande para medición de lluvia.', 'productos/pluviometro grande.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 30;
INSERT INTO product_images (product_id, url) VALUES (30, 'productos/pluviometro chicho.jpg');
-- Producto 32: Postes de Quebracho
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (32, 'Postes', 'Postes de Quebracho', 'Postes de quebracho natural y colorado para alambados y tranqueras.', 'Postes de quebracho natural y colorado para alambados y tranqueras.', 'productos/Postes Quebracho.JPG') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 32;
INSERT INTO product_images (product_id, url) VALUES (32, 'productos/Poste Quebracho 2.JPG');
INSERT INTO product_images (product_id, url) VALUES (32, 'productos/Postes Quebracho 3.JPG');
INSERT INTO product_images (product_id, url) VALUES (32, 'productos/Pôste quebracho.JPG');
INSERT INTO product_images (product_id, url) VALUES (32, 'productos/postes de quebracho colorado.JPG');
-- Producto 37: Alambre Reforzado
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (37, 'General', 'Alambre Reforzado', 'Alambre de acero reforzado para alambados de gran extensión.', 'Alambre de acero reforzado para alambados de gran extensión.', 'productos/reforzada 500.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 37;
INSERT INTO product_images (product_id, url) VALUES (37, 'productos/reforzada 750.jpg');
-- Producto 39: Regulables
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (39, 'Regulables', 'Regulables', 'Tensores regulables para alambados.', 'Tensores regulables para alambados.', 'productos/Regulable Ajustable.jpeg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 39;
INSERT INTO product_images (product_id, url) VALUES (39, 'productos/Regulable con Gancho y Mariposa.jpeg');
-- Producto 41: Roldana Plástico
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (41, 'Roldanas', 'Roldana Plástico', 'Roldana de plástico para carreteles y herramientas.', 'Roldana de plástico para carreteles y herramientas.', 'productos/Roldana Plastico.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 42: Separador Corto
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (42, 'Separadores', 'Separador Corto', 'Separador corto para alambrados y postes.', 'Separador corto para alambrados y postes.', 'productos/Separador Corto.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
-- Producto 43: Terminales
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (43, 'Terminales', 'Terminales', 'Terminales eléctricos livianos y reforzados para conexiones.', 'Terminales eléctricos livianos y reforzados para conexiones.', 'productos/Terminal Liviano.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 43;
INSERT INTO product_images (product_id, url) VALUES (43, 'productos/Terminal Reforzado.jpg');
-- Producto 45: Torniquetes
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (45, 'Torniquetes', 'Torniquetes', 'Torniquetes Nº 8 y Nº 9, en negro y zincado. Para alambados de más de 50 mts.', 'Torniquetes Nº 8 y Nº 9, en negro y zincado. Para alambados de más de 50 mts.', 'productos/Torniquete Nº8 Negro.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 45;
INSERT INTO product_images (product_id, url) VALUES (45, 'productos/Torniquete Nº8 Zincado.jpg');
INSERT INTO product_images (product_id, url) VALUES (45, 'productos/Torniquete Nº9 Negro.jpeg');
INSERT INTO product_images (product_id, url) VALUES (45, 'productos/Torniquete Nº9Tv Zincado.jpeg');
-- Producto 52: Varillas
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (52, 'Varillas', 'Varillas', 'Varillas con rulos y varilla plástica para alambados.', 'Varillas con rulos y varilla plástica para alambados.', 'productos/Varilla Con 1 Rulo.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 52;
INSERT INTO product_images (product_id, url) VALUES (52, 'productos/Varilla con 2 Rulos.jpg');
INSERT INTO product_images (product_id, url) VALUES (52, 'productos/Varilla Plastica.jpg');
-- Producto 55: Velas Eléctricas
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (55, 'Instalacion Electrica', 'Velas Eléctricas', 'Velas de encendido para instalación eléctrica rural.', 'Velas de encendido para instalación eléctrica rural.', 'productos/Velas Electrico 1.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 55;
INSERT INTO product_images (product_id, url) VALUES (55, 'productos/Velas Eletrico 2.jpg');
-- Producto 57: Voltímetros
INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (57, 'Instalacion Electrica', 'Voltímetros', 'Voltímetros para control de instalaciones eléctricas en campo.', 'Voltímetros para control de instalaciones eléctricas en campo.', 'productos/Voltimetro.jpg') ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;
DELETE FROM product_images WHERE product_id = 57;
INSERT INTO product_images (product_id, url) VALUES (57, 'productos/Voltimetro 1.jpg');
COMMIT;