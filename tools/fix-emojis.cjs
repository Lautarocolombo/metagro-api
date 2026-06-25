const fs = require('fs');
const path = require('path');

const root = path.join('C:\\Users\\Lautaro Colombo\\Desktop\\Proyectos\\proyectos en armados\\metagro 2.1');

const files = [
  path.join(root, 'frontend', 'index.html'),
  path.join(root, 'frontend', 'js', 'app.js'),
];

// Reemplazos basados en la auditoría: emojis corruptos por entidades/unicode válidos
const replacements = [
  // Iconos navbar y botones principales
  ['<span class="icon">?</span> WHATSAPP', '<span class="icon">📱</span> WHATSAPP'],
  ['<span class="icon">?</span> ADMIN', '<span class="icon">🔒</span> ADMIN'],
  // Ventajas
  ['<div class="vent-icon">?</div><div class="vent-title">Atención Rápida</div>', '<div class="vent-icon">⚡</div><div class="vent-title">Atención Rápida</div>'],
  ['<div class="vent-icon">??</div><div class="vent-title">Cuenta Corriente</div>', '<div class="vent-icon">💳</div><div class="vent-title">Cuenta Corriente</div>'],
  ['<div class="vent-icon">??</div><div class="vent-title">Mejores Precios</div>', '<div class="vent-icon">💰</div><div class="vent-title">Mejores Precios</div>'],
  ['<div class="vent-icon">??</div><div class="vent-title">Stock Permanente</div>', '<div class="vent-icon">📦</div><div class="vent-title">Stock Permanente</div>'],
  ['<div class="vent-icon">??</div><div class="vent-title">43 Años de Experiencia</div>', '<div class="vent-icon">🏆</div><div class="vent-title">43 Años de Experiencia</div>'],
  ['<div class="vent-icon">??</div><div class="vent-title">Especialistas en el Agro</div>', '<div class="vent-icon">🌾</div><div class="vent-title">Especialistas en el Agro</div>'],
  // Info local iconos
  ['<div class="info-icon">??</div>', '<div class="info-icon">📍</div>'],
  ['<div class="info-icon">??</div>', '<div class="info-icon">📞</div>'],
  ['<div class="info-icon">??</div>', '<div class="info-icon">💬</div>'],
  ['<div class="info-icon">??</div>', '<div class="info-icon">🕒</div>'],
  ['<div class="info-icon">??</div>', '<div class="info-icon">📅</div>'],
  // Acentos y caracteres especiales corruptos (si aparecen como secuencias raras)
  ['Atenci�n', 'Atención'],
  ['m�s', 'más'],
  ['t�cnico', 'técnico'],
  ['cr�dito', 'crédito'],
  ['trayectoria', 'trayectoria'],
  ['Dominio', 'Dominio'],
  ['Pa�s', 'País'],
  ['Rep�blica', 'República'],
  ['versi�n', 'versión'],
  ['informaci�n', 'información'],
  ['p�gina', 'página'],
  ['compa��a', 'compañía'],
  // CTAs y otros emojis
  ['<span class="icon">??</span> Contactarnos', '<span class="icon">✉️</span> Contactarnos'],
  ['<span class="icon">??</span> WhatsApp', '<span class="icon">📱</span> WhatsApp'],
  ['<span class="icon">??</span> 03444', '<span class="icon">📞</span> 03444'],
  ['?? Cerrar', '✕ Cerrar'],
  ['? Nuevo Producto', '✨ Nuevo Producto'],
  ['?? Carga Masiva', '📦 Carga Masiva'],
  ['?? Sincronizar DB', '🔄 Sincronizar DB'],
  ['?? Migrar Todo a DB', '⬆️ Migrar Todo a DB'],
  ['?? Guardar Banner Principal', '💾 Guardar Banner Principal'],
  ['? Tarjetas de Ventajas', '🎯 Tarjetas de Ventajas'],
  ['?? Guardar Ventajas', '💾 Guardar Ventajas'],
  ['?? Historial de Cambios', '📋 Historial de Cambios'],
  ['? Cambios guardados', '✅ Cambios guardados'],
  ['? Productos', '📦 Productos'],
  ['?? Colores', '🎨 Colores'],
  ['?? Info Local', '📍 Info Local'],
  ['?? Leyendas', '📝 Leyendas'],
  ['?? Abrir en Google Maps', '🗺️ Abrir en Google Maps'],
  ['? Eliminar', '🗑️ Eliminar'],
  ['?? Guardar Colores', '🎨 Guardar Colores'],
  ['? Restaurar originales', '↩️ Restaurar originales'],
  ['? Información guardada', '✅ Información guardada'],
  ['?? PANEL LEYENDAS CARGADO', '✅ PANEL LEYENDAS CARGADO'],
  ['?? Consultar por WhatsApp', '📱 Consultar por WhatsApp'],
  // Admin panel
  ['? Eliminar', '🗑️ Eliminar'],
  ['? Agregar Nueva Tarjeta', '➕ Agregar Nueva Tarjeta'],
  ['?? Guardar Todos los Cambios', '💾 Guardar Todos los Cambios'],
  ['?? Cerrar Sesión', '🚪 Cerrar Sesión'],
  ['?? Eliminar producto', '🗑️ Eliminar producto'],
];

const total = [];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [from, to] of replacements) {
    const count = (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count) content = content.split(from).join(to);
  }
  const changed = content !== original;
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    total.push(path.basename(file));
  }
}

console.log('Fixed:', total.join(', ') || 'none');
