const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error('Error al abrir la base de datos:', err.message);
  }
  console.log('Conectado a la base de datos db.sqlite.');
});

const sql = `ALTER TABLE orders ADD COLUMN reference TEXT`;

db.run(sql, [], function(err) {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      return console.log('La columna "reference" ya existe. No se necesita ninguna acción.');
    }
    return console.error('Error al ejecutar el comando ALTER TABLE:', err.message);
  }
  console.log('¡Éxito! La columna "reference" ha sido añadida a la tabla "orders".');
});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Conexión a la base de datos cerrada.');
});