console.log('¡El archivo products.js está siendo requerido!'); // Este log está bien

const express = require('express');
const router = express.Router();
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'public', 'productos.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const productos = JSON.parse(fileContents);

  res.status(200).json(productos);
}

// Middleware de autenticación específico para este router
const API_SECRET = 'super-secret-key'; // ¡Debe coincidir con el de admin.js!
const authMiddleware = (req, res, next) => {
  // Se aplica solo a POST, PUT, DELETE
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const secret = req.get('X-Admin-Secret');
    if (secret === API_SECRET) {
      return next();
    }
    return res.status(403).json({ error: 'No autorizado' });
  }
  // Para otros métodos (GET), no se requiere autenticación
  next();
};

// Aplicar el middleware de autenticación a todas las rutas de este archivo
router.use(authMiddleware);

// --- Lógica de conversión de precios ---
const EXCHANGE_RATE_USD_TO_COP = 4000;
const USD_PRICE_THRESHOLD = 1000;

const convertPriceIfNeeded = (price) => {
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) {
    return price; // Devolver el valor original si no es un número
  }
  if (numericPrice < USD_PRICE_THRESHOLD) {
    return Math.round(numericPrice * EXCHANGE_RATE_USD_TO_COP);
  }
  return numericPrice;
};


// Validar campos del producto
const validateProduct = (product) => {
  if (!product.name || !product.category || !product.price) {
    throw new Error('Nombre, categoría y precio son requeridos');
  }
};

// Obtener todos los products
router.get('/', (req, res) => {
  try {
    const stmt = req.db.prepare('SELECT * FROM products');
    const productos = stmt.all();
    res.json(productos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos', detalle: err.message });
  }
});

// Crear producto
router.post('/', (req, res) => {
  try {
    validateProduct(req.body);
    const { name, category, description, image, badge } = req.body;
    const price = convertPriceIfNeeded(req.body.price); // Convertir precio

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
    const { name, category, description, image, badge } = req.body;
    const price = convertPriceIfNeeded(req.body.price); // Convertir precio

    const stmt = req.db.prepare(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ?, badge = ? WHERE id = ?'
    );
    const result = stmt.run(name, category, price, description, image, badge, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

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
