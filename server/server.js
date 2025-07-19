const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Crear cliente de Supabase si las variables de entorno están disponibles
let supabase;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    console.log('Supabase client initialized');
  } else {
    console.log('Supabase environment variables not found');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

// Función para cargar productos desde el archivo JSON
function loadProductsFromJson() {
  try {
    const productsPath = path.join(process.cwd(), 'public', 'productos.json');
    if (fs.existsSync(productsPath)) {
      const productsData = fs.readFileSync(productsPath, 'utf8');
      return JSON.parse(productsData);
    }
  } catch (error) {
    console.error('Error loading products from JSON:', error);
  }
  return [];
}

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.url.includes('/api/products')) {
      // Intentar obtener productos de Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (!error && data && data.length > 0) {
            return res.status(200).json(data);
          }
        } catch (err) {
          console.error('Supabase error:', err);
        }
      }
      
      // Si no hay Supabase o hay error, usar el archivo JSON
      const products = loadProductsFromJson();
      if (products.length > 0) {
        return res.status(200).json(products);
      }
      
      return res.status(500).json({ error: 'No se pudieron obtener los productos' });
    }

    if (req.url.includes('/api/checkout')) {
      const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
      return res.status(200).json({ url: paymentLink });
    }

    return res.status(404).json({ error: 'Ruta no encontrada' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
