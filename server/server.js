const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rutas API
app.get('/api/products', async (req, res) => {
  try {
    // Intenta obtener productos de Supabase
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      console.log('Error de Supabase:', error);
      
      // Si hay error, intenta leer el archivo JSON local
      const fs = require('fs');
      const productsPath = path.join(__dirname, '../productos.json');
      
      if (fs.existsSync(productsPath)) {
        const productsData = fs.readFileSync(productsPath, 'utf8');
        return res.status(200).json(JSON.parse(productsData));
      } else {
        return res.status(500).json({ error: 'No se pudieron obtener los productos' });
      }
    }
    
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/checkout', (req, res) => {
  const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
  return res.status(200).json({ url: paymentLink });
});

// Ruta para todas las demás solicitudes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

// Para Vercel
module.exports = app;
