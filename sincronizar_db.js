const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Rutas a los archivos
const productosJsonPath = path.join(__dirname, 'productos.json');
const dbPath = path.join(__dirname, 'server', 'db.sqlite');

console.log('--- Iniciando script de sincronización de la base de datos ---');

let db;
try {
    // 1. Conectar a la base de datos
    db = new Database(dbPath);
    console.log('✅ Conexión a la base de datos establecida.');

    // 2. Leer el archivo productos.json
    const productosData = fs.readFileSync(productosJsonPath, 'utf8');
    const productos = JSON.parse(productosData);
    console.log(`✅ Se leyeron ${productos.length} productos desde productos.json.`);

    // Iniciar una transacción para mayor seguridad y rendimiento
    db.transaction(() => {
        // 3. Borrar todos los datos existentes en la tabla 'products'
        const deleteStmt = db.prepare('DELETE FROM products');
        const info = deleteStmt.run();
        console.log(`✅ Tabla 'products' limpiada. Se eliminaron ${info.changes} registros antiguos.`);

        // 4. Insertar los nuevos productos en la base de datos
        const insertStmt = db.prepare(
            'INSERT INTO products (id, name, category, price, description, image, badge) VALUES (@id, @name, @category, @price, @description, @image, @badge)'
        );

        let insertados = 0;
        for (const producto of productos) {
            insertStmt.run(producto);
            insertados++;
        }
        console.log(`✅ Se insertaron ${insertados} productos nuevos en la base de datos.`);
    })();

    console.log('\n🎉 ¡Sincronización completada! La base de datos ahora refleja el contenido de productos.json.');

} catch (error) {
    console.error('❌ Ocurrió un error fatal durante la sincronización:', error);
} finally {
    // 5. Cerrar la conexión a la base de datos
    if (db) {
        db.close();
        console.log('✅ Conexión a la base de datos cerrada.');
    }
}