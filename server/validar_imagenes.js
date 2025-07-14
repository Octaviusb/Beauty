const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Ruta a la base de datos
const dbPath = path.resolve(__dirname, './db.sqlite');
const db = new Database(dbPath);

// Ruta a la carpeta /public/images
const imagesRoot = path.resolve(__dirname, '../public');

const productos = db.prepare(`SELECT id, name, image FROM products`).all();

const faltantes = [];

for (const producto of productos) {
  const imagenRelativa = producto.image.startsWith('/')
    ? producto.image.slice(1)
    : producto.image;

  const imagenPath = path.join(imagesRoot, imagenRelativa);

  if (!fs.existsSync(imagenPath)) {
    faltantes.push({
      id: producto.id,
      nombre: producto.name,
      imagen: producto.image,
    });
  }
}

if (faltantes.length === 0) {
  console.log('✅ Todas las imágenes existen.');
} else {
  console.log(`❌ ${faltantes.length} imágenes faltantes:`);
  faltantes.forEach(p =>
    console.log(`- ID ${p.id} | ${p.nombre} | ${p.imagen}`)
  );
}

db.close();