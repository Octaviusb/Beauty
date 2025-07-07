const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, './db.sqlite'); // ✅ Ruta correcta si estás en /server

if (!fs.existsSync(dbPath)) {
  console.error('❌ Base de datos no encontrada en:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);
console.log('✅ Base de datos abierta correctamente');


db.close();
