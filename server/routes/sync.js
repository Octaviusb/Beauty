const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Middleware de autenticación
const API_SECRET = 'super-secret-key'; // Debe coincidir con el de admin.js
const authMiddleware = (req, res, next) => {
  const secret = req.get('X-Admin-Secret');
  if (secret === API_SECRET) {
    return next();
  }
  return res.status(403).json({ error: 'No autorizado' });
};

// Ruta para sincronizar productos
router.post('/sync-products', authMiddleware, (req, res) => {
  try {
    const { productos } = req.body;
    
    if (!Array.isArray(productos)) {
      return res.status(400).json({ error: 'Se esperaba un array de productos' });
    }
    
    // Guardar en el archivo JSON
    const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'public', 'productos.json');
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(productos, null, 2));
    
    console.log(`✅ ${productos.length} productos sincronizados con el JSON local`);
    return res.status(200).json({ message: 'Productos sincronizados correctamente' });
  } catch (error) {
    console.error('Error al sincronizar productos:', error);
    return res.status(500).json({ error: 'Error al sincronizar productos' });
  }
});

module.exports = router;