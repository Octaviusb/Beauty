const express = require('express');
const router = express.Router();

// Validación simple de entrada
function validateCartItem(item) {
  if (!item.producto_id || !item.nombre || !item.precio || typeof item.cantidad !== 'number') {
    throw new Error('Todos los campos del producto son requeridos');
  }
}

// Obtener el carrito completo
router.get('/', async (req, res) => {
  try {
    const items = req.db.prepare('SELECT * FROM carrito').all();
    res.json(items);
  } catch (err) {
    console.error('Error al obtener carrito:', err);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// Agregar o actualizar un producto en el carrito
router.post('/', async (req, res) => {
  console.log('[POST /api/cart] Body recibido:', req.body);
  try {
    const { producto_id, nombre, precio, cantidad } = req.body;

    validateCartItem({ producto_id, nombre, precio, cantidad });

    const existing = req.db.prepare('SELECT * FROM carrito WHERE producto_id = ?').get(producto_id);

    if (existing) {
      req.db.prepare(`
        UPDATE carrito 
        SET cantidad = cantidad + ? 
        WHERE producto_id = ?
      `).run(cantidad, producto_id);
    } else {
      req.db.prepare(`
        INSERT INTO carrito (producto_id, nombre, precio, cantidad) 
        VALUES (?, ?, ?, ?)
      `).run(producto_id, nombre, precio, cantidad);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error al agregar al carrito:', err);
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un producto del carrito por producto_id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = req.db.prepare('DELETE FROM carrito WHERE producto_id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }
    res.json({ deleted: result.changes });
  } catch (err) {
    console.error('Error al eliminar producto del carrito:', err);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

// Vaciar todo el carrito
router.delete('/', async (req, res) => {
  try {
    const result = req.db.prepare('DELETE FROM carrito').run();
    res.json({ cleared: result.changes });
  } catch (err) {
    console.error('Error al vaciar carrito:', err);
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
});

module.exports = router;
