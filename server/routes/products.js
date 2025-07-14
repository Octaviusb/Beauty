console.log('¡El archivo products.js está siendo requerido!'); // Este log está bien

const express = require('express');
const router = express.Router();

// **** ATENCIÓN: ASEGÚRATE DE QUE ESTA LÍNEA NO EXISTA ****
// const db = require('../db/db'); // SI ESTÁ AQUÍ, ¡ELIMÍNALA O COMENTALA!
// **********************************************************

// Validar campos del producto
const validateProduct = (product) => {
  if (!product.name || !product.category || !product.price) {
    throw new Error('Nombre, categoría y precio son requeridos');
  }
};

// Obtener todos los products
router.get('/', async (req, res) => {
  console.log('¡/api/products fue llamada y el handler se está ejecutando!');
  try {
    const db = req.db; // Obtener la instancia de la base de datos inyectada
    if (!db) {
      console.error('La instancia de la base de datos no está disponible en req.db');
      return res.status(500).json({ error: 'Error interno del servidor: DB no disponible' });
    }

    console.log('DEBUG products.js: typeof db:', typeof db);
    console.log('DEBUG products.js: db object (partial):', Object.keys(db).slice(0, 50));

    const stmt = db.prepare('SELECT * FROM products');
    const productos = stmt.all();

    console.log('--- Contenido de productos desde la DB (en servidor) ---');
    console.log(productos);
    console.log('-------------------------------------------------------');
    res.json(productos);
  } catch (err) {
    console.error('Error al obtener productos en el servidor:', err);
    res.status(500).json({ error: 'Error al obtener productos', detalle: err.message });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    validateProduct(req.body);
    
    const { name, category, price, description, image, badge } = req.body;
    const stmt = req.db.prepare(
        'INSERT INTO products (name, category, price, description, image, badge) VALUES (?, ?, ?, ?, ?, ?)'
      );
    const result = stmt.run(name, category, price, description, image, badge);
    
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(400).json({ error: err.message });
  }
});

// Actualizar producto
router.put('/:id', (req, res) => {
  try {
    validateProduct(req.body);
    const { id } = req.params;

    // Verificar si el producto existe
    const productStmt = req.db.prepare('SELECT id FROM products WHERE id = ?');
    const product = productStmt.get(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { name, category, price, description, image, badge } = req.body;
    const updateStmt = req.db.prepare(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ?, badge = ? WHERE id = ?'
    );
    const result = updateStmt.run(name, category, price, description, image, badge, id);

    res.json({ updated: result.changes });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(400).json({ error: err.message });
  }
});

// Eliminar producto
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = req.db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ deleted: result.changes });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
