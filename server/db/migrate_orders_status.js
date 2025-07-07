const path = require('path');
const Database = require('better-sqlite3');

// La ruta a tu base de datos
const dbPath = path.join(__dirname, '../db.sqlite');
const db = new Database(dbPath, { verbose: console.log });

function runMigrations() {
  console.log('Iniciando migraciones para la tabla de pedidos...');

  // Paso 1: Asegurarse de que la tabla 'orders' exista
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        address TEXT,
        items TEXT NOT NULL, -- JSON string
        total REAL NOT NULL,
        status TEXT DEFAULT 'pendiente',
        payment_proof TEXT, -- file path or URL
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('-> Tabla "orders" creada o ya existente.');
  } catch (err) {
    console.error('Error fatal al crear la tabla "orders":', err);
    process.exit(1);
  }

  // Paso 2: Añadir la columna updated_at si no existe
  try {
    db.exec(`
      ALTER TABLE orders ADD COLUMN updated_at DATETIME;
    `);
    console.log('-> Columna "updated_at" añadida con éxito.');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('-> La columna "updated_at" ya existe, omitiendo.');
    } else {
      console.error('Error al añadir la columna "updated_at":', err);
      process.exit(1);
    }
  }

  // Paso 3: Inicializar updated_at con el valor de created_at para registros existentes
  try {
    db.exec(`
      UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;
    `);
    console.log('-> Columna "updated_at" inicializada para registros existentes.');
  } catch (err) {
    console.error('Error al inicializar "updated_at":', err);
    process.exit(1);
  }

  // Paso 4: Cambiar el estado 'pendiente' a 'pendiente_pago'
  try {
    const stmt = db.prepare(`
      UPDATE orders SET status = 'pendiente_pago' WHERE status = 'pendiente';
    `);
    const info = stmt.run();
    console.log(`-> Se actualizaron ${info.changes} registros de 'pendiente' a 'pendiente_pago'.`);
  } catch (err) {
    console.error("Error al actualizar estados a 'pendiente_pago':", err);
    process.exit(1);
  }

  console.log('¡Migraciones de la tabla de pedidos completadas con éxito!');
}

// Ejecutar las migraciones
runMigrations();

// Cerrar la conexión
db.close();