// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 8000;

// === Conexión a base de datos SQLite ===
let db;
try {
  db = new Database(path.join(__dirname, 'db.sqlite'), { verbose: console.log });
  db.pragma('journal_mode = WAL');
} catch (err) {
  console.error('❌ Error al conectar con la base de datos:', err);
}

// === Middlewares globales ===
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Inyecta la base de datos a cada solicitud
app.use((req, res, next) => {
  req.db = db;
  next();
});

// === Archivos estáticos ===
app.use(express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/favicon.ico', express.static(path.join(__dirname, '../public/assets/favicon.ico')));

// === Rutas API (comenta si no tienes aún esos archivos en /routes) ===
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api', require('./routes/auth'));
app.use('/api/payments', require('./routes/payments'));


// === Ruta para generar checkout con Wompi (usando link fijo) ===
app.post('/api/checkout', async (req, res) => {
  const { amountInCents, reference } = req.body;

  // Puedes guardar aquí el pedido en tu base de datos si quieres

  // Link fijo generado desde el panel de Wompi
  const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';

  return res.json({ url: paymentLink });
});

// === Manejo global de errores ===
app.use((err, req, res, next) => {
  console.error('❌ Error inesperado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// === Arranque del servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

const { createClient } = require('@supabase/supabase-js');

// Variables desde Vercel (las pondremos luego)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  if (req.method === 'GET' && req.url.includes('/products')) {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(404).json({ error: 'Ruta no encontrada' });
};
